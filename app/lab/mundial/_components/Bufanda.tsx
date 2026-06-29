"use client";

/**
 * Bufanda de hincha (celeste/blanca) drapeada sobre el final de una palabra,
 * como colgada sobre un perchero: la banda apoya sobre las letras y dos
 * colitas paralelas cuelgan rectas por el costado derecho, con flecos.
 *
 * Distinta a la vincha de Russia (que abraza la cabeza). Acá es una bufanda
 * larga con franjas horizontales y flecos.
 *
 * Se posiciona absoluta sobre un <span className="relative inline-block">.
 * Unidades em → escala con el font-size del titular responsive.
 */

const CELESTE = "#6CA6DC";
const CELESTE_D = "#4F8FCB";
const BLANCO = "#FFFFFF";

// Banda que apoya sobre "gar" y sube hacia el doblez de la derecha.
const BAND = "M118 50 C 168 60, 214 56, 248 42";

function Tail({
  x,
  y,
  rotate,
  length,
}: {
  x: number;
  y: number;
  rotate: number;
  length: number;
}) {
  const w = 27;
  const stripes = [16, 38, 60, 82].filter((s) => s < length - 12);
  const fringe = Array.from({ length: 5 }, (_, i) => 3 + i * 5.5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path
        d={`M0 0 L${w} 0 L${w} ${length} Q${w} ${length + 6} ${w - 6} ${length + 6}
            L6 ${length + 6} Q0 ${length + 6} 0 ${length} Z`}
        fill="url(#bufandaGrad)"
        stroke={CELESTE_D}
        strokeWidth="0.8"
      />
      {stripes.map((sy) => (
        <rect key={sy} x="0" y={sy} width={w} height="8" fill={BLANCO} opacity="0.96" />
      ))}
      {fringe.map((fx) => (
        <line
          key={fx}
          x1={fx}
          y1={length + 6}
          x2={fx}
          y2={length + 15}
          stroke={CELESTE}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export default function Bufanda({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 290 170"
      preserveAspectRatio="xMidYMin meet"
      className={`pointer-events-none absolute -top-[0.30em] left-0 w-full h-[1.7em] overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id="bufandaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CELESTE} />
          <stop offset="55%" stopColor={CELESTE} />
          <stop offset="100%" stopColor={CELESTE_D} />
        </linearGradient>
        <filter id="bufandaShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0a1230" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#bufandaShadow)">
        {/* Colitas paralelas que cuelgan rectas, pasando la última letra */}
        <Tail x={234} y={46} rotate={4} length={94} />
        <Tail x={252} y={44} rotate={-3} length={78} />

        {/* Banda apoyada: 3 trazos concéntricos → 5 franjas */}
        <path d={BAND} fill="none" stroke={CELESTE} strokeWidth="24" strokeLinecap="round" />
        <path d={BAND} fill="none" stroke={BLANCO} strokeWidth="14.5" strokeLinecap="round" />
        <path d={BAND} fill="none" stroke={CELESTE} strokeWidth="5" strokeLinecap="round" />

        {/* Doblez/nudo donde la banda cae en las colitas */}
        <g transform="translate(250 44)">
          <ellipse cx="0" cy="0" rx="12" ry="13" fill="url(#bufandaGrad)" stroke={CELESTE_D} strokeWidth="0.8" />
          <rect x="-12" y="-4" width="24" height="8" fill={BLANCO} opacity="0.96" />
        </g>
      </g>
    </svg>
  );
}
