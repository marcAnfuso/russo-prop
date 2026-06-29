"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Banner sticky superior con countdown al próximo partido de Argentina.
 * Cierre persistente con sessionStorage.
 *
 * Próximo partido configurable. Por ahora: placeholder de 16vos.
 */
const NEXT_MATCH = {
  rival: "Australia",
  // ISO date + hora arg. Cambiar acá cuando se confirme el cruce.
  isoDate: "2026-07-05T16:00:00-03:00",
  stage: "16vos de final",
};

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "¡Ya empezó!";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function MundialBanner() {
  const [closed, setClosed] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Diferimos a cliente valores que dependen de sessionStorage / reloj para
    // evitar mismatch de hidratación SSR. setState acá es el patrón correcto.
    try {
      if (sessionStorage.getItem("mundial_banner_closed") === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClosed(true);
      }
    } catch {
      /* noop */
    }
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (closed || now === null) return null;

  const matchTs = new Date(NEXT_MATCH.isoDate).getTime();
  const diff = matchTs - now;
  const countdown = fmtCountdown(diff);

  function close() {
    setClosed(true);
    try {
      sessionStorage.setItem("mundial_banner_closed", "1");
    } catch {
      /* noop */
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="relative flex items-center justify-center gap-3 px-4 py-2 text-[12.5px] font-semibold text-navy"
        style={{
          background:
            "linear-gradient(90deg, #75AADB 0%, #FFFFFF 35%, #FFFFFF 65%, #75AADB 100%)",
        }}
      >
        <span className="text-base leading-none" aria-hidden="true">
          🇦🇷
        </span>
        <span className="hidden sm:inline">
          Argentina vs {NEXT_MATCH.rival} · {NEXT_MATCH.stage}
        </span>
        <span className="sm:hidden">
          ARG vs {NEXT_MATCH.rival}
        </span>
        <span className="rounded-full bg-navy text-white px-2 py-0.5 text-[11px] font-bold tabular-nums">
          {countdown}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar banner"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy/70 hover:bg-navy/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
