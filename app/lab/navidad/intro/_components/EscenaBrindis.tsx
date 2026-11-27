"use client";

import type gsap from "gsap";
import { useEscena } from "@/components/halloween/intro/IntroStage";

/**
 * "Brindis de verano": noche del 24 sobre los techos del barrio. Entran dos
 * copas de sidra, chocan (¡chin chin!), las burbujas suben al cielo y se
 * vuelven fuegos artificiales; el último, dorado y enorme, se vuelve la web.
 */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const ESTRELLAS = Array.from({ length: 30 }, (_, i) => [Math.round(rnd(i, 1) * 1600), Math.round(rnd(i, 2) * 520), 0.8 + rnd(i, 3) * 1.6]);

// Techos del barrio: casas bajas, algún edificio, un tanque de agua.
const EDIFICIOS = (() => {
  const out: { x: number; w: number; h: number; techo: boolean }[] = [];
  let x = -60;
  let i = 0;
  while (x < 1660) {
    const alto = rnd(i, 4) < 0.22;
    const w = alto ? 70 + Math.round(rnd(i, 5) * 50) : 90 + Math.round(rnd(i, 6) * 80);
    const h = alto ? 220 + Math.round(rnd(i, 7) * 140) : 90 + Math.round(rnd(i, 8) * 70);
    out.push({ x, w, h, techo: !alto && rnd(i, 9) < 0.55 });
    x += w + 6;
    i++;
  }
  return out;
})();
const VENTANAS = EDIFICIOS.flatMap((e, i) => {
  const vs: [number, number][] = [];
  for (let fy = 1000 - e.h + 22; fy < 960; fy += 34) {
    for (let fx = e.x + 14; fx < e.x + e.w - 18; fx += 26) {
      if (rnd(fx, fy + i) < 0.32) vs.push([fx, fy]);
    }
  }
  return vs;
});

const FUEGOS = [
  { x: 430, y: 250, c: "#ff3fa4", r: 110, t: 2.15 },
  { x: 1180, y: 210, c: "#7dd3fc", r: 120, t: 2.35 },
  { x: 720, y: 160, c: "#fcd34d", r: 100, t: 2.6 },
  { x: 1010, y: 330, c: "#ffffff", r: 90, t: 2.8 },
  { x: 270, y: 140, c: "#fcd34d", r: 80, t: 3.0 },
  { x: 1400, y: 340, c: "#ff3fa4", r: 85, t: 3.1 },
];
const BURBUJAS = Array.from({ length: 18 }, (_, i) => ({
  dx: Math.round((rnd(i, 11) - 0.5) * 40),
  r: 3 + Math.round(rnd(i, 12) * 4),
  f: i % FUEGOS.length,
}));

