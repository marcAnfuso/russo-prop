"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Phone,
  Mail,
  Trash2,
  Loader2,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import type { LeadRow } from "@/lib/leads-db";

type StatusFilter = "todos" | "nuevo" | "contactado" | "cerrado";
type TypeFilter = "todos" | "contacto" | "tasacion" | "consulta";

interface Counts {
  nuevo: number;
  contactado: number;
  cerrado: number;
}

const TYPE_LABEL: Record<string, string> = {
  contacto: "Contacto",
  tasacion: "Tasación",
  consulta: "Consulta",
};

const TYPE_COLOR: Record<string, string> = {
  contacto: "bg-navy-50 text-navy",
  tasacion: "bg-amber-50 text-amber-700",
  consulta: "bg-magenta-50 text-magenta",
};

const STATUS_COLOR: Record<string, string> = {
  nuevo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  contactado: "bg-amber-50 text-amber-700 border-amber-200",
  cerrado: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function LeadsClient({
  initial,
  initialCounts,
  pageSize,
}: {
  initial: LeadRow[];
  initialCounts: Counts;
  pageSize: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState<LeadRow[]>(initial);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refetch(status: StatusFilter, type: TypeFilter) {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "todos") params.set("status", status);
      if (type !== "todos") params.set("type", type);
      params.set("limit", String(pageSize));
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al cargar");
      setRows(data.rows);
      setCounts(data.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(lead: LeadRow, status: "nuevo" | "contactado" | "cerrado") {
    setError(null);
    const prev = lead.status;
    // Optimistic
    setRows((rs) => rs.map((r) => (r.id === lead.id ? { ...r, status } : r)));
    setCounts((c) => ({
      ...c,
      [prev]: Math.max(0, c[prev as keyof Counts] - 1),
      [status]: c[status as keyof Counts] + 1,
    }));
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error");
      startTransition(() => router.refresh());
    } catch (e) {
      // Rollback
      setRows((rs) => rs.map((r) => (r.id === lead.id ? { ...r, status: prev } : r)));
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  async function handleDelete(lead: LeadRow) {
    if (!confirm(`¿Borrar el lead de ${lead.name}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads?id=${lead.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error");
      setRows((rs) => rs.filter((r) => r.id !== lead.id));
      setCounts((c) => ({ ...c, [lead.status]: Math.max(0, c[lead.status as keyof Counts] - 1) }));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    }
  }

  function applyStatusFilter(s: StatusFilter) {
    setStatusFilter(s);
    refetch(s, typeFilter);
  }
  function applyTypeFilter(t: TypeFilter) {
    setTypeFilter(t);
    refetch(statusFilter, t);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge
          label="Nuevos"
          value={counts.nuevo}
          color="emerald"
          active={statusFilter === "nuevo"}
          onClick={() => applyStatusFilter(statusFilter === "nuevo" ? "todos" : "nuevo")}
        />
        <StatBadge
          label="Contactados"
          value={counts.contactado}
          color="amber"
          active={statusFilter === "contactado"}
          onClick={() => applyStatusFilter(statusFilter === "contactado" ? "todos" : "contactado")}
        />
        <StatBadge
          label="Cerrados"
          value={counts.cerrado}
          color="gray"
          active={statusFilter === "cerrado"}
          onClick={() => applyStatusFilter(statusFilter === "cerrado" ? "todos" : "cerrado")}
        />
        <StatBadge
          label="Total"
          value={counts.nuevo + counts.contactado + counts.cerrado}
          color="navy"
          active={statusFilter === "todos"}
          onClick={() => applyStatusFilter("todos")}
        />
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Tipo:</span>
        {(["todos", "contacto", "tasacion", "consulta"] as TypeFilter[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => applyTypeFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              typeFilter === t
                ? "border-magenta bg-magenta text-white"
                : "border-gray-200 bg-white text-navy hover:border-navy-300"
            }`}
          >
            {t === "todos" ? "Todos" : TYPE_LABEL[t]}
          </button>
        ))}
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-magenta" />}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 text-sm">
          {statusFilter === "todos" && typeFilter === "todos"
            ? "Todavía no hay leads · cuando alguien llene un formulario va a aparecer acá."
            : "Ningún lead coincide con esos filtros."}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold w-32">Cuándo</th>
                <th className="text-left px-4 py-3 font-semibold w-28">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold">Persona</th>
                <th className="text-left px-4 py-3 font-semibold w-32">Propiedad</th>
                <th className="text-center px-4 py-3 font-semibold w-32">Estado</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <LeadItem
                  key={lead.id}
                  lead={lead}
                  expanded={expandedId === lead.id}
                  onToggle={() => setExpandedId((id) => (id === lead.id ? null : lead.id))}
                  onStatusChange={(s) => changeStatus(lead, s)}
                  onDelete={() => handleDelete(lead)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatBadge({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "gray" | "navy";
  active: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    emerald: active ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    amber: active ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100",
    gray: active ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    navy: active ? "bg-navy text-white" : "bg-navy-50 text-navy hover:bg-navy-100",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border border-transparent px-4 py-3 text-left transition-colors ${colorMap[color]}`}
    >
      <p className="text-[11px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-2xl font-bold tabular-nums mt-0.5">{value}</p>
    </button>
  );
}

function LeadItem({
  lead,
  expanded,
  onToggle,
  onStatusChange,
  onDelete,
}: {
  lead: LeadRow;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: "nuevo" | "contactado" | "cerrado") => void;
  onDelete: () => void;
}) {
  const date = new Date(lead.created_at);
  const dateStr = date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const wppPhone = lead.phone.replace(/\D/g, "");
  const wppHref = `https://wa.me/${wppPhone.startsWith("54") ? wppPhone : `54${wppPhone}`}`;
  const phoneHref = `tel:${lead.phone}`;
  const mailHref = lead.email ? `mailto:${lead.email}` : null;

  return (
    <>
      <tr className="border-t border-gray-100 hover:bg-gray-50/50 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3 align-middle text-xs text-gray-500 font-mono-price tabular-nums">
          {dateStr}
        </td>
        <td className="px-4 py-3 align-middle">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_COLOR[lead.type] ?? "bg-gray-50 text-gray-600"}`}>
            {TYPE_LABEL[lead.type] ?? lead.type}
          </span>
        </td>
        <td className="px-4 py-3 align-middle">
          <p className="font-semibold text-navy">{lead.name}</p>
          <p className="text-xs text-gray-500">
            {lead.phone}
            {lead.email && <span> · {lead.email}</span>}
          </p>
        </td>
        <td className="px-4 py-3 align-middle">
          {lead.property_code ? (
            <a
              href={`/propiedad/${lead.property_code.replace(/^RUS/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-magenta hover:underline"
            >
              {lead.property_code}
            </a>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
        <td className="px-4 py-3 align-middle text-center" onClick={(e) => e.stopPropagation()}>
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value as "nuevo" | "contactado" | "cerrado")}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${STATUS_COLOR[lead.status] ?? ""}`}
          >
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </td>
        <td className="px-4 py-3 align-middle text-right">
          <ChevronDown
            className={`inline-block h-4 w-4 text-gray-300 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-gray-100 bg-gray-50/40">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="sm:col-span-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mensaje</p>
                <p className="text-navy whitespace-pre-wrap">
                  {lead.message || <span className="text-gray-400 italic">(sin mensaje)</span>}
                </p>
                {lead.source_path && (
                  <p className="text-xs text-gray-500 pt-2">
                    Llegó desde: <span className="font-mono text-gray-700">{lead.source_path}</span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Acciones</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={wppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a
                    href={phoneHref}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-magenta hover:text-magenta transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Llamar
                  </a>
                  {mailHref && (
                    <a
                      href={mailHref}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-magenta hover:text-magenta transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Mail
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onStatusChange("contactado")}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-magenta hover:text-magenta transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Marcar contactado
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
