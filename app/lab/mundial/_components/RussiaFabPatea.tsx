"use client";

import { useEffect, useState } from "react";
import RussiaFabDemo from "./RussiaFabDemo";

/**
 * Russia patea una pelota al cargar.
 * Secuencia:
 *  1. FAB hace mini wind-up (-5°) y vuelve
 *  2. Pelota aparece a la derecha del FAB y sale rodando hacia la
 *     derecha de la pantalla
 *  3. Después del primer disparo, queda sin la pelota (normal).
 */
export default function RussiaFabPatea() {
  const [kicked, setKicked] = useState(false);
  const [kicking, setKicking] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setKicking(true), 800);
    const t2 = setTimeout(() => setKicked(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <div className={kicking && !kicked ? "russia-windup" : undefined}>
        <RussiaFabDemo />
      </div>
      {!kicked && (
        <div
          aria-hidden="true"
          className={`fixed bottom-8 z-30 pointer-events-none ${
            kicking ? "pelota-shot" : "pelota-idle"
          }`}
          style={{ left: "92px" }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" className={kicking ? "pelota-shot-spin" : undefined}>
            <circle cx="13" cy="13" r="12" fill="white" stroke="#1a2547" strokeWidth="1" />
            <polygon points="13,5 17,8 15,13 11,13 9,8" fill="#1a2547" />
            <polygon points="4,13 8,11 10,15 7,18 4,17" fill="#1a2547" opacity="0.7" />
            <polygon points="22,13 18,11 16,15 19,18 22,17" fill="#1a2547" opacity="0.7" />
          </svg>
        </div>
      )}
      <style jsx>{`
        @keyframes russia-windup {
          0% { transform: rotate(0); }
          40% { transform: rotate(-8deg); }
          70% { transform: rotate(4deg); }
          100% { transform: rotate(0); }
        }
        @keyframes pelota-shot {
          0% { transform: translateX(0) translateY(0); }
          30% { transform: translateX(60px) translateY(-30px); }
          60% { transform: translateX(50vw) translateY(-15px); }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        @keyframes pelota-shot-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(1080deg); }
        }
        :global(.russia-windup) {
          animation: russia-windup 1s cubic-bezier(0.4, 0, 0.6, 1);
          transform-origin: center;
        }
        :global(.pelota-shot) {
          animation: pelota-shot 1.2s cubic-bezier(0.25, 0.1, 0.4, 1) forwards;
          animation-delay: 0.2s;
        }
        :global(.pelota-shot-spin) {
          animation: pelota-shot-spin 1.2s linear forwards;
          animation-delay: 0.2s;
          filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.3));
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.russia-windup), :global(.pelota-shot), :global(.pelota-shot-spin) {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
