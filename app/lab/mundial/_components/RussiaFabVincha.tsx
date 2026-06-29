"use client";

import RussiaFabDemo from "./RussiaFabDemo";

/**
 * Russia con una vincha argentina REAL apoyada sobre la cabeza del FAB.
 *
 * Construcción:
 *  - La banda son DOS trazos sobre la misma curva: uno celeste ancho (10px)
 *    y encima uno blanco fino (3.4px) → da las 3 franjas celeste/blanco/celeste.
 *  - El trazo sigue la curva de la cabeza redonda (sube en el medio, baja en
 *    los costados para "envolver").
 *  - Nudo al costado derecho + dos colitas que cuelgan.
 *  - Sol de Mayo dorado al centro.
 */
const BAND = "M2 24 C 2 16, 11 13, 28 13 C 45 13, 54 16, 54 24";

export default function RussiaFabVincha() {
  return (
    <RussiaFabDemo>
      <svg
        aria-hidden="true"
        viewBox="0 0 56 56"
        className="absolute inset-0 w-14 h-14 pointer-events-none overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
      >
        {/* Colitas que cuelgan del nudo (detrás de la banda) */}
        <path
          d="M50 25 C 55 31, 54 39, 49 45"
          fill="none"
          stroke="#75AADB"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M50 25 C 55 31, 54 39, 49 45"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M52 24 C 58 27, 60 34, 59 41"
          fill="none"
          stroke="#75AADB"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M52 24 C 58 27, 60 34, 59 41"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Banda principal: celeste ancho + blanco fino = 3 franjas */}
        <path d={BAND} fill="none" stroke="#75AADB" strokeWidth="10" strokeLinecap="round" />
        <path d={BAND} fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />

        {/* Sol de Mayo al centro de la banda */}
        <g transform="translate(28 13)">
          <g stroke="#E8A317" strokeWidth="0.9" strokeLinecap="round">
            <line x1="0" y1="-4.6" x2="0" y2="-3" />
            <line x1="3.25" y1="-3.25" x2="2.1" y2="-2.1" />
            <line x1="4.6" y1="0" x2="3" y2="0" />
            <line x1="3.25" y1="3.25" x2="2.1" y2="2.1" />
            <line x1="0" y1="4.6" x2="0" y2="3" />
            <line x1="-3.25" y1="3.25" x2="-2.1" y2="2.1" />
            <line x1="-4.6" y1="0" x2="-3" y2="0" />
            <line x1="-3.25" y1="-3.25" x2="-2.1" y2="-2.1" />
          </g>
          <circle cx="0" cy="0" r="2.4" fill="#F6B40E" stroke="#E8A317" strokeWidth="0.5" />
        </g>

        {/* Nudo al costado derecho */}
        <circle cx="51.5" cy="22.5" r="4.6" fill="#75AADB" />
        <circle cx="51.5" cy="22.5" r="1.9" fill="#FFFFFF" />
      </svg>
    </RussiaFabDemo>
  );
}
