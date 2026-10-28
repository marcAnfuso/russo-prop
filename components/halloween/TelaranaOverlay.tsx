"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambiente, sin copy: una telaraña fina en la esquina superior izquierda
 * del Hero, una arañita que baja de su hilo al entrar (y si la tocás se
 * asusta, sube y vuelve a bajar) y tres murciélagos que cruzan una sola
 * vez. Se monta como overlay absoluto sobre el Hero real.
 * Respeta prefers-reduced-motion (nada se mueve; la araña queda colgada).
 */
function Telarana() {
  const spokes = [0, 22, 45, 68, 90];
  const rings = [40, 80, 120, 160];
  const pt = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [Math.cos(a) * r, Math.sin(a) * r] as const;
  };
  return (
    <svg viewBox="0 0 170 170" aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.42]">
      <g stroke="#fff" strokeWidth="1" fill="none" strokeLinecap="round">
        {spokes.map((d) => { const [x, y] = pt(168, d); return <line key={d} x1="0" y1="0" x2={x} y2={y} />; })}
        {rings.map((r) =>
          spokes.slice(0, -1).map((d, i) => {
            const [x1, y1] = pt(r, d); const [x2, y2] = pt(r, spokes[i + 1]);
            const [mx, my] = pt(r * 0.9, (d + spokes[i + 1]) / 2);
            return <path key={`${r}-${d}`} d={`M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} />;
          })
        )}
      </g>
    </svg>
  );
}

/**
 * Araña simpática (ojos grandes, sonrisa, moñito) colgando de un hilo que
 * sale de la telaraña. El hilo crece al cargar (la araña baja), después se
 * balancea, pestañea y saluda con una patita. Al pasarle el mouse o tocarla,
 * sube rápido y a los 2,5 s vuelve a bajar.
 */
// El hilo sale del nudo donde el rayo de 45° cruza el último anillo (r=160)
// de la telaraña (viewBox de 170): 160·cos45° / 170 ≈ 66,55% en ambos ejes.
const NUDO = ((160 * Math.SQRT1_2) / 170) * 100;

function AranaColgando() {
  const [asustada, setAsustada] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const asustar = () => {
    if (asustada) return;
    setAsustada(true);
    timer.current = setTimeout(() => {
      setAsustada(false);
      setVuelta((n) => n + 1); // remonta el hilo para que vuelva a bajar
    }, 2500);
  };

  return (
    <div className="hw-hilo-pivote absolute" style={{ left: `${NUDO}%`, top: `${NUDO}%` }}>
      <div key={vuelta} className={`hw-hilo ${asustada ? "hw-hilo-sube" : ""}`}>
        <span className="absolute left-0 top-0 h-full w-px -translate-x-1/2 bg-white/55" />
        <button
          type="button"
          aria-label="Araña"
          tabIndex={-1}
          onMouseEnter={asustar}
          onClick={asustar}
          className="pointer-events-auto absolute bottom-0 left-0 -translate-x-1/2 translate-y-[85%] cursor-pointer p-1"
        >
          <svg viewBox="-17 -15 34 32" className="h-[38px] w-[38px] sm:h-[46px] sm:w-[46px] overflow-visible drop-shadow-[0_0_4px_rgba(255,255,255,0.55)]">
            {/* patas: redonditas y cortas, la delantera derecha saluda */}
            <g stroke="#2a2340" strokeWidth="1.7" strokeLinecap="round" fill="none">
              <path d="M-6 -1 C -10 -5, -13 -4, -14 -1 M-6.5 2 C -11 1, -13 3, -13.5 6 M-5.5 4.5 C -9 6, -10 9, -9.5 11.5 M-3.5 6 C -5 9, -5 11, -4 13" />
              <path d="M6.5 2 C 11 1, 13 3, 13.5 6 M5.5 4.5 C 9 6, 10 9, 9.5 11.5 M3.5 6 C 5 9, 5 11, 4 13" />
              <path className="hw-saluda" d="M6 -1 C 10 -5, 12 -9, 14 -10" />
            </g>
            {/* cuerpo */}
            <circle cx="0" cy="1" r="7.5" fill="#2a2340" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.7" />
            {/* moñito naranja */}
            <g transform="translate(3.5 -6.2) rotate(18)">
              <path d="M0 0 L-3.2 -2 L-3.2 2 Z M0 0 L3.2 -2 L3.2 2 Z" fill="#f97316" />
              <circle r="1" fill="#fdba74" />
            </g>
            {/* ojos grandes que pestañean */}
            <g className="hw-ojos">
              <circle cx="-2.7" cy="-0.5" r="2.5" fill="#fff" />
              <circle cx="2.7" cy="-0.5" r="2.5" fill="#fff" />
              <circle cx="-2.4" cy="-0.1" r="1.25" fill="#1a1a2e" />
              <circle cx="3" cy="-0.1" r="1.25" fill="#1a1a2e" />
              <circle cx="-2" cy="-0.6" r="0.45" fill="#fff" />
              <circle cx="3.4" cy="-0.6" r="0.45" fill="#fff" />
            </g>
            {/* cachetes y sonrisa */}
            <circle cx="-5" cy="3" r="1.3" fill="#f472b6" opacity="0.85" />
            <circle cx="5" cy="3" r="1.3" fill="#f472b6" opacity="0.85" />
            <path d="M-2 3.3 Q 0 5.6, 2 3.3" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        .hw-hilo-pivote { --largo: 34px; transform-origin: top center; animation: hw-pendulo 4.5s ease-in-out 3.6s infinite; }
        @media (min-width: 640px) { .hw-hilo-pivote { --largo: 150px; } }
        .hw-hilo { position: relative; width: 0; height: 0; animation: hw-baja 2.8s cubic-bezier(0.25, 0.8, 0.35, 1) 0.9s forwards, hw-respira 3.2s ease-in-out 3.7s infinite; }
        .hw-hilo-sube { animation: hw-sube 0.45s cubic-bezier(0.5, 0, 0.8, 0.3) forwards !important; height: var(--largo); }
        @keyframes hw-baja { from { height: 0; } to { height: var(--largo); } }
        @keyframes hw-respira { 0%, 100% { height: var(--largo); } 50% { height: calc(var(--largo) - 10px); } }
        @keyframes hw-sube { to { height: 0; } }
        @keyframes hw-pendulo { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(2.5deg); } 75% { transform: rotate(-2.5deg); } }
        :global(.hw-ojos) { transform-box: fill-box; transform-origin: center; animation: hw-pestanea 4.2s ease-in-out 2s infinite; }
        @keyframes hw-pestanea { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        :global(.hw-saluda) { transform-box: view-box; transform-origin: 6px -1px; animation: hw-saluda 5s ease-in-out 3.8s infinite; }
        @keyframes hw-saluda { 0%, 60%, 100% { transform: rotate(0deg); } 68% { transform: rotate(-28deg); } 76% { transform: rotate(10deg); } 84% { transform: rotate(-28deg); } 92% { transform: rotate(0deg); } }
        @media (prefers-reduced-motion: reduce) {
          .hw-hilo-pivote, :global(.hw-ojos), :global(.hw-saluda) { animation: none; }
          .hw-hilo { animation: none; height: var(--largo); }
        }
      `}</style>
    </div>
  );
}

const BAT = "M32 12 C 28 4, 20 2, 12 8 C 8 2, 2 4, 0 10 C 6 8, 10 12, 12 18 C 16 14, 22 14, 26 20 L 32 26 L 38 20 C 42 14, 48 14, 52 18 C 54 12, 58 8, 64 10 C 62 4, 56 2, 52 8 C 44 2, 36 4, 32 12 Z";

const BATS = [
  { top: "22%", size: 34, delay: 0.6, dur: 11 },
  { top: "31%", size: 24, delay: 2.4, dur: 13 },
  { top: "17%", size: 18, delay: 4.1, dur: 12 },
];

export default function TelaranaOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-[5]">
      <div className="absolute left-0 top-[80px] h-[150px] w-[150px] sm:h-[190px] sm:w-[190px]">
        <Telarana />
        <AranaColgando />
      </div>
      {BATS.map((b, i) => (
        <svg key={i} viewBox="0 0 64 32" className="hw-bat absolute" style={{ top: b.top, width: b.size, height: b.size / 2, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
          <path d={BAT} fill="#1a1a2e" opacity="0.75" />
        </svg>
      ))}
      <style jsx>{`
        @keyframes hw-cross {
          0%   { transform: translate3d(-80px, 0, 0) scaleX(1); opacity: 0; }
          8%   { opacity: 1; }
          25%  { transform: translate3d(25vw, -14px, 0) scaleX(0.6); }
          50%  { transform: translate3d(50vw, 8px, 0) scaleX(1); }
          75%  { transform: translate3d(75vw, -10px, 0) scaleX(0.6); }
          92%  { opacity: 1; }
          100% { transform: translate3d(calc(100vw + 80px), 4px, 0) scaleX(1); opacity: 0; }
        }
        :global(.hw-bat) { left: 0; opacity: 0; animation-name: hw-cross; animation-timing-function: linear; animation-fill-mode: forwards; animation-iteration-count: 1; }
        @media (prefers-reduced-motion: reduce) { :global(.hw-bat) { display: none; } }
      `}</style>
    </div>
  );
}
