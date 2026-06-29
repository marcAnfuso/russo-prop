"use client";

import { useState } from "react";
import MundialConfetti from "./MundialConfetti";

/**
 * Sticker flotante 🇦🇷 en esquina inferior derecha, por encima del WhatsApp FAB
 * (que vive en bottom-6 right-6). Wiggle suave + click dispara confeti.
 */
export default function MundialSticker() {
  const [burst, setBurst] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => setBurst((b) => b + 1)}
        aria-label="¡Vamos Argentina!"
        className="mundial-sticker fixed bottom-24 right-6 z-40 select-none"
      >
        <span
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black uppercase tracking-wider text-navy shadow-[0_10px_24px_-8px_rgba(26,34,81,0.45)] ring-1 ring-navy/10"
          style={{
            background:
              "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 45%, #75AADB 55%, #75AADB 100%)",
          }}
        >
          ¡Vamos!
          <span className="text-base leading-none" aria-hidden="true">
            🇦🇷
          </span>
        </span>
      </button>
      {burst > 0 && <MundialConfetti key={burst} count={80} duration={4000} />}
      <style jsx>{`
        @keyframes mundial-wiggle {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          25% { transform: rotate(3deg) translateY(-2px); }
          50% { transform: rotate(-2deg) translateY(0); }
          75% { transform: rotate(2deg) translateY(-1px); }
        }
        :global(.mundial-sticker) {
          animation: mundial-wiggle 2.6s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        :global(.mundial-sticker:hover) {
          transform: scale(1.06);
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.mundial-sticker) {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
