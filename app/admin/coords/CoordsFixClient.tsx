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
  ChevronDown,
  Check,
  X,
  Undo2,
} from "lucide-react";

interface SuspectRow {
  id: string;
  code: string;
  address: string;
  locality: string;
  type: string;
  currentLat: number;
  currentLng: number;
  reason: string;
  distanceKm?: number;
  specialCase?: boolean;
  specialReason?: string;
}

interface OverrideRow {
  xintel_id: string;
  lat: number;
  lng: number;
  original_lat: number | null;
  original_lng: number | null;
  source: string;
  status: "pending" | "applied" | "ignored";
  notes: string | null;
  geocoded_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  code: string;
  address: string;
  locality: string;
  type: string;
  specialCase?: boolean;
  specialReason?: string;
}

function SpecialCaseBadge({ reason }: { reason?: string }) {
  if (!reason) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      title="Russo suele cargar coords manualmente para este barrio o tipo · revisar con cuidado antes de aplicar"
    >
      ⚠ posible caso especial · {reason}
    </span>
  );
}

interface ApiResponse {
  ok: boolean;
  suspects: SuspectRow[];
  pending: OverrideRow[];
  applied: OverrideRow[];
  ignored: OverrideRow[];
  counts: {
    total: number;
    suspects: number;
    pending: number;
    applied: number;
    ignored: number;
  };
}

