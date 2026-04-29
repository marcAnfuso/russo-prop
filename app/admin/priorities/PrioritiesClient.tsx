"use client";

import { useMemo, useState, useTransition, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Loader2, Check, AlertCircle, Download } from "lucide-react";
import type { PriorityRow } from "@/lib/priorities-db";

interface PropertyMini {
  id: string;
  code: string;
  address: string;
  locality: string;
  operation: "venta" | "alquiler";
  price: number;
  currency: "USD" | "ARS";
  image: string | null;
}

export interface EnrichedPriorityRow extends PriorityRow {
  property: PropertyMini | null;
}

interface Props {
  initial: EnrichedPriorityRow[];
  totalAll: number;
  pageSize: number;
  pool: PropertyMini[];
}

export default function PrioritiesClient({ initial, totalAll, pageSize, pool }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rows, setRows] = useState<EnrichedPriorityRow[]>(initial);
  const [offset, setOffset] = useState(initial.length);
  const [total, setTotal] = useState(totalAll);
  const [loadingMore, setLoadingMore] = useState(false);

  const [query, setQuery] = useState("");
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Buscador → primero busca en filas ya cargadas, después en pool de Xintel
  const queryNormalized = query.trim().replace(/\D+/g, "");
  const matchingPoolEntries = useMemo(() => {
    if (!queryNormalized) return [];
    const haveIds = new Set(rows.map((r) => r.xintel_id));
    return pool
      .filter((p) => p.id.includes(queryNormalized) && !haveIds.has(p.id))
      .slice(0, 8);
  }, [queryNormalized, pool, rows]);

  const filteredRows = useMemo(() => {
    if (!queryNormalized) return rows;
    return rows.filter((r) => r.xintel_id.includes(queryNormalized));
  }, [rows, queryNormalized]);

  async function handleSave(xintelId: string, priority: number, note: string | null) {
    setError(null);
    try {
      const res = await fetch("/api/admin/priorities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xintel_id: xintelId, priority, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al guardar");
      // Refrescamos la fila localmente · si era nueva la sumamos.
      setRows((prev) => {
        const idx = prev.findIndex((r) => r.xintel_id === xintelId);
        const property = pool.find((p) => p.id === xintelId) ?? null;
        const merged: EnrichedPriorityRow = { ...data.row, property };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = merged;
          return next.sort((a, b) => b.priority - a.priority);
        }
        return [merged, ...prev].sort((a, b) => b.priority - a.priority);
      });
      // Aumentar total si era nueva
      const wasNew = !rows.find((r) => r.xintel_id === xintelId);
      if (wasNew) {
        setTotal((t) => t + 1);
        setOffset((o) => o + 1);
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  async function handleDelete(xintelId: string) {
    if (!confirm(`¿Quitar la prioridad de RUS${xintelId}?`)) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/priorities?xintel_id=${encodeURIComponent(xintelId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al eliminar");
      setRows((prev) => prev.filter((r) => r.xintel_id !== xintelId));
      setTotal((t) => Math.max(0, t - 1));
      setOffset((o) => Math.max(0, o - 1));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/priorities?offset=${offset}&limit=${pageSize}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al cargar");
      const newRows = (data.rows as PriorityRow[]).map((r) => ({
        ...r,
        property: pool.find((p) => p.id === r.xintel_id) ?? null,
      }));
      setRows((prev) => [...prev, ...newRows]);
      setOffset((o) => o + newRows.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSeed() {
    if (!confirm("¿Importar prioridades de Xintel? Sólo agrega las que no tienen override en la DB; no pisa nada.")) return;
    setSeedRunning(true);
    setSeedMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/priorities/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al importar");
      setSeedMsg(`Importadas ${data.inserted} de ${data.candidates} candidatas (${data.skipped} ya estaban).`);
      startTransition(() => router.refresh());
      // Recargar primera página
      const r2 = await fetch(`/api/admin/priorities?offset=0&limit=${pageSize}`);
      const d2 = await r2.json();
      const fresh = (d2.rows as PriorityRow[]).map((r) => ({
        ...r,
        property: pool.find((p) => p.id === r.xintel_id) ?? null,
      }));
      setRows(fresh);
      setOffset(fresh.length);
      setTotal(d2.totalAll ?? d2.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSeedRunning(false);
    }
  }

  const hasMore = offset < total && !queryNormalized;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Buscar por código RUS
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: 10755 o RUS10755"
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seedRunning}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:border-navy-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {seedRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Importar de Xintel
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {total} {total === 1 ? "propiedad con prioridad" : "propiedades con prioridad"}
      </div>

      {seedMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="h-3.5 w-3.5" />
          {seedMsg}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Sugerencias del buscador (props sin prioridad) */}
      {matchingPoolEntries.length > 0 && (
        <div className="rounded-xl border border-dashed border-magenta/40 bg-magenta/5 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-magenta">
            Sin prioridad — agregar
          </p>
          <ul className="divide-y divide-magenta/10">
            {matchingPoolEntries.map((p) => (
              <AddRow
                key={p.id}
                property={p}
                onSave={(priority) => handleSave(p.id, priority, null)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Tabla principal */}
      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 text-sm">
          {queryNormalized
            ? "Ninguna propiedad con prioridad coincide con esa búsqueda."
            : "Todavía no hay prioridades cargadas. Importá las de Xintel o agregá manualmente."}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold w-20">Foto</th>
                <th className="text-left px-4 py-3 font-semibold">Propiedad</th>
                <th className="text-right px-4 py-3 font-semibold w-32">Prioridad</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <PriorityRowItem
                  key={r.xintel_id}
                  row={r}
                  onSave={(priority) => handleSave(r.xintel_id, priority, r.note)}
                  onDelete={() => handleDelete(r.xintel_id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-navy hover:border-magenta hover:text-magenta transition-colors disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ver más
          </button>
        </div>
      )}
    </div>
  );
}

function AddRow({
  property,
  onSave,
}: {
  property: PropertyMini;
  onSave: (priority: number) => Promise<void>;
}) {
  const [priority, setPriority] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(priority);
    if (!Number.isFinite(n) || n < 0) return;
    setSaving(true);
    try {
      await onSave(Math.round(n));
      setPriority("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="py-2">
      <form onSubmit={submit} className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">
            {property.code} · {property.address}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {property.locality} · {property.operation === "venta" ? "Venta" : "Alquiler"} · {property.currency}{" "}
            {formatPrice(property.price)}
          </p>
        </div>
        <input
          type="number"
          min={0}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          placeholder="Prioridad"
          className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:border-magenta"
          required
        />
        <button
          type="submit"
          disabled={saving || !priority}
          className="inline-flex items-center gap-1 rounded-full bg-magenta text-white px-3 py-1.5 text-xs font-semibold hover:bg-magenta-600 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Agregar
        </button>
      </form>
    </li>
  );
}

function PriorityRowItem({
  row,
  onSave,
  onDelete,
}: {
  row: EnrichedPriorityRow;
  onSave: (priority: number) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [value, setValue] = useState(String(row.priority));
  const [saving, setSaving] = useState(false);
  const dirty = String(row.priority) !== value;

  async function commit() {
    if (!dirty) return;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      setValue(String(row.priority));
      return;
    }
    setSaving(true);
    try {
      await onSave(Math.round(n));
    } finally {
      setSaving(false);
    }
  }

  const p = row.property;

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 align-middle">
        {p?.image ? (
          <div className="relative h-12 w-16 rounded overflow-hidden bg-gray-100">
            <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-16 rounded bg-gray-100" />
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        <p className="text-sm font-semibold text-navy">
          RUS{row.xintel_id}
          {p && (
            <span className="ml-2 text-[10px] uppercase tracking-widest text-gray-400">
              {p.operation === "venta" ? "Venta" : "Alquiler"}
            </span>
          )}
        </p>
        {p ? (
          <p className="text-xs text-gray-500 truncate max-w-[400px]">
            {p.address} · {p.locality} · {p.currency} {formatPrice(p.price)}
          </p>
        ) : (
          <p className="text-xs text-amber-600">
            Propiedad no encontrada en Xintel actualmente
          </p>
        )}
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={saving}
          className={`w-20 rounded-lg border px-2 py-1.5 text-sm text-right outline-none transition-colors ${
            dirty ? "border-magenta" : "border-gray-300"
          } focus:border-magenta`}
        />
        {saving && <Loader2 className="inline-block ml-1 h-3 w-3 animate-spin text-magenta" />}
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
          aria-label={`Quitar prioridad de RUS${row.xintel_id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function formatPrice(n: number): string {
  if (n >= 9999999) return "Reservado";
  return new Intl.NumberFormat("es-AR").format(n);
}
