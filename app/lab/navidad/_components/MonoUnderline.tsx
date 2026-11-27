"use client";

/**
 * Subrayado de "empieza acá" convertido en la cinta de un regalo: el mismo
 * trazo del magenta de siempre, con brillo dorado, y un moño que aparece al
 * final ("tu próximo hogar es el regalo"). Se inyecta vía `underline`.
 */
export default function MonoUnderline() {
  return (
    <>
      <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 right-0 -bottom-2 w-full h-3">
        <path className="mono-cinta" d="M5 12 Q 80 2, 150 10 T 295 8" stroke="#e6007e" strokeWidth="6" strokeLinecap="round" fill="none" pathLength={1} />
        <path className="mono-cinta" d="M5 11 Q 80 1, 150 9 T 295 7" stroke="#fcd34d" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.9" pathLength={1} />
      </svg>
      <span className="mono-mono absolute -bottom-[0.42em] -right-[0.62em] z-20 w-[0.78em] h-[0.78em] drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)]">
        <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
          {/* colas */}
          <path d="M22 26 L 12 44 L 17 42 L 19 47 L 25 28 Z" fill="#b80065" />
          <path d="M26 26 L 34 44 L 29 42.5 L 27.5 47 L 23 28 Z" fill="#cc006f" />
          {/* lazos */}
          <path d="M24 24 C 14 10, 2 12, 4 21 C 6 30, 18 28, 24 24 Z" fill="#e6007e" />
          <path d="M24 24 C 34 10, 46 12, 44 21 C 42 30, 30 28, 24 24 Z" fill="#e6007e" />
          <path d="M23 23 C 16 15, 9 15, 8 19" stroke="#fda4cf" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M25 23 C 32 15, 39 15, 40 19" stroke="#fda4cf" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* nudo dorado */}
          <rect x="19.5" y="19.5" width="9" height="9" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        </svg>
      </span>
      <style jsx>{`
        .mono-cinta { stroke-dasharray: 1; stroke-dashoffset: 1; animation: mono-dibuja 0.9s cubic-bezier(0.6, 0, 0.3, 1) 0.6s forwards; }
        @keyframes mono-dibuja { to { stroke-dashoffset: 0; } }
        .mono-mono { transform: scale(0) rotate(-40deg); animation: mono-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s forwards; }
        @keyframes mono-pop { to { transform: scale(1) rotate(-8deg); } }
        @media (prefers-reduced-motion: reduce) {
          .mono-cinta { animation: none; stroke-dashoffset: 0; }
          .mono-mono { animation: none; transform: rotate(-8deg); }
        }
      `}</style>
    </>
  );
}
