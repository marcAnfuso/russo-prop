"use client";

import { useEffect, useRef, useState } from "react";

const D = "M5 12 Q 80 2, 150 10 T 295 8";

/**
 * Subrayado de "empieza acá" que se escribe con una bengalita: la punta
 * chisporrotea y va dejando el trazo dorado de izquierda a derecha. Al
 * llegar al final queda una estrellita titilando.
 */
export default function BengalaUnderline() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [punta, setPunta] = useState<{ x: number; y: number } | null>(null);
  const [fin, setFin] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = path.current!, s = svg.current!;
    const largo = p.getTotalLength();
    const ubicar = (t: number) => {
      const pt = p.getPointAtLength(largo * t);
      const r = s.getBoundingClientRect();
      setPunta({ x: (pt.x / 300) * r.width, y: (pt.y / 20) * r.height });
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduce) { setProgreso(1); ubicar(1); setFin(true); return; }
    const INICIO = 700, DUR = 2200;
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0 - INICIO) / DUR));
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgreso(e);
      ubicar(e);
      if (t < 1) raf = requestAnimationFrame(loop); else setFin(true);
    };
    raf = requestAnimationFrame(loop);
    const onResize = () => ubicar(1);
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <>
      <svg ref={svg} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 right-0 -bottom-2 w-full h-3 overflow-visible">
        <defs>
          <linearGradient id="bengala-oro" x1="0" x2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="0.5" stopColor="#fde68a" />
            <stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <path ref={path} d={D} stroke="url(#bengala-oro)" strokeWidth="5" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progreso} style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.7))" }} />
      </svg>
      {punta && (
        <span aria-hidden="true" className="absolute z-20 -bottom-2 left-0 h-3 w-full pointer-events-none">
          <span className={`bengala-punta ${fin ? "bengala-fin" : ""}`} style={{ left: punta.x, top: punta.y }}>
            {!fin && Array.from({ length: 10 }).map((_, i) => (
              <i key={i} style={{ "--a": `${i * 36 + (i % 2) * 14}deg`, "--d": `${(i % 3) * 0.07}s` } as React.CSSProperties} />
            ))}
            <b />
          </span>
        </span>
      )}
      <style jsx>{`
        .bengala-punta { position: absolute; width: 0; height: 0; }
        .bengala-punta b { position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: #fff; box-shadow: 0 0 10px 4px #fde68a, 0 0 22px 8px rgba(251,191,36,0.6); }
        .bengala-punta i { position: absolute; left: 0; top: -0.5px; width: 0.32em; height: 1.5px; background: linear-gradient(90deg, #fff, #fcd34d 50%, transparent); transform-origin: 0 50%; transform: rotate(var(--a)); animation: bengala-chispa 0.24s linear var(--d) infinite; }
        @keyframes bengala-chispa { 0% { opacity: 1; transform: rotate(var(--a)) scaleX(0.2); } 70% { opacity: 1; } 100% { opacity: 0; transform: rotate(calc(var(--a) + 20deg)) scaleX(1.2) translateX(4px); } }
        .bengala-fin b { width: 0; height: 0; left: 0; top: 0; background: none; box-shadow: none; }
        .bengala-fin b::before { content: "✦"; position: absolute; left: 0; top: 0; transform: translate(-30%, -60%); font-size: 0.32em; color: #fde68a; text-shadow: 0 0 8px #fbbf24; animation: bengala-estrella 2.4s ease-in-out infinite; }
        @keyframes bengala-estrella { 0%,100% { opacity: 1; transform: translate(-30%, -60%) scale(1) rotate(0); } 50% { opacity: 0.55; transform: translate(-30%, -60%) scale(0.7) rotate(25deg); } }
      `}</style>
    </>
  );
}
