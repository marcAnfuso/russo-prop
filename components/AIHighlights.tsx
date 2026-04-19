"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface Highlight {
  icon?: string;
  text: string;
}

interface AIHighlightsProps {
  propertyId: string;
}

export default function AIHighlights({ propertyId }: AIHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    fetch(`/api/ai/highlights?id=${encodeURIComponent(propertyId)}`)
      .then((r) => r.json())
      .then((data: { ok?: boolean; highlights?: Highlight[] }) => {
        if (!alive) return;
        if (data.ok && Array.isArray(data.highlights)) {
          setHighlights(data.highlights);
        } else {
          setFailed(true);
        }
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId]);

  // Quietly hide the whole block if there's nothing useful to show.
  if (failed) return null;
  if (!loading && (!highlights || highlights.length === 0)) return null;

  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-4">
        <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
        Lo que necesitás saber
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-magenta to-magenta-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ml-1">
          <Sparkles className="h-3 w-3" />
          IA
        </span>
      </h2>

      {loading ? (
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 animate-pulse"
            >
              <span className="h-4 w-4 rounded-full bg-gray-200" />
              <span className="h-3 flex-1 max-w-[70%] bg-gray-200 rounded" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {highlights!.map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-magenta/30 transition-colors"
            >
              {h.icon && (
                <span className="text-xl leading-tight flex-shrink-0">
                  {h.icon}
                </span>
              )}
              <span className="text-sm text-navy leading-snug">{h.text}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
        Resumen generado automáticamente de la descripción que carga Russo en Xintel.
        Para detalles exactos siempre consultá con un agente.
      </p>
    </section>
  );
}
