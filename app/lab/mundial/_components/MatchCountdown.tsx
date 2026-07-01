"use client";

import { useEffect, useState } from "react";

/**
 * Countdown real al próximo partido de Argentina.
 * Datos del partido: Argentina vs Cabo Verde · 16vos · viernes 3/7.
 * (La hora es tentativa — se ajusta cuando FIFA confirme.)
 */
const MATCH = {
  home: { name: "Argentina", code: "ar" },
  away: { name: "Cabo Verde", code: "cv" },
  stage: "16vos de final",
  iso: "2026-07-03T16:00:00-03:00",
  dateLabel: "Viernes 3 de julio · 16:00 hs",
};

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function Flag({ code, name }: { code: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w160/${code}.png`}
      alt={name}
      width={56}
      height={38}
      className="h-9 w-auto rounded-[3px] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
    />
  );
}

function Box({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[3.1rem] rounded-xl bg-navy px-2.5 py-2 text-center font-display text-3xl font-bold tabular-nums text-white shadow-[0_6px_16px_-6px_rgba(26,34,81,0.5)]">
        {value}
      </div>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

export default function MatchCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = new Date(MATCH.iso).getTime();
  const diff = now === null ? 0 : target - now;
  const live = now !== null && diff <= 0;

  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_-24px_rgba(26,34,81,0.4)]">
      {/* Cinta superior celeste/blanca */}
      <div
        className="h-1.5"
        style={{
          background:
            "linear-gradient(90deg,#75AADB 0%,#FFFFFF 50%,#75AADB 100%)",
        }}
      />
      <div className="px-6 py-5">
        {/* Kicker */}
        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-magenta">
          🇦🇷 Mundial 2026 · {MATCH.stage}
        </p>

        {/* Equipos */}
        <div className="mb-5 flex items-center justify-center gap-4">
          <div className="flex flex-1 items-center justify-end gap-2.5">
            <span className="font-display text-lg font-semibold text-navy">
              {MATCH.home.name}
            </span>
            <Flag code={MATCH.home.code} name={MATCH.home.name} />
          </div>
          <span className="text-xs font-bold text-gray-300">VS</span>
          <div className="flex flex-1 items-center justify-start gap-2.5">
            <Flag code={MATCH.away.code} name={MATCH.away.name} />
            <span className="font-display text-lg font-semibold text-navy">
              {MATCH.away.name}
            </span>
          </div>
        </div>

        {/* Countdown */}
        {live ? (
          <p className="py-3 text-center font-display text-2xl font-bold text-magenta">
            ¡Vamos Argentina! 🇦🇷
          </p>
        ) : (
          <div className="flex items-start justify-center gap-2.5">
            <Box value={pad(d)} label="días" />
            <span className="pt-2 font-display text-3xl font-bold text-gray-200">:</span>
            <Box value={pad(h)} label="hs" />
            <span className="pt-2 font-display text-3xl font-bold text-gray-200">:</span>
            <Box value={pad(m)} label="min" />
            <span className="pt-2 font-display text-3xl font-bold text-gray-200">:</span>
            <Box value={pad(s)} label="seg" />
          </div>
        )}

        {/* Fecha */}
        <p className="mt-4 text-center text-[13px] font-medium text-gray-500">
          {MATCH.dateLabel}
        </p>
      </div>
    </div>
  );
}
