"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";

type Tipo = "casa" | "departamento" | "ph";
type RoomsBucket = "1" | "2" | "3" | "4";

interface MarketBucket {
  count: number;
  priceFrom: number;
  priceTo: number;
  pricePerSqM: number;
}

type MarketAggregate = Record<
  string,
  Record<string, Record<string, MarketBucket>>
>;

const TIPO_LABELS: Record<Tipo, string> = {
  casa: "Casa",
  departamento: "Departamento",
  ph: "PH",
};

const AMBIENTES: RoomsBucket[] = ["1", "2", "3", "4"];

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function MarketExplorer() {
  const [data, setData] = useState<MarketAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [barrio, setBarrio] = useState<string>("");
  const [tipo, setTipo] = useState<Tipo>("casa");
  const [ambientes, setAmbientes] = useState<RoomsBucket>("3");

  useEffect(() => {
    let alive = true;
    fetch("/api/market")
      .then((r) => r.json())
      .then((res: { aggregate?: MarketAggregate }) => {
        if (!alive) return;
        setData(res.aggregate ?? {});
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setData({});
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Barrios with any residential data, sorted
  const barrios = useMemo(() => {
    if (!data) return [];
    return Object.keys(data).sort((a, b) => a.localeCompare(b, "es"));
  }, [data]);

  // Default barrio = first one with data
  useEffect(() => {
    if (!barrio && barrios.length) setBarrio(barrios[0]);
  }, [barrio, barrios]);

  // Tipos available for the selected barrio
  const tiposForBarrio = useMemo(() => {
    if (!data || !barrio) return [];
    return Object.keys(data[barrio] ?? {}).filter(
      (t): t is Tipo => t === "casa" || t === "departamento" || t === "ph"
    );
  }, [data, barrio]);

  // Keep tipo valid when barrio changes
  useEffect(() => {
    if (!tiposForBarrio.length) return;
    if (!tiposForBarrio.includes(tipo)) setTipo(tiposForBarrio[0]);
  }, [tiposForBarrio, tipo]);

  // Rooms available for selected barrio × tipo
  const roomsAvailable = useMemo(() => {
    if (!data || !barrio || !tipo) return new Set<string>();
    return new Set(Object.keys(data[barrio]?.[tipo] ?? {}));
  }, [data, barrio, tipo]);

  // Keep ambientes valid
  useEffect(() => {
    if (!roomsAvailable.size) return;
    if (!roomsAvailable.has(ambientes)) {
      setAmbientes(Array.from(roomsAvailable).sort()[0] as RoomsBucket);
    }
  }, [roomsAvailable, ambientes]);

  const bucket = data?.[barrio]?.[tipo]?.[ambientes] ?? null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Explorador de precios
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy max-w-2xl">
            ¿Cuánto sale vivir acá?
            <br />
            <span className="italic text-gray-400">
              Datos reales de nuestro inventario.
            </span>
          </h2>
        </div>

        <div className="rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(26,34,81,0.15)] overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-navy text-white p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mb-1">
                Inventario Russo · Xintel
              </p>
              <h3 className="font-display text-2xl font-semibold">
                Rangos de precio por barrio
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {loading ? "Cargando…" : "Actualizado hoy"}
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Barrio
              </span>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                disabled={!barrios.length}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta transition-colors disabled:opacity-50"
              >
                {barrios.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Tipo
              </span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Tipo)}
                disabled={!tiposForBarrio.length}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta transition-colors disabled:opacity-50"
              >
                {tiposForBarrio.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Ambientes
              </span>
              <div className="flex gap-1.5">
                {AMBIENTES.map((a) => {
                  const available = roomsAvailable.has(a);
                  const active = a === ambientes;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => available && setAmbientes(a)}
                      disabled={!available}
                      className={`rounded-lg border px-3 py-2 text-sm transition-all duration-150 active:scale-[0.97] ${
                        active
                          ? "border-magenta bg-magenta-50 text-magenta font-semibold shadow-sm"
                          : available
                          ? "border-gray-200 text-navy hover:border-navy-300 hover:bg-gray-50"
                          : "border-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {a === "4" ? "4+" : a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result */}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-magenta animate-spin" />
            </div>
          ) : !bucket ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                <Info className="h-5 w-5" />
              </div>
              <p className="text-navy font-medium">
                No tenemos suficientes propiedades en esta combinación.
              </p>
              <p className="text-sm text-gray-500 max-w-sm">
                Probá con otro barrio, tipo o cantidad de ambientes. Solo mostramos
                rangos donde tenemos al menos 2 listados activos.
              </p>
            </div>
          ) : (
            <>
              <div className="p-8 grid sm:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3 font-medium">
                    Rango · {TIPO_LABELS[tipo]} {ambientes}
                    {ambientes === "4" ? "+" : ""} amb. · {barrio}
                  </p>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">desde</p>
                      <p className="font-mono-price text-4xl lg:text-5xl font-bold text-navy leading-none">
                        USD{" "}
                        <span className="text-magenta">
                          {formatUSD(bucket.priceFrom)}
                        </span>
                      </p>
                    </div>
                    <span className="text-2xl text-gray-300 font-light">—</span>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">hasta</p>
                      <p className="font-mono-price text-4xl lg:text-5xl font-bold text-navy leading-none">
                        USD{" "}
                        <span className="text-magenta">
                          {formatUSD(bucket.priceTo)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sm:justify-self-end">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3 font-medium">
                    Metodología
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                    Rango P10–P90 sobre{" "}
                    <span className="font-semibold text-navy">
                      {bucket.count}
                    </span>{" "}
                    listados activos. Se excluyen outliers evidentes para que el
                    valor refleje el mercado típico, no los extremos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100">
                <div className="p-5 text-center">
                  <p className="font-mono-price text-2xl font-bold text-navy">
                    {bucket.pricePerSqM > 0
                      ? `USD ${bucket.pricePerSqM.toLocaleString("es-AR")}`
                      : "—"}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                    mediana por m²
                  </p>
                </div>
                <div className="p-5 text-center">
                  <p className="font-mono-price text-2xl font-bold text-navy">
                    {bucket.count}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                    listados activos
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 max-w-xl mx-auto">
          Datos agregados en tiempo real desde el inventario de Russo Propiedades
          en Xintel. Se actualizan cada 30 minutos.
        </p>
      </div>
    </section>
  );
}
