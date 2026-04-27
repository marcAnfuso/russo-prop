"use client";

import { useState, FormEvent } from "react";
import { Bell, BellRing, X, Loader2, Check } from "lucide-react";
import { track } from "@/lib/analytics-client";

export interface AlertCriterion {
  operation?: "venta" | "alquiler";
  zones?: string[];
  types?: string[];
  rooms?: number[];
  priceMax?: number;
  priceCurrency?: "USD" | "ARS";
}

interface Props {
  criterion: AlertCriterion;
  /** Texto que describe la búsqueda actual · ej "Casa en San Justo, hasta USD 100.000" */
  summary: string;
}

export default function SaveSearchAlert({ criterion, summary }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, criterion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "No se pudo crear la alerta");
        return;
      }
      track("form_submit", {
        metadata: { form: "alert_subscribe", criterion },
      });
      setSuccess(true);
    } catch {
      setError("Problema de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    // Resetear flow después de un toque para que no se vea el flash
    setTimeout(() => {
      setSuccess(false);
      setEmail("");
      setName("");
      setError(null);
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta-50 text-magenta px-3.5 py-1.5 text-xs font-semibold hover:bg-magenta hover:text-white hover:border-magenta transition-colors"
      >
        <BellRing className="h-3.5 w-3.5" />
        Avisame cuando entre algo así
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {success ? (
              <SuccessView email={email} summary={summary} onClose={close} />
            ) : (
              <FormView
                summary={summary}
                email={email}
                name={name}
                accepted={accepted}
                loading={loading}
                error={error}
                onEmail={setEmail}
                onName={setName}
                onAccepted={setAccepted}
                onSubmit={handleSubmit}
                onClose={close}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FormView({
  summary,
  email,
  name,
  accepted,
  loading,
  error,
  onEmail,
  onName,
  onAccepted,
  onSubmit,
  onClose,
}: {
  summary: string;
  email: string;
  name: string;
  accepted: boolean;
  loading: boolean;
  error: string | null;
  onEmail: (v: string) => void;
  onName: (v: string) => void;
  onAccepted: (v: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="bg-gradient-to-br from-magenta to-[#b3006d] text-white p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded text-white/70 hover:bg-white/20"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5" />
          <h2 className="font-display text-xl font-semibold">
            Avisame cuando entre algo así
          </h2>
        </div>
        <p className="text-sm opacity-90">
          Te mandamos un email cuando entren propiedades que coincidan
          con esta búsqueda.
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
            Tu búsqueda
          </p>
          <p className="text-sm font-semibold text-navy">{summary}</p>
        </div>

        <div>
          <label
            htmlFor="alert-email"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
          >
            Tu email *
          </label>
          <input
            id="alert-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20"
          />
        </div>

        <div>
          <label
            htmlFor="alert-name"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
          >
            Tu nombre <span className="text-gray-400 normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="alert-name"
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20"
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAccepted(e.target.checked)}
            className="mt-0.5 rounded text-magenta focus:ring-magenta"
            required
          />
          <span>
            Acepto recibir avisos por email · prometemos no spamear, sólo
            cuando hay novedades reales. Te das de baja con un click.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !accepted}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-magenta text-white font-semibold py-2.5 transition-colors hover:bg-magenta-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {loading ? "Creando alerta…" : "Crear alerta"}
        </button>
      </form>
    </>
  );
}

function SuccessView({
  email,
  summary,
  onClose,
}: {
  email: string;
  summary: string;
  onClose: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
        <Check className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-navy mb-2">
        ¡Listo!
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Tu alerta ya está activa. Te avisamos en{" "}
        <span className="font-semibold text-navy">{email}</span> cuando entre
        algo nuevo que coincida.
      </p>
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-left mb-6">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
          Búsqueda guardada
        </p>
        <p className="text-sm font-semibold text-navy">{summary}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-magenta text-white font-semibold px-5 py-2 text-sm hover:bg-magenta-600 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}
