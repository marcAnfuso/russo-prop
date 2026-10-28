"use client";

/**
 * Subrayado de temporada bajo "empieza acá": el mismo trazo que el magenta
 * pero en naranja calabaza, terminado en una calabacita (como el Sol de
 * Mayo del Mundial). Se inyecta al Hero real vía la prop `underline`.
 */
function Calabaza({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <path d="M19 9 C 19 5, 21 3, 24 3 C 22 5, 21.5 7, 21.5 9 Z" fill="#65a30d" />
      <ellipse cx="20" cy="23" rx="16" ry="13" fill="#f97316" />
      <ellipse cx="12" cy="23" rx="6" ry="12.5" fill="none" stroke="#ea580c" strokeWidth="1.4" />
      <ellipse cx="28" cy="23" rx="6" ry="12.5" fill="none" stroke="#ea580c" strokeWidth="1.4" />
      <path d="M11 19 L 16 22 L 11 23 Z M29 19 L 24 22 L 29 23 Z" fill="#1a1a2e" />
      <path d="M11 27 Q 20 34, 29 27 L 26 29 L 23 27 L 20 30 L 17 27 L 14 29 Z" fill="#1a1a2e" />
    </svg>
  );
}

export default function CalabazaUnderline() {
  return (
    <>
      <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 right-0 -bottom-2 w-full h-3">
        <path d="M5 12 Q 80 2, 150 10 T 295 8" stroke="#f97316" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M5 12 Q 80 2, 150 10 T 295 8" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
      </svg>
      <span className="absolute -bottom-[0.3em] -right-[0.55em] z-20 w-[0.62em] h-[0.62em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">
        <Calabaza className="w-full h-full" />
      </span>
    </>
  );
}
