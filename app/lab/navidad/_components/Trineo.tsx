"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useArranque } from "./useArranque";
import { RotateCcw } from "lucide-react";

export const EVENTO_TRINEO = "russo:trineo";
const CLAVE = "russo_trineo_dia";

/** Fecha de hoy en Argentina (YYYY-MM-DD): el trineo pasa una vez por día. */
function hoyAR() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

/**
 * Un reno galopando. `nariz` lo convierte en el que va adelante, con la
 * nariz roja que brilla.
 */
function Reno({ x, fase, nariz = false }: { x: number; fase: number; nariz?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g className="tr-reno" style={{ animationDelay: `${fase}s` }}>
        {/* patas traseras / delanteras: se abren y cierran al galopar */}
        <g stroke="#6b3f1d" strokeWidth="3.2" strokeLinecap="round">
          <path className="tr-pata-a" style={{ animationDelay: `${fase}s` }} d="M6 66 L 0 82" />
          <path className="tr-pata-b" style={{ animationDelay: `${fase}s` }} d="M10 66 L 14 82" />
          <path className="tr-pata-a" style={{ animationDelay: `${fase}s` }} d="M34 66 L 42 80" />
          <path className="tr-pata-b" style={{ animationDelay: `${fase}s` }} d="M30 66 L 28 82" />
        </g>
        {/* cuerpo */}
        <ellipse cx="20" cy="60" rx="20" ry="10" fill="#8b5a2b" />
        <ellipse cx="22" cy="64" rx="13" ry="5" fill="#c08a5a" opacity="0.6" />
        <path d="M1 56 C -5 52, -6 48, -3 46 C -1 50, 1 52, 4 54 Z" fill="#c08a5a" />
        {/* arnés con cascabel */}
        <path d="M30 52 C 33 58, 33 64, 30 69" stroke="#dc2626" strokeWidth="3.5" fill="none" />
        <circle cx="33" cy="61" r="2.6" fill="#fbbf24" stroke="#b45309" strokeWidth="0.7" />
        {/* cuello y cabeza */}
        <path d="M32 54 C 36 46, 38 40, 40 36 L 46 38 C 44 44, 42 50, 38 57 Z" fill="#8b5a2b" />
        <ellipse cx="47" cy="36" rx="9" ry="6.5" fill="#8b5a2b" transform="rotate(12 47 36)" />
        <circle cx="47" cy="33" r="1.6" fill="#1a1a2e" />
        <circle cx="47.5" cy="32.5" r="0.5" fill="#fff" />
        <path d="M41 30 C 39 26, 40 24, 42 25" fill="#6b3f1d" />
        {/* cuernos */}
        <g stroke="#a16207" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M43 30 C 41 22, 38 18, 34 14 M39 21 L 35 22 M41 25 L 37 27" />
          <path d="M46 29 C 47 21, 46 16, 48 11 M47 18 L 51 16 M46.5 23 L 50 22" />
        </g>
        {/* nariz */}
        {nariz ? (
          <circle className="tr-nariz" cx="55.5" cy="38" r="3.6" fill="#ef4444" />
        ) : (
          <circle cx="55" cy="38" r="2.4" fill="#3f2a17" />
        )}
      </g>
    </g>
  );
}

