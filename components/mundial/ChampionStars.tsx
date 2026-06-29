"use client";

import { Star } from "lucide-react";
import { MUNDIAL_YEARS } from "@/lib/mundial";

const GOLD = "#F6B40E";

/**
 * 3 estrellas de campeón con el año de cada Mundial debajo, para colgar bajo
 * el logo en el navbar. Se encoge un poco cuando el navbar está scrolleado.
 */
export default function ChampionStars({ scrolled = false }: { scrolled?: boolean }) {
  const starSize = scrolled ? 9 : 11;
  return (
    <div className="flex items-start justify-center gap-2 mt-0.5 select-none" aria-label="Campeón del mundo 1978, 1986 y 2022">
      {MUNDIAL_YEARS.map((y) => (
        <div key={y} className="flex flex-col items-center gap-[1px]">
          <Star style={{ width: starSize, height: starSize, color: GOLD, fill: GOLD }} strokeWidth={1} aria-hidden="true" />
          <span
            className="font-bold tracking-wide tabular-nums leading-none text-gray-400"
            style={{ fontSize: Math.max(7, starSize * 0.55) }}
          >
            {y}
          </span>
        </div>
      ))}
    </div>
  );
}