function construir(tl: gsap.core.Timeline, root: HTMLDivElement) {
  tl.from(".estrella", { opacity: 0, duration: 0.6, stagger: 0.015 }, 0)
    .from(".barrio", { y: 120, duration: 1, ease: "power3.out" }, 0)
    .from(".luz-ventana", { opacity: 0, duration: 0.2, stagger: { each: 0.012, from: "random" } }, 0.3);

  // Las copas entran y chocan.
  tl.from(".copa-izq", { x: -720, y: 160, rotation: -25, svgOrigin: "766 560", duration: 1.0, ease: "power3.out" }, 0.25)
    .from(".copa-der", { x: 720, y: 160, rotation: 25, svgOrigin: "834 560", duration: 1.0, ease: "power3.out" }, 0.25)
    .to(".copa-izq", { x: -16, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 1.25)
    .to(".copa-der", { x: 16, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 1.25)
    .fromTo(".chispa", { scale: 0, opacity: 1 }, { scale: 1.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.55, ease: "power2.out" }, 1.22)
    .from(".t1", { scale: 0.6, autoAlpha: 0, duration: 0.45, ease: "back.out(2.4)", transformOrigin: "50% 60%" }, 1.25)
    .to(".liquido", { rotation: 4, transformOrigin: "50% 20%", duration: 0.12, repeat: 5, yoyo: true, ease: "sine.inOut" }, 1.25);

  // Las burbujas suben al cielo...
  root.querySelectorAll<SVGElement>(".burbuja").forEach((b, i) => {
    const m = BURBUJAS[i];
    const f = FUEGOS[m.f];
    const t = 1.35 + (i % 6) * 0.06;
    tl.set(b, { autoAlpha: 1 }, t)
      .fromTo(b, { x: m.dx, y: 0 }, { x: f.x - 800, y: f.y - 392, duration: f.t - t, ease: "power1.in" }, t)
      .to(b, { autoAlpha: 0, duration: 0.08 }, f.t - 0.02);
  });
  // ...y explotan.
  root.querySelectorAll<SVGElement>(".fuego").forEach((g, i) => {
    const f = FUEGOS[i];
    tl.set(g, { autoAlpha: 1 }, f.t)
      .fromTo(g, { scale: 0.1 }, { scale: 1, transformOrigin: "0px 0px", duration: 0.75, ease: "power3.out" }, f.t)
      .to(g, { y: 26, duration: 1.3, ease: "power1.in" }, f.t + 0.4)
      .to(g, { autoAlpha: 0, duration: 0.7, ease: "power1.in" }, f.t + 0.75);
  });
  tl.from(".t2", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 2.4);

  // El último, dorado, se abre hasta ocupar todo.
  tl.to(".t1, .t2", { autoAlpha: 0, duration: 0.25 }, 3.75)
    .set(".gran-fuego", { autoAlpha: 1 }, 3.75)
    .fromTo(".gran-fuego", { scale: 0.05 }, { scale: 14, transformOrigin: "50% 50%", duration: 1.1, ease: "expo.in" }, 3.75)
    .to(".destello", { opacity: 1, duration: 0.35, ease: "power1.in" }, 4.5)
    .to(root, { autoAlpha: 0, duration: 0.42, ease: "power1.out" }, 4.85);
}

function poster() {
  document.querySelectorAll<SVGElement>(".fuego").forEach((g) => g.style.setProperty("visibility", "visible"));
}

function Copa({ lado }: { lado: "izq" | "der" }) {
  const id = `bc-cuerpo-${lado}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d="M-36 0 C -36 92, -28 168, 0 190 C 28 168, 36 92, 36 0 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <g className="liquido">
          <rect x="-80" y="46" width="160" height="170" fill="url(#bc-sidra)" />
          <path d="M-80 46 Q -40 40, 0 46 T 80 46 L 80 54 L -80 54 Z" fill="#fff4c2" opacity="0.8" />
          {[[-14, 90], [10, 120], [-4, 150], [16, 80], [-20, 130]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" fill="#fffbe8" opacity="0.8" />
          ))}
        </g>
      </g>
      <path d="M-36 0 C -36 92, -28 168, 0 190 C 28 168, 36 92, 36 0 Z" fill="#ffffff" fillOpacity="0.08" stroke="#fff" strokeOpacity="0.75" strokeWidth="2.5" />
      <path d="M-24 14 C -24 80, -20 130, -8 160" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
      <rect x="-3" y="188" width="6" height="140" fill="#fff" fillOpacity="0.55" />
      <ellipse cx="0" cy="330" rx="48" ry="9" fill="#fff" fillOpacity="0.35" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
      {lado === "izq" ? (
        <path d="M-6 200 C -20 210, -30 206, -34 196 M-6 200 C -20 196, -28 186, -26 178" stroke="#e6007e" strokeWidth="5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M6 200 C 20 210, 30 206, 34 196 M6 200 C 20 196, 28 186, 26 178" stroke="#e6007e" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function Fuego({ x, y, c, r }: { x: number; y: number; c: string; r: number }) {
  const n = 18;
  return (
    <g>
      <circle cx={x} cy={y} r={r * 0.9} fill={c} opacity="0.12" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const x1 = x + Math.cos(a) * r * 0.25, y1 = y + Math.sin(a) * r * 0.25;
        const x2 = x + Math.cos(a) * r, y2 = y + Math.sin(a) * r;
        return (
          <g key={i}>
            <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke={c} strokeWidth="3" strokeLinecap="round" />
            <circle cx={(x + Math.cos(a + 0.17) * r * 0.72).toFixed(1)} cy={(y + Math.sin(a + 0.17) * r * 0.72).toFixed(1)} r="2.6" fill="#fff" />
          </g>
        );
      })}
    </g>
  );
}

export default function EscenaBrindis({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  return (
    <div ref={root} className="absolute inset-0 bg-[#070a24]">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="bc-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060822" />
            <stop offset="55%" stopColor="#1a1a55" />
            <stop offset="100%" stopColor="#5a2163" />
          </linearGradient>
          <linearGradient id="bc-sidra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <radialGradient id="bc-gran" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7dc" />
            <stop offset="45%" stopColor="#fcd34d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="-100" y="-100" width="1800" height="1200" fill="url(#bc-cielo)" />
        {ESTRELLAS.map(([x, y, r], i) => (
          <circle key={i} className="estrella" cx={x} cy={y} r={r.toFixed(1)} fill="#fff" opacity="0.8" />
        ))}

        {FUEGOS.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            <g className="fuego" style={{ visibility: "hidden" }}>
              <Fuego x={0} y={0} c={f.c} r={f.r} />
            </g>
          </g>
        ))}

        <g className="barrio">
          {EDIFICIOS.map((e, i) => (
            <g key={i} fill="#0b0c2a">
              <rect x={e.x} y={1000 - e.h} width={e.w} height={e.h + 20} />
              {e.techo && <path d={`M${e.x - 6} ${1000 - e.h} L${e.x + e.w / 2} ${1000 - e.h - 34} L${e.x + e.w + 6} ${1000 - e.h} Z`} />}
              {i % 4 === 1 && <rect x={e.x + e.w - 34} y={1000 - e.h - 26} width="22" height="26" rx="3" />}
            </g>
          ))}
          {VENTANAS.map(([x, y], i) => (
            <rect key={i} className="luz-ventana" x={x} y={y} width="12" height="16" rx="1.5" fill={i % 7 === 0 ? "#fda4af" : "#fcd34d"} opacity={0.55 + (i % 3) * 0.15} />
          ))}
        </g>

        <g className="copa-izq">
          <g transform="translate(766 392) rotate(14)"><Copa lado="izq" /></g>
        </g>
        <g className="copa-der">
          <g transform="translate(834 392) rotate(-14)"><Copa lado="der" /></g>
        </g>
        <g className="chispa" opacity="0">
          <path d="M800 352 L806 386 L840 392 L806 398 L800 432 L794 398 L760 392 L794 386 Z" fill="#fff7dc" />
          <circle cx="800" cy="392" r="26" fill="#fde68a" opacity="0.5" />
        </g>

        <g transform="translate(800 392)">
          {BURBUJAS.map((b, i) => (
            <circle key={i} className="burbuja" r={b.r} fill="#fff7dc" fillOpacity="0.35" stroke="#fffbe8" strokeWidth="1.5" style={{ visibility: "hidden" }} />
          ))}
        </g>

        <circle className="gran-fuego" cx="800" cy="420" r="140" fill="url(#bc-gran)" style={{ visibility: "hidden" }} />
        <rect className="destello" x="-100" y="-100" width="1800" height="1200" fill="#fff7dc" opacity="0" />
      </svg>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#070a24] via-[#070a24]/80 to-transparent" />
      <div className="absolute inset-x-6 bottom-[4%] text-center sm:bottom-[3.5%]">
        <p className="t1 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight text-white">
          ¡Chin chin!
        </p>
        <p className="t2 mt-1 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-semibold italic leading-tight text-amber-200">
          Que el próximo lo brindes en tu casa nueva.
        </p>
      </div>
    </div>
  );
}
