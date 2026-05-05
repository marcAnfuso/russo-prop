"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Film, Video, Instagram, ExternalLink, Heart, Home, Key, MapPin } from "lucide-react";
import type { MediaPick } from "@/lib/media-picks";
import { getEmbedUrl } from "@/lib/media-picks";

type Filter = "all" | "campana" | "tour" | "otro";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Todos",
  campana: "La campana",
  tour: "Tours",
  otro: "Otros",
};

type ReactionEmoji = "heart" | "home" | "key";

interface ReactionCounts {
  heart: number;
  home: number;
  key: number;
}

export interface EnrichedMediaPick extends MediaPick {
  reactions: ReactionCounts;
  property: { code: string; address: string; locality: string } | null;
}

const REACTED_KEY_PREFIX = "russo_reacted_";

function loadUserReactions(mediaId: string): Set<ReactionEmoji> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${REACTED_KEY_PREFIX}${mediaId}`);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as ReactionEmoji[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveUserReactions(mediaId: string, set: Set<ReactionEmoji>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${REACTED_KEY_PREFIX}${mediaId}`,
      JSON.stringify(Array.from(set))
    );
  } catch {
    // ignore
  }
}

export default function HistoriasClient({ items }: { items: EnrichedMediaPick[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, campana: 0, tour: 0, otro: 0 };
    for (const i of items) c[i.category as Filter]++;
    return c;
  }, [items]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Momentos
            </p>
            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight">
              Historias que{" "}
              <span className="italic text-magenta">compartimos</span>.
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
              Nuevos dueños tocando la campana, propiedades recorridas en video,
              el detrás de escena de cada operación. Todo lo que pasa en Russo
              que no cabe en una foto.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => {
                const active = filter === f;
                const count = counts[f];
                if (f !== "all" && count === 0) return null;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                      active
                        ? "border-magenta bg-magenta text-white shadow-sm"
                        : "border-navy-100 text-navy hover:border-magenta hover:text-magenta"
                    }`}
                  >
                    {f === "campana" && <Bell className="h-3.5 w-3.5" />}
                    {f === "tour" && <Film className="h-3.5 w-3.5" />}
                    {f === "otro" && <Video className="h-3.5 w-3.5" />}
                    {FILTER_LABELS[f]}
                    <span
                      className={`ml-1 text-[11px] tabular-nums ${
                        active ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function MediaCard({ item }: { item: EnrichedMediaPick }) {
  const embed = getEmbedUrl(item.url);

  // Estado optimista de reacciones · arranca con lo del server, después
  // localStorage manda quiénes ya reaccionó este device
  const [counts, setCounts] = useState<ReactionCounts>(item.reactions);
  const [mine, setMine] = useState<Set<ReactionEmoji>>(new Set());
  const [busy, setBusy] = useState<ReactionEmoji | null>(null);

  useEffect(() => {
    setMine(loadUserReactions(item.id));
  }, [item.id]);

  async function toggle(emoji: ReactionEmoji) {
    if (busy) return;
    const has = mine.has(emoji);
    const action: "add" | "remove" = has ? "remove" : "add";

    // Optimista
    const nextMine = new Set(mine);
    if (has) nextMine.delete(emoji);
    else nextMine.add(emoji);
    setMine(nextMine);
    saveUserReactions(item.id, nextMine);
    setCounts((c) => ({ ...c, [emoji]: Math.max(0, c[emoji] + (has ? -1 : 1)) }));
    setBusy(emoji);

    try {
      const res = await fetch("/api/historias/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: item.id, emoji, action }),
      });
      const data = await res.json();
      if (res.ok && data.counts) {
        // Sync con valor real del server
        setCounts(data.counts);
      }
    } catch {
      // revert si falla red
      const revertMine = new Set(mine);
      setMine(revertMine);
      saveUserReactions(item.id, revertMine);
      setCounts(item.reactions);
    } finally {
      setBusy(null);
    }
  }

  return (
    <figure className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {embed ? (
        <div className="relative w-full bg-black" style={{ aspectRatio: "9/16" }}>
          <iframe
            src={embed}
            className="absolute inset-0 w-full h-full"
            title={item.title ?? "Video de Russo Propiedades"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[9/16] bg-gray-50 flex items-center justify-center text-sm text-gray-400 p-4 text-center">
          No pudimos embeber este video.
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-magenta mt-2"
          >
            Abrir en {item.platform} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <figcaption className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full ${
              item.category === "campana"
                ? "bg-magenta-50 text-magenta"
                : item.category === "tour"
                ? "bg-navy-50 text-navy"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {item.category === "campana" ? (
              <Bell className="h-4 w-4" />
            ) : item.category === "tour" ? (
              <Film className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy leading-snug">
              {item.title ??
                (item.category === "campana"
                  ? "Tocaron la campana"
                  : item.category === "tour"
                  ? "Tour por la propiedad"
                  : "Video de Russo")}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-magenta transition-colors mt-0.5"
            >
              {item.platform === "instagram" ? (
                <Instagram className="h-3 w-3" />
              ) : (
                <Video className="h-3 w-3" />
              )}
              Ver en {item.platform === "otro" ? "la plataforma" : item.platform}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Reacciones */}
        <div className="flex items-center gap-1.5 pt-1">
          <ReactionButton
            emoji="heart"
            count={counts.heart}
            active={mine.has("heart")}
            busy={busy === "heart"}
            onClick={() => toggle("heart")}
          />
          <ReactionButton
            emoji="home"
            count={counts.home}
            active={mine.has("home")}
            busy={busy === "home"}
            onClick={() => toggle("home")}
          />
          <ReactionButton
            emoji="key"
            count={counts.key}
            active={mine.has("key")}
            busy={busy === "key"}
            onClick={() => toggle("key")}
          />
        </div>

        {/* Linkeo a propiedad */}
        {item.property && (
          <Link
            href={`/propiedad/${item.property_id}`}
            className="group flex items-start gap-2 rounded-lg bg-gray-50 hover:bg-magenta-50 transition-colors px-3 py-2 -mx-1"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta mt-0.5">
              <MapPin className="h-3 w-3" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 group-hover:text-magenta transition-colors">
                Esta es la propiedad
              </p>
              <p className="text-xs text-navy truncate">
                <span className="font-mono-price tabular-nums text-magenta mr-1">
                  {item.property.code}
                </span>
                {item.property.address} · {item.property.locality}
              </p>
            </div>
          </Link>
        )}
      </figcaption>
    </figure>
  );
}

function ReactionButton({
  emoji,
  count,
  active,
  busy,
  onClick,
}: {
  emoji: ReactionEmoji;
  count: number;
  active: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const Icon = emoji === "heart" ? Heart : emoji === "home" ? Home : Key;
  const colorActive =
    emoji === "heart"
      ? "bg-rose-50 text-rose-600 border-rose-200"
      : emoji === "home"
      ? "bg-magenta-50 text-magenta border-magenta-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-60 ${
        active
          ? colorActive
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-navy"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-full bg-magenta-50 text-magenta flex items-center justify-center mb-4">
        <Bell className="h-6 w-6" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-navy mb-2">
        Pronto: historias en video
      </h2>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        Russo sube videos del día a día en Instagram. En breve los vamos a
        traer acá para que los veas sin salir del sitio.
      </p>
    </div>
  );
}
