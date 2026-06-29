"use client";

/**
 * Vincha argentina (celeste/blanca + Sol de Mayo) para apoyar sobre la cabeza
 * del FAB de Russia. Se monta absoluta dentro del <div className="relative">
 * que envuelve el botón circular de 56px.
 *
 * La banda son dos trazos sobre la misma curva (celeste ancho + blanco fino)
 * → 3 franjas. Nudo al costado + colitas + sol al centro.
 */
const BAND = "M2 24 C 2 16, 11 13, 28 13 C 45 13, 54 16, 54 24";

export default function Vincha() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 56 56"
      className="absolute inset-0 w-14 h-14 pointer-events-none overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
    >
      {/* Colitas que cuelgan del nudo */}
      <path d="M50 25 C 55 31, 54 39, 49 45" fill="none" stroke="#75AADB" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 25 C 55 31, 54 39, 49 45" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 24 C 58 27, 60 34, 59 41" fill="none" stroke="#75AADB" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 24 C 58 27, 60 34, 59 41" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />

      {/* Banda: celeste ancho + blanco fino = 3 franjas */}
      <path d={BAND} fill="none" stroke="#75AADB" strokeWidth="10" strokeLinecap="round" />
      <path d={BAND} fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />

      {/* Sol de Mayo al centro */}
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
  );
}
