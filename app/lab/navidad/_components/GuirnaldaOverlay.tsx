"use client";

import { useMemo } from "react";

/**
 * Guirnalda de luces colgada de lado a lado del Hero, justo debajo del
 * navbar. El cable hace tres "panzas" (parábolas) y las lamparitas cuelgan
 * de él siguiendo la tangente. Al entrar se prenden de izquierda a derecha;
 * después titilan suave, cada una a su ritmo. Si pasás el mouse por una, se
 * hamaca. Colores de marca: blanco cálido, dorado y magenta.
 *
 * El cable es un SVG estirado (viewBox 1000×H con preserveAspectRatio none)
 * y las lamparitas son divs ubicados con la misma fórmula, así no se
 * deforman en ningún ancho de pantalla.
 */
const H = 120; // alto de la guirnalda en px (= unidades verticales del viewBox)
const TOP = 6; // altura de los ganchos
const PANZAS = [
  { from: 0, to: 360, sag: 70 },
  { from: 360, to: 690, sag: 58 },
  { from: 690, to: 1000, sag: 74 },
];
const COLORES = [
  { glass: "#fff4cf", glow: "rgba(255,236,170,0.95)" }, // blanco cálido
  { glass: "#fbbf24", glow: "rgba(251,191,36,0.9)" }, // dorado
  { glass: "#ff3fa4", glow: "rgba(230,0,126,0.9)" }, // magenta Russo
];

type Lampara = { x: number; y: number; ang: number; color: (typeof COLORES)[number]; i: number; titila: number; ritmo: number };

function calcularLamparas(porPanza: number): Lampara[] {
  const out: Lampara[] = [];
  let i = 0;
  for (const p of PANZAS) {
    for (let k = 1; k <= porPanza; k++) {
      const t = k / (porPanza + 1);
      const x = p.from + (p.to - p.from) * t;
      const y = TOP + p.sag * 4 * t * (1 - t);
      // pendiente de la parábola, corregida por el estirado horizontal (aprox)
      const dy = p.sag * 4 * (1 - 2 * t);
      const dx = p.to - p.from;
      const ang = (Math.atan2(dy, dx * 1.3) * 180) / Math.PI;
      // pseudo-aleatorio estable (no Math.random → nada de hydration mismatch)
      const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      const r2 = (n: number) => Math.round(n * 100) / 100;
      out.push({ x: r2(x), y: r2(y), ang: r2(ang), color: COLORES[i % COLORES.length], i, titila: r2(2.4 + r * 3.2), ritmo: r2(r * 4) });
      i++;
    }
  }
  return out;
}

export default function GuirnaldaOverlay({ top = 72 }: { top?: number } = {}) {
  const lamparas = useMemo(() => calcularLamparas(9), []);
  const d = PANZAS.map((p) => `M${p.from} ${TOP} Q ${(p.from + p.to) / 2} ${TOP + p.sag * 2} ${p.to} ${TOP}`).join(" ");

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-[6] [--k:0.42] sm:[--k:1]" style={{ top, height: `calc(var(--k) * ${H}px)` }}>
      <svg viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={d} fill="none" stroke="#0b1020" strokeWidth="2.2" vectorEffect="non-scaling-stroke" opacity="0.85" />
        <path d={d} fill="none" stroke="#ffffff" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.25" />
      </svg>
      {lamparas.map((l) => (
        <span
          key={l.i}
          className={`gl-pivote absolute ${l.i % 2 ? "hidden sm:block" : ""}`}
          style={{ left: `${(l.x / 10).toFixed(2)}%`, top: `calc(var(--k) * ${l.y}px)`, transform: `rotate(${l.ang}deg)` }}
        >
          <span
            className="gl-lampara pointer-events-auto block"
            style={
              {
                "--glass": l.color.glass,
                "--glow": l.color.glow,
                "--on": `${(0.5 + l.i * 0.06).toFixed(2)}s`,
                "--tit": `${l.titila}s`,
                "--ritmo": `${l.ritmo}s`,
              } as React.CSSProperties
            }
          >
            <span className="gl-rosca" />
            <span className="gl-vidrio" />
          </span>
        </span>
      ))}
      <style jsx>{`
        .gl-pivote { width: 0; height: 0; }
        .gl-lampara {
          position: absolute; left: -6px; top: -2px; width: 12px; height: 26px;
          transform-origin: 6px 0; cursor: default;
        }
        .gl-lampara:hover { animation: gl-hamaca 1.4s ease-out; }
        .gl-rosca { position: absolute; left: 3px; top: 0; width: 6px; height: 7px; border-radius: 1.5px; background: linear-gradient(90deg, #1f2937, #4b5563, #1f2937); }
        .gl-vidrio {
          position: absolute; left: 0; top: 6px; width: 12px; height: 18px;
          border-radius: 50% 50% 50% 50% / 38% 38% 62% 62%;
          background: radial-gradient(circle at 35% 30%, #ffffff 0 18%, var(--glass) 45%);
          opacity: 0.18; filter: saturate(0.4);
          animation: gl-prende 0.5s ease-out var(--on) forwards, gl-titila var(--tit) ease-in-out calc(var(--on) + 0.6s + var(--ritmo)) infinite;
        }
        @keyframes gl-prende {
          0% { opacity: 0.18; filter: saturate(0.4); box-shadow: none; }
          60% { opacity: 1; filter: saturate(1) brightness(1.4); box-shadow: 0 0 18px 6px var(--glow); }
          100% { opacity: 1; filter: saturate(1); box-shadow: 0 0 12px 3px var(--glow); }
        }
        @keyframes gl-titila {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px 3px var(--glow); }
          50% { opacity: 0.72; box-shadow: 0 0 6px 1px var(--glow); }
        }
        @keyframes gl-hamaca {
          0% { transform: rotate(0); } 20% { transform: rotate(22deg); } 45% { transform: rotate(-14deg); }
          65% { transform: rotate(8deg); } 85% { transform: rotate(-3deg); } 100% { transform: rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gl-vidrio { animation: none; opacity: 1; filter: none; box-shadow: 0 0 10px 2px var(--glow); }
          .gl-lampara:hover { animation: none; }
        }
      `}</style>
    </div>
  );
}