const PRICE_PER_CALL_USD = 0.005;
const PAGE_SIZE = 10;

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const lat1 = toRad(a.lat),
    lat2 = toRad(b.lat);
  const dLat = lat2 - lat1;
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function CoordsFixClient() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Paginación
  const [pendingShown, setPendingShown] = useState(PAGE_SIZE);
  const [appliedShown, setAppliedShown] = useState(PAGE_SIZE);
  const [ignoredShown, setIgnoredShown] = useState(PAGE_SIZE);
  const [showApplied, setShowApplied] = useState(false);
  const [showIgnored, setShowIgnored] = useState(false);

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

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function generatePreviews() {
    if (!data) return;
    if (
      !confirm(
        `Vas a geocodificar ${data.counts.suspects} propiedades sospechosas con Google. Costo aprox: USD ${(
          data.counts.suspects * PRICE_PER_CALL_USD
        ).toFixed(3)}.\n\nQuedan en estado "pendiente" hasta que las apruebes una por una. ¿Continuar?`
      )
    )
      return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coords-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Error");
      flashToast(`${d.geocoded} previews generados · ${d.failed} sin resultado`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(false);
    }
  }

  async function previewOne(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/coords-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Error");
      flashToast(d.geocoded > 0 ? "Preview generado" : "Sin resultado de Google");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function reviewAction(id: string, action: "approve" | "ignore") {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/coords-fix", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Error");
      flashToast(action === "approve" ? "Aplicada" : "Marcada como ignorada");
      await load();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteOverride(id: string) {
    if (!confirm(`¿Borrar el registro de RUS${id}? Si era sospechosa, vuelve a aparecer en la lista.`))
      return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coords-fix?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al borrar");
      flashToast("Registro borrado");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando catálogo...
      </div>
    );
  }
  if (!data) {
    return <div className="text-sm text-red-600 py-12 text-center">{error ?? "No se pudo cargar"}</div>;
  }

  const pendingPaged = data.pending.slice(0, pendingShown);
  const appliedPaged = data.applied.slice(0, appliedShown);
  const ignoredPaged = data.ignored.slice(0, ignoredShown);
  const estimatedCost = (data.counts.suspects * PRICE_PER_CALL_USD).toFixed(3);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total catálogo" value={data.counts.total} />
        <StatCard
          label="Sospechosas (sin preview)"
          value={data.counts.suspects}
          highlight={data.counts.suspects > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Pendientes revisión"
          value={data.counts.pending}
          highlight={data.counts.pending > 0 ? "rose" : undefined}
        />
        <StatCard label="Aplicadas" value={data.counts.applied} highlight="emerald" />
        <StatCard label="Ignoradas" value={data.counts.ignored} />
      </div>

      {/* Acciones globales */}
      {data.counts.suspects > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={generatePreviews}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg bg-magenta text-white px-4 py-2 text-sm font-semibold hover:bg-magenta-600 disabled:opacity-50"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Generar preview de las {data.counts.suspects} sospechosas (~USD {estimatedCost})
            </button>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Recargar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Después de geocodificar, cada propuesta queda en{" "}
            <strong>"Pendiente revisión"</strong> hasta que la apruebes una por una.
            Las propiedades de Canning, Ciudad Evita, 9 de Abril, campos y quintas
            aparecen con el badge <strong>"posible caso especial"</strong> porque
            suelen tener coords cargadas a mano por la inmobiliaria · revisalas con
            cuidado antes de aplicar.
          </p>
        </div>
      )}

      {error && (
        <div className="inline-flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Lista de sospechosas SIN preview todavía */}
      {data.suspects.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-navy">
              Sospechosas sin preview ({data.suspects.length})
            </p>
            <span className="ml-auto text-[11px] text-gray-400">
              click "Geocodificar" para generar la propuesta
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {data.suspects.slice(0, 50).map((s) => (
              <li key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="font-mono-price tabular-nums text-magenta text-xs flex-shrink-0">
                  {s.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-navy truncate">{s.address}</p>
                    {s.specialCase && <SpecialCaseBadge reason={s.specialReason} />}
                  </div>
                  <p className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span>{s.locality}</span>
                    <span className="text-amber-700 font-semibold">
                      {s.reason === "fuera_bbox"
                        ? "fuera de zona"
                        : `${s.distanceKm?.toFixed(1)} km del barrio`}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${s.currentLat},${s.currentLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-magenta hover:underline inline-flex items-center gap-0.5"
                    >
                      ver en mapa <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => previewOne(s.id)}
                  disabled={busyId === s.id || running}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-magenta hover:bg-magenta-50 px-2 py-1 rounded disabled:opacity-50"
                >
                  {busyId === s.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  Geocodificar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pendientes revisión · una por una con preview */}
      {data.pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-magenta" />
            <p className="text-sm font-semibold text-navy">
              Pendientes de revisión ({data.pending.length})
            </p>
            <span className="ml-auto text-[11px] text-gray-400">
              comparar coord actual vs propuesta
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {pendingPaged.map((o) => {
              const distance =
                o.original_lat != null && o.original_lng != null
                  ? haversineKm(
                      { lat: o.original_lat, lng: o.original_lng },
                      { lat: o.lat, lng: o.lng }
                    )
                  : null;
              return (
                <li key={o.xintel_id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-navy">
                          <span className="font-mono-price tabular-nums text-magenta mr-1.5">
                            {o.code}
                          </span>
                          {o.address}
                          <span className="text-gray-500 font-normal ml-1.5">
                            · {o.locality}
                          </span>
                        </p>
                        {o.specialCase && <SpecialCaseBadge reason={o.specialReason} />}
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 mb-0.5">
                            Coord actual (Xintel)
                          </p>
                          <p className="text-xs font-mono text-gray-700">
                            {o.original_lat?.toFixed(5)}, {o.original_lng?.toFixed(5)}
                          </p>
                          {o.original_lat != null && o.original_lng != null && (
                            <a
                              href={`https://www.google.com/maps?q=${o.original_lat},${o.original_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-magenta hover:underline inline-flex items-center gap-0.5 mt-1"
                            >
                              ver en mapa <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 mb-0.5">
                            Coord propuesta (Google)
                          </p>
                          <p className="text-xs font-mono text-gray-700">
                            {o.lat.toFixed(5)}, {o.lng.toFixed(5)}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${o.lat},${o.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-magenta hover:underline inline-flex items-center gap-0.5 mt-1"
                          >
                            ver en mapa <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                      {o.notes && (
                        <p className="text-[11px] text-gray-500 mt-1.5">
                          <strong>Google:</strong> {o.notes}
                        </p>
                      )}
                      {distance != null && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Distancia entre las dos coords: {distance.toFixed(2)} km
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => reviewAction(o.xintel_id, "ignore")}
                      disabled={busyId === o.xintel_id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Dejar datos de Xintel
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewAction(o.xintel_id, "approve")}
                      disabled={busyId === o.xintel_id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyId === o.xintel_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Aplicar coord de Google
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {data.pending.length > pendingShown && (
            <div className="border-t border-gray-100 p-3 text-center">
              <button
                type="button"
                onClick={() => setPendingShown((n) => n + PAGE_SIZE)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Ver más ({data.pending.length - pendingShown} restantes)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Aplicadas (collapsable) */}
      {data.applied.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowApplied((v) => !v)}
            className="w-full px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-left hover:bg-gray-50"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-navy">
              Aplicadas ({data.applied.length})
            </p>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 ml-auto transition-transform ${
                showApplied ? "rotate-180" : ""
              }`}
            />
          </button>
          {showApplied && (
            <>
              <ul className="divide-y divide-gray-100">
                {appliedPaged.map((o) => (
                  <li
                    key={o.xintel_id}
                    className="px-4 py-2 flex items-center gap-3 text-xs"
                  >
                    <span className="font-mono-price tabular-nums text-magenta">
                      {o.code}
                    </span>
                    <span className="text-navy truncate flex-1">{o.address}</span>
                    <span className="font-mono text-gray-500">
                      {o.lat.toFixed(4)}, {o.lng.toFixed(4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => reviewAction(o.xintel_id, "ignore")}
                      disabled={busyId === o.xintel_id}
                      title="Cambiar a ignorada (vuelve a usar coord de Xintel)"
                      className="text-gray-400 hover:text-amber-600 p-1"
                    >
                      <Undo2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOverride(o.xintel_id)}
                      title="Borrar registro"
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              {data.applied.length > appliedShown && (
                <div className="border-t border-gray-100 p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setAppliedShown((n) => n + PAGE_SIZE)}
                    className="text-xs font-semibold text-gray-600 hover:text-navy"
                  >
                    Ver más ({data.applied.length - appliedShown})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Ignoradas (collapsable) */}
      {data.ignored.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowIgnored((v) => !v)}
            className="w-full px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-left hover:bg-gray-50"
          >
            <X className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-semibold text-navy">
              Ignoradas ({data.ignored.length})
            </p>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 ml-auto transition-transform ${
                showIgnored ? "rotate-180" : ""
              }`}
            />
          </button>
          {showIgnored && (
            <>
              <ul className="divide-y divide-gray-100">
                {ignoredPaged.map((o) => (
                  <li
                    key={o.xintel_id}
                    className="px-4 py-2 flex items-center gap-3 text-xs"
                  >
                    <span className="font-mono-price tabular-nums text-magenta">
                      {o.code}
                    </span>
                    <span className="text-navy truncate flex-1">{o.address}</span>
                    <button
                      type="button"
                      onClick={() => reviewAction(o.xintel_id, "approve")}
                      disabled={busyId === o.xintel_id}
                      title="Aplicar coord de Google"
                      className="text-gray-400 hover:text-emerald-600 p-1"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOverride(o.xintel_id)}
                      title="Borrar (vuelve a aparecer si sigue sospechosa)"
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              {data.ignored.length > ignoredShown && (
                <div className="border-t border-gray-100 p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setIgnoredShown((n) => n + PAGE_SIZE)}
                    className="text-xs font-semibold text-gray-600 hover:text-navy"
                  >
                    Ver más ({data.ignored.length - ignoredShown})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {data.counts.suspects === 0 && data.counts.pending === 0 && data.counts.applied === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-gray-700 font-semibold">
            No hay propiedades con coordenadas sospechosas.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Todas están dentro del bounding box y cerca del barrio declarado.
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-medium shadow-xl">
          {toast}
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
  const cls = highlight ? colors[highlight] : "bg-white text-navy border-gray-100";
  return (
    <div className={`rounded-2xl border shadow-sm p-3 ${cls}`}>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 leading-tight">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
