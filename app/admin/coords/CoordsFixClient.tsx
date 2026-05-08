"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wand2,
  Trash2,
  ExternalLink,
  MapPin,
} from "lucide-react";

interface SuspectRow {
  id: string;
  code: string;
  address: string;
  locality: string;
  currentLat: number;
  currentLng: number;
  reason: string;
  distanceKm?: number;
  hasOverride: boolean;
}

interface OverrideRow {
  xintel_id: string;
  lat: number;
  lng: number;
  source: string;
  notes: string | null;
  geocoded_at: string;
}

interface ApiResponse {
  ok: boolean;
  suspects: SuspectRow[];
  overrides: OverrideRow[];
  counts: {
    total: number;
    suspects: number;
    overridden: number;
    pending: number;
  };
}

const PRICE_PER_CALL_USD = 0.005;

export default function CoordsFixClient() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coords-fix");
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Error");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runBatch(ids?: string[]) {
    if (
      !ids &&
      !confirm(
        `Vas a geocodificar ${data?.counts.pending ?? 0} propiedades sospechosas con Google. Costo aprox: USD ${(
          (data?.counts.pending ?? 0) * PRICE_PER_CALL_USD
        ).toFixed(3)}. ¿Continuar?`
      )
    )
      return;
    setRunning(true);
    setRunResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/coords-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids ? { ids, force: true } : {}),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Error");
      setRunResult(
        `Procesadas ${d.processed} · ${d.geocoded} geocodificadas OK · ${d.failed} sin resultado`
      );
      await load();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(false);
    }
  }

  async function deleteOverride(xintelId: string) {
    if (!confirm(`¿Borrar el override de RUS${xintelId}? Vuelve a usar las coords de Xintel.`))
      return;
    try {
      const res = await fetch(`/api/admin/coords-fix?id=${encodeURIComponent(xintelId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al borrar");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-red-600 py-12 text-center">
        {error ?? "No se pudo cargar"}
      </div>
    );
  }

  const estimatedCost = (data.counts.pending * PRICE_PER_CALL_USD).toFixed(3);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total catálogo" value={data.counts.total} />
        <StatCard
          label="Sospechosas"
          value={data.counts.suspects}
          highlight={data.counts.suspects > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Ya corregidas"
          value={data.counts.overridden}
          highlight="emerald"
        />
        <StatCard
          label="Pendientes"
          value={data.counts.pending}
          highlight={data.counts.pending > 0 ? "rose" : undefined}
        />
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => runBatch()}
            disabled={running || data.counts.pending === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-magenta text-white px-4 py-2 text-sm font-semibold hover:bg-magenta-600 disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Corregir las {data.counts.pending} pendientes (~USD {estimatedCost})
          </button>

          <button
            type="button"
            onClick={load}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recargar
          </button>
        </div>

        {runResult && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            {runResult}
          </div>
        )}

        {error && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Lista de sospechosas */}
      {data.suspects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-gray-700 font-semibold">
            No hay propiedades con coordenadas sospechosas.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Todas están dentro del bounding box y cerca del barrio declarado.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-navy">
              Sospechosas detectadas ({data.suspects.length})
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {data.suspects.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50"
              >
                <span
                  className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                    s.hasOverride
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.hasOverride ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">
                    <span className="font-mono-price tabular-nums text-magenta mr-1.5">
                      {s.code}
                    </span>
                    {s.address}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span>{s.locality}</span>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">
                      {s.reason === "fuera_bbox"
                        ? "fuera de zona"
                        : s.reason === "lejos_barrio"
                        ? `${s.distanceKm?.toFixed(1)} km del barrio`
                        : s.reason}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      {s.currentLat.toFixed(4)}, {s.currentLng.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${s.currentLat},${s.currentLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-magenta hover:underline"
                    >
                      ver en mapa
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>
                {!s.hasOverride && (
                  <button
                    type="button"
                    onClick={() => runBatch([s.id])}
                    disabled={running}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-magenta hover:bg-magenta-50 px-2 py-1 rounded disabled:opacity-50"
                    title="Geocodificar solo esta"
                  >
                    <Wand2 className="h-3 w-3" />
                    Corregir
                  </button>
                )}
                {s.hasOverride && (
                  <button
                    type="button"
                    onClick={() => deleteOverride(s.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded"
                    title="Borrar override · usar coords de Xintel"
                  >
                    <Trash2 className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de overrides ya aplicados (si los hay y no aparecen como sospechosos) */}
      {data.overrides.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-navy">
              Overrides activos en DB ({data.overrides.length})
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {data.overrides.slice(0, 30).map((o) => (
              <li key={o.xintel_id} className="px-4 py-2 flex items-center gap-3 text-xs">
                <span className="font-mono-price tabular-nums text-magenta">
                  RUS{o.xintel_id}
                </span>
                <span className="font-mono text-gray-500">
                  {o.lat.toFixed(4)}, {o.lng.toFixed(4)}
                </span>
                <span className="text-gray-400">{o.source}</span>
                <span className="ml-auto text-gray-400">
                  {new Date(o.geocoded_at).toLocaleDateString("es-AR")}
                </span>
                <button
                  type="button"
                  onClick={() => deleteOverride(o.xintel_id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="Borrar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "amber" | "emerald" | "rose";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const cls = highlight
    ? colors[highlight]
    : "bg-white text-navy border-gray-100";
  return (
    <div className={`rounded-2xl border shadow-sm p-4 ${cls}`}>
      <p className="text-[11px] uppercase tracking-wider font-semibold opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
