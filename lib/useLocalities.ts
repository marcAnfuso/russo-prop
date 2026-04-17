"use client";

import { useEffect, useState } from "react";

const FALLBACK: string[] = [
  "Ciudad Evita",
  "El Palomar",
  "González Catán",
  "Gregorio de Laferrere",
  "Haedo",
  "Isidro Casanova",
  "La Tablada",
  "Lagos de Canning",
  "Lomas del Mirador",
  "Morón",
  "Rafael Castillo",
  "Ramos Mejía",
  "San Justo",
  "Villa Luzuriaga",
  "Villa Sarmiento",
];

let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function load(): Promise<string[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("bad response");
      const data = (await res.json()) as { localities?: string[] };
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

/** Hook that returns the list of barrios Russo actually has listings in. */
export function useLocalities(): string[] {
  const [list, setList] = useState<string[]>(cache ?? FALLBACK);
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
