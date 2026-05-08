"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  AlertCircle,
  RefreshCw,
  Bot,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import type { RussiaSession, RussiaStats, RussiaLogRow } from "@/lib/russia-logs";

interface Props {
  initialSessions: RussiaSession[];
  initialTotal: number;
  stats: RussiaStats;
  pageSize: number;
}

export default function RussiaLogsClient({
  initialSessions,
  initialTotal,
  stats,
  pageSize,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sessions] = useState<RussiaSession[]>(initialSessions);
  const [total] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [filterIp, setFilterIp] = useState<string | null>(null);
  const [filterError, setFilterError] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  void pageSize;
  void total;

  // Filtrado local sobre las sesiones
  const visibleSessions = useMemo(() => {
    let out = sessions;
    if (filterIp) out = out.filter((s) => s.ip_hash === filterIp);
    if (filterError) out = out.filter((s) => s.has_error);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((s) =>
        s.messages.some((m) => m.user_message.toLowerCase().includes(q))
      );
    }
    return out;
  }, [sessions, filterIp, filterError, query]);

  function toggle(sessionKey: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sessionKey)) next.delete(sessionKey);
      else next.add(sessionKey);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setFilterIp(null);
    setFilterError(false);
  }

  return (
    <div className="space-y-6">
      {/* Cards de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Hoy"
          value={stats.totalToday}
          sub={`${stats.uniqueIpsToday} IPs únicas`}
        />
        <StatCard label="Ayer" value={stats.totalYesterday} />
        <StatCard
          label="Últimos 7 días"
          value={stats.total7d}
          sub={`${stats.uniqueIps7d} IPs únicas`}
        />
        <StatCard
          label="Últimos 30 días"
          value={stats.total30d}
          sub={`${(stats.inputTokens30d + stats.outputTokens30d).toLocaleString()} tokens`}
        />
      </div>

      {/* Sparkline */}
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
              <li key={ip.ip_hash} className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterIp(ip.ip_hash)}
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar texto en cualquier mensaje de la conversación..."
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
              onClick={() => setFilterIp(null)}
              className="inline-flex items-center gap-1 rounded-md bg-magenta-50 text-magenta px-2 py-1.5 text-xs font-mono"
            >
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
            Solo con error
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
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </button>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {visibleSessions.length === 0 ? (
          <div className="p-10 text-center">
            <Bot className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {sessions.length === 0
                ? "No hay conversaciones registradas todavía. Cuando alguien le hable a Russia, aparece acá."
                : "Ninguna conversación coincide con los filtros."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visibleSessions.map((s) => {
              const key = s.session_id ?? "__null__";
              const isOpen = expanded.has(key);
              return (
                <li
                  key={key}
                  className={s.has_error ? "bg-red-50/40" : ""}
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-gray-400">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.ip_hash) setFilterIp(s.ip_hash);
                      }}
                      className={`flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded transition-colors ${
                        filterIp === s.ip_hash
                          ? "bg-magenta text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-magenta-50 hover:text-magenta"
                      }`}
                      title="Filtrar por esta IP"
                    >
                      {s.ip_hash?.slice(0, 8) ?? "—"}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy truncate font-medium">
                        {s.first_message || "(sin mensaje)"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {s.message_count}{" "}
                          {s.message_count === 1 ? "mensaje" : "mensajes"}
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(s.started_at).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {s.has_error && (
                          <span className="text-red-600 inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            con error
                          </span>
                        )}
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-3">
                      {s.messages.map((m) => (
                        <MessageBubble key={m.id} m={m} />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ m }: { m: RussiaLogRow }) {
  return (
    <div className="space-y-1.5">
      {/* Usuario */}
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-magenta text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm">
          {m.user_message}
        </div>
      </div>

      {/* Russia */}
      <div className="flex justify-start">
        <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 text-sm space-y-1">
          {m.response_excerpt ? (
            <p className="text-navy whitespace-pre-wrap">{m.response_excerpt}</p>
          ) : (
            <p className="text-gray-400 italic text-xs">(sin respuesta)</p>
          )}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1 border-t border-gray-100 flex-wrap">
            {m.function_call && (
              <span className="text-magenta font-semibold">
                → {m.function_call}
              </span>
            )}
            {m.result_count !== null && (
              <span>{m.result_count} resultados</span>
            )}
            {m.ms !== null && <span>{m.ms}ms</span>}
            {m.input_tokens !== null && m.output_tokens !== null && (
              <span>
                ↓{m.input_tokens} ↑{m.output_tokens}
              </span>
            )}
            {m.error && (
              <span className="text-red-600 inline-flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {m.error}
              </span>
            )}
          </div>
          {m.function_args !== null && m.function_args !== undefined && (
            <details className="text-[10px] text-gray-500 pt-1">
              <summary className="cursor-pointer hover:text-navy">
                ver filtros aplicados
              </summary>
              <pre className="mt-1 bg-gray-50 rounded p-2 overflow-x-auto">
                {JSON.stringify(m.function_args, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border shadow-sm p-4 bg-white border-gray-100">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
      {sub && <p className="text-[11px] mt-0.5 text-gray-400">{sub}</p>}
    </div>
  );
}
