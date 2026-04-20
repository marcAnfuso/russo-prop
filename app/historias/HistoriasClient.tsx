"use client";

import { useMemo, useState } from "react";
import { Bell, Film, Video, Instagram, ExternalLink } from "lucide-react";
import type { MediaPick } from "@/lib/media-picks";
import { getEmbedUrl } from "@/lib/media-picks";

type Filter = "all" | "campana" | "tour" | "otro";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Todos",
  campana: "La campana",
  tour: "Tours",
  otro: "Otros",
};

export default function HistoriasClient({ items }: { items: MediaPick[] }) {
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

function MediaCard({ item }: { item: MediaPick }) {
  const embed = getEmbedUrl(item.url);
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

      <figcaption className="p-4 flex items-start gap-3">
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
      </figcaption>
    </figure>
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
