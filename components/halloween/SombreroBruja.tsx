"use client";

/**
 * Sombrero de bruja apoyado sobre la cabeza del FAB de Russia (56px).
 * Mismo montaje que la vincha del Mundial: absoluto dentro del <div
 * className="relative"> del botón, overflow visible para que la punta
 * sobresalga. Inclinado a la izquierda para no tapar el badge "IA".
 */
export default function SombreroBruja() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 56 56"
      className="absolute inset-0 w-14 h-14 pointer-events-none overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
    >
      {/* ala */}
      <ellipse cx="27" cy="11" rx="25" ry="6.5" fill="#2a1a44" />
      {/* copa, caída hacia la izquierda */}
      <path d="M10 11 C 11 2, 10 -6, 13 -17 C 18 -9, 27 -4, 33 2 C 37 6, 42 9, 46 11 Z" fill="#3b2461" />
      <path d="M13 -17 C 18 -9, 27 -4, 33 2 L 30 4 C 24 -2, 17 -7, 13 -17 Z" fill="#2a1a44" opacity="0.55" />
      {/* cinta y hebilla */}
      <path d="M12 9 C 20 4.5, 36 4.5, 45 9" fill="none" stroke="#f97316" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="25.5" y="3.5" width="5.5" height="5.5" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <rect x="27.2" y="5.2" width="2.1" height="2.1" fill="#3b2461" />
    </svg>
  );
}
