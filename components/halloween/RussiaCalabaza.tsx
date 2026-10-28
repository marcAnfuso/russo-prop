"use client";

/**
 * Russia vestida de calabaza: reemplaza el círculo magenta del FAB (56px)
 * por una calabaza con la cara iluminada que titila como una vela. Se usa
 * junto con el SombreroBruja y sin el chip "IA" (chocaba con el sombrero).
 */
export default function RussiaCalabaza() {
  return (
    <div className="relative h-14 w-14 rounded-full shadow-[0_18px_36px_-10px_rgba(234,88,12,0.6),0_8px_16px_-6px_rgba(26,34,81,0.35)] transition-transform duration-300 group-hover:scale-[1.06] group-active:scale-[0.97]">
      <svg viewBox="0 0 56 56" className="h-14 w-14" aria-hidden="true">
        <defs>
          <radialGradient id="russia-calabaza" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <circle cx="28" cy="28" r="28" fill="url(#russia-calabaza)" />
        <ellipse cx="17" cy="29" rx="8" ry="25" fill="none" stroke="#c2410c" strokeWidth="1.4" opacity="0.7" />
        <ellipse cx="39" cy="29" rx="8" ry="25" fill="none" stroke="#c2410c" strokeWidth="1.4" opacity="0.7" />
        <g fill="#fde047" className="russia-vela">
          <path d="M15 27 L21 21 L23 28 Z" />
          <path d="M41 27 L35 21 L33 28 Z" />
          <path d="M13 34 C 18 43, 38 43, 43 34 L 39 36 L 36 33 L 32 37 L 28 33 L 24 37 L 20 33 L 17 36 Z" />
        </g>
      </svg>
      <style jsx>{`
        @keyframes russia-vela {
          0%, 100% { opacity: 1; }
          40% { opacity: 0.75; }
          60% { opacity: 0.95; }
          80% { opacity: 0.7; }
        }
        :global(.russia-vela) { animation: russia-vela 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { :global(.russia-vela) { animation: none; } }
      `}</style>
    </div>
  );
}
