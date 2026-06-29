"use client";

import { useEffect, useState } from "react";

/**
 * Pelota de fútbol que rueda por la parte inferior de la pantalla cada
 * cierto tiempo. Easter egg sutil.
 *
 * Loop: aparece de izq a der · pausa larga · vuelve a aparecer.
 */
export default function PelotaRodando({ intervalMs = 12000 }: { intervalMs?: number }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-2 left-0 z-30 w-full h-12 overflow-hidden"
    >
      <div key={tick} className="pelota-roll absolute bottom-0 -left-16">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="pelota-spin drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
        >
          {/* Pelota de fútbol clásica · pentágonos negros sobre blanco */}
          <circle cx="20" cy="20" r="18" fill="white" stroke="#1a2547" strokeWidth="1" />
          <polygon points="20,8 25,12 23,18 17,18 15,12" fill="#1a2547" />
          <polygon points="9,18 14,16 16,21 13,25 8,23" fill="#1a2547" />
          <polygon points="31,18 26,16 24,21 27,25 32,23" fill="#1a2547" />
          <polygon points="20,32 25,28 22,24 18,24 15,28" fill="#1a2547" opacity="0.7" />
        </svg>
      </div>
      <style jsx>{`
        @keyframes pelota-roll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 80px)); }
        }
        @keyframes pelota-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        :global(.pelota-roll) {
          animation: pelota-roll 5s linear forwards;
        }
        :global(.pelota-spin) {
          animation: pelota-spin 5s linear forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.pelota-roll), :global(.pelota-spin) {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
