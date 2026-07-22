"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Etiqueta plural por tipo · si hay varios tipos o subtipo, "propiedades". */
const TYPE_PLURAL: Record<string, string> = {
  casa: "casas",
  departamento: "departamentos",
  ph: "PHs",
  terreno: "terrenos",
  cochera: "cocheras",
  local: "locales",
  oficina: "oficinas",
  edificio: "edificios",
  galpon: "galpones",
  negocio: "negocios",
  quinta: "quintas",
  campo: "campos",
};

function nounFor(propertyType: string, count: number): string {
  const parts = propertyType.split(",").filter(Boolean);
  if (parts.length === 1 && !parts[0].includes(":")) {
    const plural = TYPE_PLURAL[parts[0]];
    if (plural) return plural;
  }
  return count === 1 ? "propiedad" : "propiedades";
}

/**
 * Sugerencia cross-operación: cuando la búsqueda/filtros del usuario matchean
 * propiedades en la OTRA operación, ofrece saltar preservando la búsqueda.
 * Resuelve "busco un galpón (o una calle) en Comprar y no aparece porque en
 * realidad está en Alquiler". El conteo lo da /api/cross-op-search con los
 * mismos matchers que FilterBar.
 *
 * - variant="empty":  caja grande, va en el empty-state (0 resultados).
 * - variant="banner": línea fina arriba de la lista (hay resultados, pero
 *   igual conviene avisar que la otra operación también tiene).
 */
export default function CrossOpSuggestion({
  currentOperation,
  query,
  propertyType,
  zonesCsv,
  variant = "empty",
}: {
  currentOperation: "venta" | "alquiler";
  query: string;
  propertyType: string;
  /** zonas como CSV (string estable · evita refetch por identidad de array). */
  zonesCsv: string;
  variant?: "empty" | "banner";
}) {
  const otherOp = currentOperation === "venta" ? "alquiler" : "venta";
  const [count, setCount] = useState<number | null>(null);

  const hasCriteria = Boolean(query || propertyType || zonesCsv);

  useEffect(() => {
    if (!hasCriteria) return;
    const params = new URLSearchParams();
    params.set("operation", otherOp);
    if (query) params.set("q", query);
    if (propertyType) params.set("type", propertyType);
    if (zonesCsv) params.set("zones", zonesCsv);

    let alive = true;
    fetch(`/api/cross-op-search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setCount(typeof d?.count === "number" ? d.count : 0);
      })
      .catch(() => {
        if (alive) setCount(0);
      });
    return () => {
      alive = false;
    };
  }, [otherOp, query, propertyType, zonesCsv, hasCriteria]);

  // Gateamos también por hasCriteria: si el usuario limpió la búsqueda, no
  // reseteamos el count dentro del effect (evita setState sincrónico), así
  // que el guard acá esconde cualquier conteo viejo.
  if (!hasCriteria || !count || count <= 0) return null;

  const base = otherOp === "alquiler" ? "/alquileres" : "/ventas";
  const params = new URLSearchParams();
  if (propertyType) params.set("type", propertyType);
  if (zonesCsv) params.set("zones", zonesCsv);
  if (query) params.set("q", query);
  const href = params.toString() ? `${base}?${params.toString()}` : base;

  const opLabel = otherOp === "alquiler" ? "alquiler" : "venta";
  const noun = nounFor(propertyType, count);

  /* ---- Banner fino (hay resultados en la op actual, pero la otra también) ---- */
  if (variant === "banner") {
    return (
      <a
        href={href}
        className="group mb-4 flex items-center justify-between gap-3 rounded-lg border border-magenta/40 bg-magenta-50/60 px-3.5 py-2 text-sm transition-colors hover:bg-magenta hover:text-white"
      >
        <span className="font-medium text-magenta group-hover:text-white">
          También hay {count} {noun} en {opLabel}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-magenta group-hover:text-white">
          Ver en {opLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>
    );
  }

  /* ---- Caja grande para el empty-state (0 resultados) ---- */
  return (
    <a
      href={href}
      className="group mb-6 flex items-center justify-between gap-3 rounded-xl border-2 border-magenta bg-magenta-50 px-4 py-3 text-left transition-colors hover:bg-magenta hover:text-white"
    >
      <span className="text-sm font-semibold text-magenta group-hover:text-white">
        {count === 1
          ? `Hay 1 ${noun === "propiedades" ? "propiedad" : noun.replace(/s$/, "")} en ${opLabel} que coincide`
          : `Hay ${count} ${noun} en ${opLabel} que coinciden`}
        <span className="block text-xs font-normal text-magenta/70 group-hover:text-white/80">
          Tu búsqueda es de {currentOperation === "venta" ? "venta" : "alquiler"} · probá en {opLabel}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 flex-shrink-0 text-magenta transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
    </a>
  );
}
