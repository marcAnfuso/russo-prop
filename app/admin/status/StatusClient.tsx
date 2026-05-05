"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Check,
  AlertCircle,
  Download,
  X,
  Building,
  Bookmark,
  HandCoins,
  Plus,
} from "lucide-react";
import type { StatusRow, PropertyStatus } from "@/lib/status-db";
import { formatPrice } from "@/lib/utils";

export interface StatusPropertyMini {
  id: string;
  code: string;
  address: string;
  locality: string;
  operation: "venta" | "alquiler";
  price: number;
  currency: "USD" | "ARS";
  image: string | null;
}

export interface EnrichedStatusRow extends StatusRow {
  property: StatusPropertyMini | null;
}

interface Props {
  initial: EnrichedStatusRow[];
  counts: { total: number; reserved: number; sold: number };
  pageSize: number;
  pool: StatusPropertyMini[];
}

const STATUS_LABEL: Record<PropertyStatus, string> = {
  active: "Activa",
  reserved: "Reservada",
  sold: "Vendida",
};

const STATUS_BADGE: Record<PropertyStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  reserved: "bg-amber-100 text-amber-800 ring-amber-200",
  sold: "bg-rose-100 text-rose-800 ring-rose-200",
};

export default function StatusClient({ initial, counts: initialCounts, pageSize, pool }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rows, setRows] = useState<EnrichedStatusRow[]>(initial);
  const [counts, setCounts] = useState(initialCounts);
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const queryNormalized = query.trim().replace(/\D+/g, "");
  void pageSize;

  // Pool de propiedades sin override · para que el admin marque una
  // nueva como reservada/vendida desde la barra de búsqueda
  const matchingPoolEntries = useMemo(() => {
    if (!queryNormalized) return [];
    const haveIds = new Set(rows.map((r) => r.xintel_id));
    return pool
      .filter((p) => p.id.includes(queryNormalized) && !haveIds.has(p.id))
      .slice(0, 8);
  }, [queryNormalized, pool, rows]);

  const filteredRows = useMemo(() => {
    let r = rows;
    if (filterStatus !== "all") r = r.filter((x) => x.status === filterStatus);
    if (queryNormalized) r = r.filter((x) => x.xintel_id.includes(queryNormalized));
    return r;
  }, [rows, filterStatus, queryNormalized]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  async function applyStatus(xintelId: string, status: PropertyStatus, note: string | null) {
    setBusyId(xintelId);
    setError(null);
    try {
      const res = await fetch("/api/admin/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xintel_id: xintelId, status, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al guardar");

      setRows((prev) => {
        const idx = prev.findIndex((r) => r.xintel_id === xintelId);
        // active → quitamos del listado (ya no hay override)
        if (status === "active" || data.cleared) {
          if (idx < 0) return prev;
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        }
        // reserved/sold → upsert en local
        const property = pool.find((p) => p.id === xintelId) ?? null;
        const merged: EnrichedStatusRow = { ...data.row, property };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = merged;
          return next;
        }
        return [merged, ...prev];
      });

      // Recalcular contadores localmente
      setCounts((prev) => {
        const before = rows.find((r) => r.xintel_id === xintelId)?.status;
        const next = { ...prev };
        if (before === "reserved") next.reserved = Math.max(0, next.reserved - 1);
        if (before === "sold") next.sold = Math.max(0, next.sold - 1);
        if (before) next.total = Math.max(0, next.total - 1);
        if (status === "reserved") next.reserved += 1;
        if (status === "sold") next.sold += 1;
        if (status !== "active") next.total += 1;
        return next;
      });

      showToast(
        status === "active" ? "Override eliminado" : `Marcada como ${STATUS_LABEL[status]}`
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMigrate() {
    if (!confirm("Migrar las reservadas y vendidas actuales al nuevo sistema. Es seguro · no pisa overrides ya seteados manualmente. ¿Continuar?")) return;
    setMigrating(true);
    setMigrateMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/status/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error en la migración");
      setMigrateMsg(
        `Migración OK · ${data.reserved.inserted} reservadas + ${data.sold.inserted} vendidas insertadas`
      );
      // Recargar la lista desde el server
      const res2 = await fetch("/api/admin/status");
      const fresh = await res2.json();
      const newRows: EnrichedStatusRow[] = (fresh.rows as StatusRow[]).map((r) => ({
        ...r,
        property: pool.find((p) => p.id === r.xintel_id) ?? null,
      }));
      setRows(newRows);
      setCounts(fresh.counts);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setMigrating(false);
    }
  }

  function clearSearch(e?: FormEvent) {
    e?.preventDefault();
    setQuery("");
  }

  return (
    <div className="space-y-5">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <CounterCard
          label="Total con override"
          value={counts.total}
          color="navy"
        />
        <CounterCard label="Reservadas" value={counts.reserved} color="amber" />
        <CounterCard label="Vendidas" value={counts.sold} color="rose" />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código RUS · ej: 10755"
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                aria-label="Limpiar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1 rounded-lg border border-gray-200 p-1 bg-gray-50">
            {(["all", "reserved", "sold"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterStatus === s
                    ? "bg-white text-navy shadow-sm"
                    : "text-gray-500 hover:text-navy"
                }`}
              >
                {s === "all" ? "Todas" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleMigrate}
            disabled={migrating}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Importar las reservadas/vendidas que ya estén en Xintel o en el sistema viejo (idempotente · no pisa overrides existentes)"
          >
            {migrating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Migrar inicial
          </button>
        </div>

        {migrateMsg && (
          <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{migrateMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Sugerencias del pool · cuando el usuario busca un código que aún no tiene override */}
        {matchingPoolEntries.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Agregar nuevo override
            </p>
            <ul className="space-y-1.5">
              {matchingPoolEntries.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-2.5 py-2"
                >
                  {p.image ? (
                    <div className="relative h-10 w-14 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={p.image} alt={p.code} fill sizes="56px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">
                      <span className="font-mono-price tabular-nums text-magenta mr-1.5">
                        {p.code}
                      </span>
                      {p.address}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {p.locality} · {p.operation === "venta" ? "Venta" : "Alquiler"} ·{" "}
                      {p.currency === "USD" ? "USD" : "$"} {formatPrice(p.price)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => applyStatus(p.id, "reserved", null)}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-semibold hover:bg-amber-200 disabled:opacity-50"
                    >
                      <Bookmark className="h-3 w-3" />
                      Reservar
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStatus(p.id, "sold", null)}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 px-2.5 py-1 text-xs font-semibold hover:bg-rose-200 disabled:opacity-50"
                    >
                      <HandCoins className="h-3 w-3" />
                      Vender
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Lista de overrides actuales */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredRows.length === 0 ? (
          <div className="p-10 text-center">
            <Plus className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {rows.length === 0
                ? 'No hay overrides activos. Buscá un código RUS arriba o ejecutá "Migrar inicial".'
                : "Ningún override coincide con el filtro."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredRows.map((row) => (
              <li key={row.xintel_id} className="px-4 py-3 flex items-center gap-3">
                {row.property?.image ? (
                  <div className="relative h-12 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={row.property.image}
                      alt={row.property.code}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">
                    <span className="font-mono-price tabular-nums text-magenta mr-1.5">
                      RUS{row.xintel_id}
                    </span>
                    {row.property?.address ?? "(no en feed actual)"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {row.property?.locality && `${row.property.locality} · `}
                    {row.updated_by && `por ${row.updated_by} · `}
                    {new Date(row.updated_at).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full ring-1 ring-inset px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[row.status]}`}
                >
                  {STATUS_LABEL[row.status]}
                </span>

                <div className="flex gap-1 flex-shrink-0">
                  {row.status !== "reserved" && (
                    <button
                      type="button"
                      onClick={() => applyStatus(row.xintel_id, "reserved", row.note)}
                      disabled={busyId === row.xintel_id}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 px-2 py-1 text-[11px] font-semibold hover:bg-amber-100 ring-1 ring-amber-200 disabled:opacity-50"
                      title="Marcar como Reservada"
                    >
                      <Bookmark className="h-3 w-3" />
                      Reservar
                    </button>
                  )}
                  {row.status !== "sold" && (
                    <button
                      type="button"
                      onClick={() => applyStatus(row.xintel_id, "sold", row.note)}
                      disabled={busyId === row.xintel_id}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-800 px-2 py-1 text-[11px] font-semibold hover:bg-rose-100 ring-1 ring-rose-200 disabled:opacity-50"
                      title="Marcar como Vendida"
                    >
                      <HandCoins className="h-3 w-3" />
                      Vender
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => applyStatus(row.xintel_id, "active", null)}
                    disabled={busyId === row.xintel_id}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 px-2 py-1 text-[11px] font-semibold hover:bg-emerald-100 ring-1 ring-emerald-200 disabled:opacity-50"
                    title="Volver a estado activo (limpia el override)"
                  >
                    <Check className="h-3 w-3" />
                    Activar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function CounterCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "navy" | "amber" | "rose";
}) {
  const colorMap = {
    navy: "text-navy",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