function TrineoSVG() {
  return (
    <svg viewBox="0 0 540 110" className="h-full w-auto overflow-visible" aria-hidden="true">
      <defs>
        <filter id="tr-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="tr-trineo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* riendas doradas: del trineo a cada reno */}
      <g stroke="#fbbf24" strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M200 62 C 240 58, 260 60, 282 60" />
        <path d="M200 62 C 270 54, 320 58, 352 59" />
        <path d="M200 62 C 300 50, 380 56, 422 58" />
        <path d="M200 62 C 330 46, 440 54, 492 57" />
      </g>

      <Reno x={262} fase={0.15} />
      <Reno x={332} fase={0.05} />
      <Reno x={402} fase={0.2} />
      <Reno x={472} fase={0} nariz />

      {/* el trineo */}
      <g className="tr-trineo">
        {/* bolsa de regalos, con una casita magenta (la de Russo) */}
        <path d="M40 58 C 30 40, 44 20, 66 22 C 84 22, 92 40, 86 58 Z" fill="#7c4a1e" />
        <path d="M58 24 C 60 19, 66 18, 68 22" stroke="#5b3413" strokeWidth="2.5" fill="none" />
        <rect x="46" y="12" width="16" height="16" rx="2" fill="#16a34a" transform="rotate(-10 54 20)" />
        <path d="M54 12 L 54 28 M46 20 L 62 20" stroke="#fbbf24" strokeWidth="2" transform="rotate(-10 54 20)" />
        <g transform="translate(64 2) rotate(8)">
          <path d="M0 10 L 10 0 L 20 10 Z" fill="#b80065" />
          <rect x="2" y="10" width="16" height="13" fill="#e6007e" />
          <rect x="8" y="15" width="5" height="8" fill="#fde68a" />
          <path d="M10 0 L 10 23" stroke="#fbbf24" strokeWidth="1.6" />
        </g>
        {/* Papá Noel */}
        <g className="tr-noel">
          <path d="M104 60 C 100 44, 106 32, 120 30 C 132 30, 138 42, 136 60 Z" fill="#dc2626" />
          <rect x="102" y="46" width="36" height="6" rx="3" fill="#1a1a2e" />
          <rect x="116" y="45.5" width="7" height="7" rx="1.5" fill="#fbbf24" />
          <circle cx="122" cy="22" r="9.5" fill="#fcd5b5" />
          <path d="M112 24 C 112 36, 132 38, 132 24 C 128 29, 116 29, 112 24 Z" fill="#fff" />
          <circle cx="126" cy="23" r="2.4" fill="#f9a8a8" />
          <circle cx="124" cy="19" r="1.2" fill="#1a1a2e" />
          <path d="M112 16 C 114 4, 128 2, 134 12 C 138 8, 140 6, 136 2" fill="none" />
          <path d="M111 17 C 112 6, 126 1, 132 9 L 140 4 L 136 14 Z" fill="#dc2626" />
          <rect x="109" y="14" width="26" height="6" rx="3" fill="#fff" />
          <circle cx="140" cy="4" r="4" fill="#fff" />
          {/* brazo saludando */}
          <g className="tr-saludo">
            <path d="M132 38 C 140 34, 144 26, 146 18" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" fill="none" />
            <circle cx="146.5" cy="15.5" r="4.5" fill="#fff" />
          </g>
        </g>
        {/* casco del trineo */}
        <path d="M28 54 L 176 54 C 196 54, 204 46, 206 36 C 212 44, 210 60, 196 70 C 186 78, 168 80, 150 80 L 44 80 C 32 80, 26 66, 28 54 Z" fill="url(#tr-trineo)" />
        <path d="M30 60 L 196 60" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M40 72 C 60 66, 80 66, 100 72 C 120 66, 140 66, 160 72" stroke="#fde68a" strokeWidth="1.5" fill="none" opacity="0.8" />
        {/* cartelito pintado a mano con el logo de Russo */}
        <g transform="rotate(-2.5 112 67)">
          <rect x="66" y="55" width="94" height="24" rx="3" fill="#fff8ec" stroke="#b7791f" strokeWidth="1.6" />
          <rect x="68.5" y="57.5" width="89" height="19" rx="2" fill="none" stroke="#e8c27a" strokeWidth="0.8" strokeDasharray="2 1.5" />
          <circle cx="69.5" cy="58.5" r="1" fill="#b7791f" /><circle cx="156.5" cy="58.5" r="1" fill="#b7791f" />
          <circle cx="69.5" cy="75.5" r="1" fill="#b7791f" /><circle cx="156.5" cy="75.5" r="1" fill="#b7791f" />
          {/* el isotipo, a pincel: cuadrado, 4 triángulos, rombo azul, la I, la P y el rombito */}
          <g transform="translate(72 58) scale(0.18)">
            <rect x="0" y="0" width="100" height="100" rx="3" fill="#1b1f7a" />
            <path d="M5 5 L50 5 L5 50 Z M5 50 L5 95 L50 95 Z" fill="#8c0d45" />
            <path d="M50 5 L95 5 L95 50 Z M95 50 L95 95 L50 95 Z" fill="#ec1a74" />
            <path d="M50 7 L50 93 L7 50 Z" fill="#18217f" />
            <path d="M50 7 L93 50 L50 93 Z" fill="#2330a6" />
            <rect x="22" y="33" width="23" height="35" rx="2.5" fill="#fff" />
            <path d="M51 33 H63 A 16 16 0 0 1 63 65 H51 Z" fill="#fff" />
            <path d="M69 45 L86 62 L69 79 L52 62 Z" fill="#ec1a74" />
            <path d="M69 52 L79 62 L69 72 L59 62 Z" fill="#fff" />
          </g>
          <text x="93" y="69.8" fontFamily="Impact, Anton, 'Arial Narrow', 'Liberation Sans Narrow', 'Arial Black', sans-serif" fontWeight="900" fontSize="13.5" fill="#15122b" stroke="#15122b" strokeWidth="0.7" strokeLinejoin="round" letterSpacing="0.2" textLength="50" lengthAdjust="spacingAndGlyphs">RUSSO</text>
          <text x="93.5" y="75.6" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="4.3" fill="#15122b" letterSpacing="1.15" textLength="50" lengthAdjust="spacingAndGlyphs">PROPIEDADES</text>
        </g>
        {/* patines */}
        <path d="M30 92 L 188 92 C 204 92, 212 86, 212 78 C 212 72, 206 70, 202 74" stroke="#d4a017" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M60 80 L 60 92 M150 80 L 150 92" stroke="#d4a017" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

type Chispa = { id: number; x: number; y: number; c: string; s: number };

/**
 * El trineo de Papá Noel cruzando la pantalla de izquierda a derecha, con
 * un cartel tipo avioneta "Está llegando la Navidad…" y una estela de
 * estrellitas. Pasa UNA vez por día por dispositivo (localStorage), dura
 * ~8 s, no se puede clickear (pointer-events: none) y vuela por la franja
 * del cielo del Hero, así que nunca bloquea nada. Avisa a Russia por el
 * evento `russo:trineo` para que diga "¡Mirá arriba!".
 *
 * `lab`: pasa en cada carga y muestra un botón para repetirlo.
 */
export default function Trineo({ lab = false, demoraMs = 2200, texto = "Está llegando la Navidad…", top = 150, esperar, boton = lab }: { lab?: boolean; demoraMs?: number; texto?: string; top?: number; esperar?: string; boton?: boolean }) {
  const listo = useArranque(esperar);
  const [vuelo, setVuelo] = useState(0);
  const [chispas, setChispas] = useState<Chispa[]>([]);
  const grupo = useRef<HTMLDivElement>(null);

  const volar = useCallback(() => setVuelo((n) => n + 1), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!listo) return;
    if (!lab) {
      try {
        if (localStorage.getItem(CLAVE) === hoyAR()) return;
        localStorage.setItem(CLAVE, hoyAR());
      } catch { /* sin storage: pasa igual */ }
    }
    const t = setTimeout(volar, demoraMs);
    return () => clearTimeout(t);
  }, [lab, demoraMs, volar, listo]);

  // Animación del vuelo: posición por rAF + estrellitas que quedan atrás.
  useEffect(() => {
    if (!vuelo) return;
    window.dispatchEvent(new Event(EVENTO_TRINEO));
    const el = grupo.current!;
    const DUR = 8500;
    const t0 = performance.now();
    let raf = 0;
    let ultimaChispa = 0;
    let id = 0;
    const colores = ["#fde68a", "#ffffff", "#fbbf24", "#f9a8d4"];
    const loop = (now: number) => {
      const t = (now - t0) / DUR;
      const W = window.innerWidth;
      const ancho = el.offsetWidth;
      const x = -ancho + (W + ancho) * t;
      const y = Math.sin(t * Math.PI * 2.2) * 16 - t * 24; // ondula y va subiendo un poquito
      const inclinacion = Math.cos(t * Math.PI * 2.2) * -3;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${inclinacion}deg)`;
      if (now - ultimaChispa > 45) {
        ultimaChispa = now;
        const r = el.getBoundingClientRect();
        // la estela sale de atrás del trineo (entre el cartel y el trineo)
        const sx = r.left + r.width * 0.36 + Math.random() * 24;
        const sy = r.top + r.height * (0.55 + Math.random() * 0.35);
        setChispas((cs) => [...cs.slice(-40), { id: id++, x: sx, y: sy, c: colores[id % colores.length], s: 4 + Math.random() * 7 }]);
      }
      if (t < 1) raf = requestAnimationFrame(loop);
      else setTimeout(() => setChispas([]), 1400);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vuelo]);

  return (
    <>
      {vuelo > 0 && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 z-[45] h-0" style={{ top }}>
          <div key={vuelo} ref={grupo} className="absolute left-0 top-0 flex items-center will-change-transform" style={{ transform: "translate3d(-200vw,0,0)" }}>
            {/* cartel tipo avioneta */}
            <div className="tr-cartel relative mr-1 whitespace-nowrap rounded-md bg-white/95 px-3 py-1.5 font-display text-[13px] font-bold text-navy shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-2 ring-amber-300 sm:px-4 sm:py-2 sm:text-lg">
              <span className="text-magenta">🎄</span> {texto}
              <span className="absolute -left-2 top-0 h-full w-2 rounded-l bg-[repeating-linear-gradient(180deg,#dc2626_0_6px,#fff_6px_12px)]" />
            </div>
            <svg viewBox="0 0 60 20" className="h-4 w-10 shrink-0 sm:w-14" preserveAspectRatio="none"><path d="M0 10 Q 30 2, 60 12" stroke="#fde68a" strokeWidth="1.5" fill="none" /></svg>
            <div className="h-[64px] sm:h-[100px]"><TrineoSVG /></div>
          </div>
        </div>
      )}
      {chispas.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[44]">
          {chispas.map((c) => (
            <span key={c.id} className="tr-chispa absolute" style={{ left: c.x, top: c.y, color: c.c, fontSize: c.s }}>✦</span>
          ))}
        </div>
      )}
      {boton && (
        <button type="button" onClick={volar} className="fixed right-4 top-[180px] z-30 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-navy shadow-md ring-1 ring-gray-200 hover:text-magenta sm:right-6">
          <RotateCcw className="h-3 w-3" /> Que pase el trineo (lab)
        </button>
      )}
      <style jsx global>{`
        .tr-reno { animation: tr-galope 0.42s ease-in-out infinite; }
        @keyframes tr-galope { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-5px) rotate(-3deg); } }
        .tr-pata-a, .tr-pata-b { transform-box: view-box; }
        .tr-pata-a { animation: tr-pata-a 0.42s ease-in-out infinite; transform-origin: center; }
        .tr-pata-b { animation: tr-pata-b 0.42s ease-in-out infinite; }
        @keyframes tr-pata-a { 0%, 100% { transform: skewX(0); } 50% { transform: skewX(-22deg); } }
        @keyframes tr-pata-b { 0%, 100% { transform: skewX(0); } 50% { transform: skewX(22deg); } }
        .tr-nariz { filter: url(#tr-glow); animation: tr-nariz 0.8s ease-in-out infinite; }
        @keyframes tr-nariz { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        .tr-trineo { animation: tr-trineo 1.2s ease-in-out infinite; }
        @keyframes tr-trineo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        .tr-saludo { transform-box: view-box; transform-origin: 132px 38px; animation: tr-saludo 0.9s ease-in-out infinite; }
        @keyframes tr-saludo { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-22deg); } }
        .tr-cartel { transform-origin: right center; animation: tr-flamea 0.9s ease-in-out infinite; }
        @keyframes tr-flamea { 0%, 100% { transform: skewY(0) rotate(0); } 50% { transform: skewY(-2.5deg) rotate(1.5deg); } }
        .tr-chispa { text-shadow: 0 0 6px currentColor; animation: tr-chispa 1.3s ease-out forwards; }
        @keyframes tr-chispa { 0% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0); } 100% { opacity: 0; transform: translate(-14px, 22px) scale(0.3) rotate(90deg); } }
      `}</style>
    </>
  );
}
