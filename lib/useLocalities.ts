"use client";

import { useEffect, useState } from "react";

export interface LocalityEntry {
  name: string;
  count: number;
}

const FALLBACK: LocalityEntry[] = [
  { name: "Ciudad Evita", count: 0 },
  { name: "El Palomar", count: 0 },
  { name: "González Catán", count: 0 },
  { name: "Gregorio de Laferrere", count: 0 },
  { name: "Haedo", count: 0 },
  { name: "Isidro Casanova", count: 0 },
  { name: "La Tablada", count: 0 },
  { name: "Lagos de Canning", count: 0 },
  { name: "Lomas del Mirador", count: 0 },
  { name: "Morón", count: 0 },
  { name: "Rafael Castillo", count: 0 },
  { name: "Ramos Mejía", count: 0 },
  { name: "San Justo", count: 0 },
  { name: "Villa Luzuriaga", count: 0 },
  { name: "Villa Sarmiento", count: 0 },
];

let cache: LocalityEntry[] | null = null;
let inflight: Promise<LocalityEntry[]> | null = null;

async function load(): Promise<LocalityEntry[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("bad response");
      const data = (await res.json()) as { localities?: LocalityEntry[] };
      const list = data.localities?.length ? data.localities : FALLBACK;
      cache = list;
      return list;
    } catch {
      cache = FALLBACK;
      return FALLBACK;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Hook that returns barrios Russo has listings in, with counts. */
export function useLocalities(): LocalityEntry[] {
  const [list, setList] = useState<LocalityEntry[]>(cache ?? FALLBACK);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    load().then((l) => {
      if (alive) setList(l);
    });
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

/**
 * Rank locality matches: prefix > word-start > substring.
 * Returns entries matching query, best first. Excludes ones already selected.
 */
export function rankLocalityMatches(
  entries: LocalityEntry[],
  query: string,
  excluded: string[] = []
): LocalityEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return entries.filter((e) => !excluded.includes(e.name));
  }
  const scored: { entry: LocalityEntry; score: number }[] = [];
  for (const entry of entries) {
    if (excluded.includes(entry.name)) continue;
    const name = entry.name.toLowerCase();
    let score: number;
    if (name.startsWith(q)) {
      score = 0;
    } else if (name.split(/\s+/).some((word) => word.startsWith(q))) {
      score = 1;
    } else if (name.includes(q)) {
      score = 2;
    } else {
      continue;
    }
    scored.push({ entry, score });
  }
  return scored
    .sort(
      (a, b) =>
        a.score - b.score || a.entry.name.localeCompare(b.entry.name, "es")
    )
    .map((s) => s.entry);
}
