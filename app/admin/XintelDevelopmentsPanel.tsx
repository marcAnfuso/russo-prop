"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Eye, EyeOff, ExternalLink, RefreshCw } from "lucide-react";
import type { Development } from "@/data/types";

interface Props {
  initial: Development[];
  initialHiddenIds: string[];
}

const STATUS_LABEL: Record<string, string> = {
  "pre-venta": "Pre-venta",
  pozo: "Pozo",
  "en-construccion": "En construcción",
  terminado: "Terminado",
};

export default function XintelDevelopmentsPanel({ initial, initialHiddenIds }: Props) {
  const [items] = useState<Development[]>(initial);
  const [hidden, setHidden] = useState<Set<string>>(new Set(initialHiddenIds));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flashToast = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  }, []);

  async function toggleVisibility(id: string, name: string) {
    const isHidden = hidden.has(id);
    const previous = new Set(hidden);
    const next = new Set(hidden);
    if (isHidden) next.delete(id);
    else next.add(id);
    setHidden(next);
    setBusyId(id);
    setError(null);
    try {
      const res = isHidden
        ? await fetch(
            `/api/admin/picks?property_id=${encodeURIComponent(id)}&list=development_hidden`,
            { method: "DELETE" }
          )
        : await fetch("/api/admin/picks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ property_id: id, list: "development_hidden" }),
          });
      if (!res.ok) throw new Error();
      flashToast(isHidden ? `Mostrar "${name}"` : `"${name}" oculta del sitio`);
    } catch {
      // Revert
      setHidden(previous);
      setError("No se pudo guardar el cambio");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-magenta/10 text-magenta">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy">Emprendimientos</h2>
            <p className="text-xs text-gray-500">
              Cargados en Xintel · {items.length} en total ·{" "}
              {items.length - hidden.size} visibles en el sitio.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 max-w-sm flex items-start gap-1.5">
          <RefreshCw className="h-3 w-3 mt-0.5 flex-shrink-0" />
          La data viene directo de Xintel. Para editarla, modificá la ficha en Xintel
          (cambios reflejan en ~30 min).
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => {
          const isHidden = hidden.has(d.id);
          return (
            <div
              key={d.id}
              className={`rounded-xl border overflow-hidden flex flex-col transition-opacity ${
                isHidden ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 bg-white"
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100 relative">
                {d.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.images[0]}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                    Sin imagen
                  </div>
                )}
                <span className="absolute top-2 left-2 inline-block rounded-full bg-navy/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
                {isHidden && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <EyeOff className="h-2.5 w-2.5" /> Oculto
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-mono text-gray-400">{d.code}</p>
                  <a
                    href={`/emprendimiento/${d.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-400 hover:text-magenta inline-flex items-center gap-0.5"
                    title="Ver en el sitio"
                  >
                    Ver <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <p className="font-semibold text-navy text-sm leading-tight">{d.name}</p>
                <p className="text-xs text-gray-500">
                  {d.locality}
                  {d.district && d.district !== d.locality ? `, ${d.district}` : ""}
                </p>
                <p className="text-xs text-gray-600 mt-auto">
                  {d.priceFrom > 0 || d.priceTo > 0
                    ? `USD ${d.priceFrom.toLocaleString()} – ${d.priceTo.toLocaleString()}`
                    : "Consultar precio"}
                </p>
                <button
                  type="button"
                  disabled={busyId === d.id}
                  onClick={() => toggleVisibility(d.id, d.name)}
                  className={`mt-1 inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    isHidden
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {isHidden ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Mostrar en el sitio
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Ocultar del sitio
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
}

// Mejor UX cuando initialHiddenIds cambia (refresh externo)
export function _useHiddenSync(_p: Props) {
  // placeholder export para evitar warning si en el futuro se ajusta
  void _p;
}
