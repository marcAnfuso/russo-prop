"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  AlertCircle,
  Filter,
  RefreshCw,
  Bot,
  AlertTriangle,
} from "lucide-react";
import type { RussiaLogRow, RussiaStats } from "@/lib/russia-logs";

interface Props {
  initialRows: RussiaLogRow[];
  initialTotal: number;
  stats: RussiaStats;
  pageSize: number;
}

// Pricing aproximado de Gemini 2.5 Flash · USD por 1M tokens
const PRICE_INPUT_PER_MILLION = 0.3;
const PRICE_OUTPUT_PER_MILLION = 2.5;

export default function RussiaLogsClient({
  initialRows,
  initialTotal,
  stats,
  pageSize,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState<RussiaLogRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [filterIp, setFilterIp] = useState<string | null>(null);
  const [filterError, setFilterError] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const estimatedCost30d = useMemo(() => {
    const input = (stats.inputTokens30d / 1_000_000) * PRICE_INPUT_PER_MILLION;
    const output = (stats.outputTokens30d / 1_000_000) * PRICE_OUTPUT_PER_MILLION;
    return input + output;
  }, [stats.inputTokens30d, stats.outputTokens30d]);

  async function fetchPage(p: number) {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("limit", String(pageSize));
      sp.set("offset", String((p - 1) * pageSize));
      if (query.trim()) sp.set("q", query.trim());
      if (filterIp) sp.set("ip_hash", filterIp);
      const res = await fetch(`/api/admin/russia-logs?${sp.toString()}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters() {
    await fetchPage(1);
  }

  function clearFilters() {
    setQuery("");
    setFilterIp(null);
    setFilterError(false);
    fetchPage(1);
  }

  function setIpFilter(ipHash: string | null) {
    setFilterIp(ipHash);
    setTimeout(() => fetchPage(1), 0);
  }

  // Filtro local de errores (sobre las rows ya cargadas)
  const visibleRows = useMemo(() => {
    if (!filterError) return rows;
    return rows.filter((r) => r.error);
  }, [rows, filterError]);

  return (
    <div className="space-y-6">
      {/* Cards de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Hoy" value={stats.totalToday} sub={`${stats.uniqueIpsToday} IPs únicas`} />
        <StatCard label="Ayer" value={stats.totalYesterday} />
        <StatCard label="Últimos 7 días" value={stats.total7d} sub={`${stats.uniqueIps7d} IPs únicas`} />
        <StatCard
          label="Costo estimado · 30d"
          value={`USD ${estimatedCost30d.toFixed(2)}`}
          sub={`${stats.total30d} consultas · ${(stats.inputTokens30d + stats.outputTokens30d).toLocaleString()} tokens`}
          highlight
        />
      </div>

      {/* Sparkline de últimos 30 días */}
      {stats.perDay30d.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Consultas por día · últimos 30
            </p>
            <p className="text-[11px] text-gray-400">
              max: {Math.max(...stats.perDay30d.map((d) => d.count))}
            </p>
          </div>
          <div className="flex items-end gap-1 h-20">
            {stats.perDay30d.map((d) => {
              const max = Math.max(...stats.perDay30d.map((x) => x.count), 1);
              const h = (d.count / max) * 100;
              return (
                <div
                  key={d.day}
                  className="flex-1 bg-magenta/70 hover:bg-magenta rounded-sm relative group"
                  style={{ height: `${Math.max(2, h)}%` }}
                  title={`${d.day} · ${d.count} consultas`}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-navy text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.day} · {d.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top IPs */}
      {stats.topIps7d.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
            Top IPs · últimos 7 días
          </p>
          <ul className="space-y-1.5">
            {stats.topIps7d.map((ip) => (
              <li
                key={ip.ip_hash}
                className="flex items-center gap-2 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setIpFilter(ip.ip_hash)}
                  className={`font-mono text-[11px] px-2 py-0.5 rounded transition-colors ${
                    filterIp === ip.ip_hash
                      ? "bg-magenta text-white"
                      : "bg-gray-100 text-navy hover:bg-magenta-50 hover:text-magenta"
                  }`}
                >
                  {ip.ip_hash}
                </button>
                <span className="font-semibold text-navy tabular-nums w-12">
                  {ip.count}
                </span>
                <span className="text-gray-400">consultas</span>
                {ip.count > 50 && (
                  <span className="ml-auto inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    posible spam
                  </span>
                )}
                <span className="ml-auto text-gray-400">
                  {new Date(ip.last_seen).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Buscar texto en mensajes..."
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filterIp && (
            <button
              type="button"
              onClick={() => setIpFilter(null)}
              className="inline-flex items-center gap-1 rounded-md bg-magenta-50 text-magenta px-2 py-1.5 text-xs font-mono"
              title="Quitar filtro IP"
            >
              <Filter className="h-3 w-3" />
              {filterIp}
              <X className="h-3 w-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilterError((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              filterError
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Solo errores
          </button>

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy text-white px-3 py-2 text-xs font-semibold hover:bg-navy-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            Aplicar
          </button>

          {(query || filterIp || filterError) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-navy"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}

          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-navy"
            title="Recargar desde el server"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {visibleRows.length === 0 ? (
          <div className="p-10 text-center">
            <Bot className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {total === 0
                ? "No hay consultas registradas todavía. Cuando alguien le hable a Russia, aparece acá."
                : "Ningún registro coincide con los filtros."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visibleRows.map((row) => (
              <LogRow
                key={row.id}
                row={row}
                onIpClick={() => setIpFilter(row.ip_hash)}
                isFiltered={filterIp === row.ip_hash}
              />
            ))}
          </ul>
        )}

        {/* Paginación */}
        {total > pageSize && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fetchPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-navy font-semibold">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => fetchPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogRow({
  row,
  onIpClick,
  isFiltered,
}: {
  row: RussiaLogRow;
  onIpClick: () => void;
  isFiltered: boolean;
}) {
  const [open, setOpen] = useState(false);
  const date = new Date(row.created_at);

  return (
    <li className={`px-4 py-3 ${row.error ? "bg-red-50/40" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onIpClick}
          className={`flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded transition-colors ${
            isFiltered
              ? "bg-magenta text-white"
              : "bg-gray-100 text-gray-500 hover:bg-magenta-50 hover:text-magenta"
          }`}
          title="Filtrar por esta IP"
        >
          {row.ip_hash?.slice(0, 8) ?? "—"}
        </button>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-left w-full"
          >
            <p className="text-sm text-navy truncate">{row.user_message}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
              <span>
                {date.toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              {row.function_call && (
                <span className="text-magenta font-semibold">
                  → {row.function_call}
                </span>
              )}
              {row.result_count !== null && (
                <span className="text-gray-500">
                  {row.result_count} resultados
                </span>
              )}
              {row.ms !== null && <span>{row.ms}ms</span>}
              {row.input_tokens !== null && row.output_tokens !== null && (
                <span className="text-gray-400">
                  ↓{row.input_tokens} ↑{row.output_tokens}
                </span>
              )}
              {row.error && (
                <span className="text-red-600 inline-flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  error
                </span>
              )}
            </p>
          </button>

          {open && (
            <div className="mt-2 space-y-2 text-[11px] bg-gray-50 rounded-md p-3">
              {row.response_excerpt && (
                <div>
                  <p className="font-semibold text-navy mb-1">Respuesta:</p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {row.response_excerpt}
                  </p>
                </div>
              )}
              {row.function_args !== null && row.function_args !== undefined && (
                <div>
                  <p className="font-semibold text-navy mb-1">Filtros aplicados:</p>
                  <pre className="text-gray-600 overflow-x-auto">
                    {JSON.stringify(row.function_args, null, 2)}
                  </pre>
                </div>
              )}
              {row.error && (
                <div className="text-red-700">
                  <p className="font-semibold mb-1">Error:</p>
                  <p>{row.error}</p>
                </div>
              )}
              {row.user_agent && (
                <p className="text-gray-400 text-[10px]">UA: {row.user_agent}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 ${
        highlight
          ? "bg-magenta text-white border-magenta"
          : "bg-white border-gray-100"
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-wider font-semibold ${
          highlight ? "text-white/80" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-white" : "text-navy"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] mt-0.5 ${
            highlight ? "text-white/70" : "text-gray-400"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
