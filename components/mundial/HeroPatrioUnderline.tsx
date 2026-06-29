"use client";

/**
 * Subrayado patrio para el hero: reemplaza el garabato magenta bajo
 * "empieza acá" por una onda celeste/blanca terminada en un Sol de Mayo.
 * Se monta absoluto dentro del <span className="relative inline-block"> que
 * envuelve "empieza acá".
 */

function SolDeMayo({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <g stroke="#E8A317" strokeWidth="1.5" strokeLinecap="round">
        {rays.map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={20 + Math.cos(r) * 12.5}
              y1={20 + Math.sin(r) * 12.5}
              x2={20 + Math.cos(r) * 18}
              y2={20 + Math.sin(r) * 18}
            />
          );
        })}
      </g>
      <circle cx="20" cy="20" r="11" fill="#F6B40E" stroke="#E8A317" strokeWidth="1.2" />
    </svg>
  );
}

export default function HeroPatrioUnderline() {
  return (
    <>
      <svg
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute left-0 right-0 -bottom-2 w-full h-3"
      >
        <path
          d="M5 12 Q 80 2, 150 10 T 295 8"
          stroke="#6CA6DC"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5 12 Q 80 2, 150 10 T 295 8"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="absolute -bottom-[0.28em] -right-[0.5em] z-20 w-[0.62em] h-[0.62em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">
        <SolDeMayo className="w-full h-full" />
      </span>
    </>
  );
}
