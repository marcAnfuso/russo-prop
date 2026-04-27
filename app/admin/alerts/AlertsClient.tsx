"use client";

import { useState } from "react";
import { Trash2, BellOff, Mail, Calendar, CheckCircle2 } from "lucide-react";
import type { Alert } from "@/lib/alerts-db";

type Row = Alert & { summary: string; notified_count: number };

interface Props {
  initial: Row[];
}

export default function AlertsClient({ initial }: Props) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleDelete(id: number, email: string) {
    if (!confirm(`¿Borrar la suscripción de ${email}? No se puede deshacer.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/alerts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRows((r) => r.filter((x) => x.id !== id));
    } catch {
      alert("Error al borrar");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeactivate(id: number, token: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/alerts?token=${encodeURIComponent(token)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setRows((r) => r.map((x) => (x.id === id ? { ...x, active: false } : x)));
    } catch {
      alert("Error al desactivar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Suscriptor</th>
            <th className="text-left px-4 py-3 font-semibold">Búsqueda</th>
            <th className="text-right px-4 py-3 font-semibold">Enviados</th>
            <th className="text-left px-4 py-3 font-semibold">Última</th>
            <th className="text-center px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t border-gray-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    {a.name && (
                      <p className="font-semibold text-navy">{a.name}</p>
                    )}
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-navy max-w-xs">
                {a.summary}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                {a.notified_count}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {a.last_notified_at ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(a.last_notified_at)}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Suscripto: {formatDate(a.created_at)}
                </p>
              </td>
              <td className="px-4 py-3 text-center">
                {a.active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-[10px] font-bold">
                    Inactiva
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {a.active && (
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => handleDeactivate(a.id, a.unsubscribe_token)}
                      className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                      title="Desactivar (no borrar)"
                    >
                      <BellOff className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => handleDelete(a.id, a.email)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Borrar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
