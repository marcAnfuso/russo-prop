"use client";

import { useEffect, useState } from "react";

/**
 * Cintillo slim con el countdown al próximo partido de Argentina.
 * Va arriba de todo (dentro del navbar fijo). Banderas reales + contador vivo
 * con segundos. Hora en ARG (UTC-3).
 *
 * Actualizá MATCH cuando cambie el rival/fecha (o, a futuro, se puede leer del
 * fixture del Mundial vía API).
 */
const MATCH = {
  home: { name: "Argentina", code: "ar" },
  away: { name: "Cabo Verde", code: "cv" },
  stage: "16vos",
  iso: "2026-07-03T19:00:00-03:00",
  timeLabel: "Vie 19:00",
};

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function CountdownStrip() {
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
  const cd = live
    ? "¡En juego!"
    : d > 0
      ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
      : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;

  return (
    <div className="w-full bg-navy text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-2 px-4 text-[12.5px] font-medium sm:gap-2.5">
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {MATCH.stage}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://flagcdn.com/w40/${MATCH.home.code}.png`} alt="Argentina" className="h-3.5 rounded-[2px] ring-1 ring-white/20" />
        <span className="font-semibold">Argentina</span>
        <span className="text-white/50">vs</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://flagcdn.com/w40/${MATCH.away.code}.png`} alt="Cabo Verde" className="hidden h-3.5 rounded-[2px] ring-1 ring-white/20 xs:inline" />
        <span className="font-semibold">Cabo Verde</span>
        <span className="mx-0.5 text-white/30">·</span>
        <span className="tabular-nums font-bold text-[#8fc0ec]">{cd}</span>
        <span className="ml-0.5 hidden text-white/60 sm:inline">· {MATCH.timeLabel} hs</span>
      </div>
    </div>
  );
}
