"use client";

import gsap from "gsap";
import { useEscena } from "@/components/halloween/intro/IntroStage";

/**
 * "La araña": la misma araña de la telaraña del home baja frente a una luna
 * enorme y se presenta. Mira para arriba, da dos tirones al hilo y levanta el
 * telón de la noche, que se lleva su borde deshilachado y deja ver la web.
 */
function construir(tl: gsap.core.Timeline, root: HTMLDivElement) {
  const alto = root.clientHeight;
  const destino = Math.round(alto * 0.31);
  const flecos = 110;

  tl.from(".luna", { scale: 0.86, opacity: 0, duration: 1, ease: "power3.out" }, 0)
    .from(".tela", { opacity: 0, duration: 0.7 }, 0.15)
    .fromTo(".colgante", { y: -alto * 0.5 }, { y: destino, duration: 1.15, ease: "back.out(1.35)" }, 0.15)
    .to(".colgante", { rotation: 2.2, duration: 1, yoyo: true, repeat: 2, ease: "sine.inOut", transformOrigin: "50% -60vh" }, 1.2)
    .to(".ojos", { scaleY: 0.08, svgOrigin: "0 -0.5", duration: 0.07, yoyo: true, repeat: 1 }, 1.25)
    .fromTo(".pata-saluda", { rotation: 0 }, { rotation: -34, svgOrigin: "6 -1", duration: 0.16, yoyo: true, repeat: 5, ease: "sine.inOut" }, 1.45)
    .from(".t1", { y: 18, autoAlpha: 0, duration: 0.55, ease: "power3.out" }, 1.05)
    .from(".t2", { y: 18, autoAlpha: 0, duration: 0.55, ease: "power3.out" }, 1.85)
    // Mira para arriba y tira del hilo dos veces…
    .to(".pupilas", { x: 0.7, y: -1.15, duration: 0.2, ease: "power2.out" }, 3.0)
    .to(".colgante", { y: destino + 16, duration: 0.11, yoyo: true, repeat: 3, ease: "power1.inOut" }, 3.22)
    .to(".telon", { y: 12, duration: 0.11, yoyo: true, repeat: 3, ease: "power1.inOut" }, 3.22)
    // …y sube con telón y todo.
    .to(".colgante", { y: -alto * 0.5, duration: 0.8, ease: "power3.in" }, 3.68)
    .to(".telon", { y: -(alto + flecos), duration: 1.0, ease: "power3.in" }, 3.68);
}

function poster() {
  gsap.set(".colgante", { y: Math.round(window.innerHeight * 0.31) });
}

export default function EscenaArana({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  const rayos = [0, 22, 45, 68, 90];
  const anillos = [70, 140, 210, 280];
  const p = (r: number, d: number) => [Math.cos((d * Math.PI) / 180) * r, Math.sin((d * Math.PI) / 180) * r];
  const tela = (
    <g fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.3" strokeLinecap="round">
      {rayos.map((d) => {
        const [x, y] = p(300, d);
        return <line key={d} x1="0" y1="0" x2={x} y2={y} />;
      })}
      {anillos.map((r) =>
        rayos.slice(0, -1).map((d, i) => {
          const [a, b] = p(r, d);
          const [c, e] = p(r, rayos[i + 1]);
          const [m, n] = p(r * 0.88, (d + rayos[i + 1]) / 2);
          return <path key={`${r}-${d}`} d={`M${a} ${b} Q ${m} ${n} ${c} ${e}`} />;
        }),
      )}
    </g>
  );

  return (
    <div ref={root} className="absolute inset-0">
      <div className="telon absolute inset-x-0 top-0 h-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,#3a2467_0%,#1c1647_48%,#0c0b2a_100%)]" />
        <div className="tela">
          <svg viewBox="0 0 300 300" className="absolute left-0 top-0 h-[34vmin] w-[34vmin]" aria-hidden="true">{tela}</svg>
          <svg viewBox="0 0 300 300" className="absolute right-0 top-0 h-[34vmin] w-[34vmin] -scale-x-100" aria-hidden="true">{tela}</svg>
        </div>
        <div className="luna absolute left-1/2 top-[37%] aspect-square w-[min(78vw,50vh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_36%,#fff8e0_0%,#f8e4ac_68%,#e3bd72_100%)] shadow-[0_0_120px_40px_rgba(248,228,172,0.22)]">
          <span className="absolute left-[18%] top-[62%] h-[13%] w-[13%] rounded-full bg-[#dcb976]/45" />
          <span className="absolute left-[70%] top-[24%] h-[9%] w-[9%] rounded-full bg-[#dcb976]/45" />
          <span className="absolute left-[74%] top-[62%] h-[17%] w-[17%] rounded-full bg-[#dcb976]/40" />
          <span className="absolute left-[24%] top-[16%] h-[7%] w-[7%] rounded-full bg-[#dcb976]/40" />
        </div>
        <div className="absolute inset-x-6 top-[66%] text-center sm:top-[68%]">
          <p className="t1 font-display text-[clamp(2.2rem,5.4vw,4.4rem)] font-bold leading-none tracking-tight text-white">¿Buscás casa?</p>
          <p className="t2 mt-3 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-semibold italic leading-tight text-orange-200">Yo ya encontré la mía.</p>
          <p className="t2 mt-5 text-[13px] font-semibold tracking-wide text-white/70 sm:text-sm">Feliz Halloween, de parte de Russo</p>
        </div>
        {/* borde deshilachado del telón */}
        <svg viewBox="0 0 1200 110" preserveAspectRatio="none" className="absolute inset-x-0 top-full h-[110px] w-full" aria-hidden="true">
          <path d="M0 0 H1200 V26 C 1160 70, 1110 70, 1070 28 C 1030 84, 970 84, 930 26 C 890 62, 840 62, 800 24 C 760 92, 690 92, 650 28 C 610 66, 560 66, 520 24 C 480 80, 420 80, 380 26 C 340 62, 290 62, 250 24 C 210 88, 140 88, 100 28 C 70 58, 30 58, 0 26 Z" fill="#0c0b2a" />
          <g stroke="#0c0b2a" strokeWidth="1.4" vectorEffect="non-scaling-stroke">
            <path d="M172 70 V110 M456 66 V100 M720 76 V108 M1000 68 V104 M300 50 V84 M860 50 V82" />
          </g>
        </svg>
      </div>

      <div className="colgante pointer-events-none absolute left-1/2 top-0 -ml-[min(19vw,12vh)]" style={{ width: "min(38vw, 24vh)" }}>
        <span className="absolute bottom-[60%] left-1/2 h-[120vh] w-[2px] -translate-x-1/2 bg-[#1b1740]/80" />
        <svg viewBox="-17 -15 34 32" className="w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="ar-cuerpo" cx="38%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#4a3d78" />
              <stop offset="100%" stopColor="#1d1737" />
            </radialGradient>
          </defs>
          <g stroke="#1d1737" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M-6 -1 C -10 -5, -13 -4, -14 -1 M-6.5 2 C -11 1, -13 3, -13.5 6 M-5.5 4.5 C -9 6, -10 9, -9.5 11.5 M-3.5 6 C -5 9, -5 11, -4 13" />
            <path d="M6.5 2 C 11 1, 13 3, 13.5 6 M5.5 4.5 C 9 6, 10 9, 9.5 11.5 M3.5 6 C 5 9, 5 11, 4 13" />
            <path className="pata-saluda" d="M6 -1 C 10 -5, 12 -9, 14 -10" />
          </g>
          <circle cx="0" cy="1" r="7.5" fill="url(#ar-cuerpo)" />
          <ellipse cx="-2.6" cy="-3.3" rx="2.4" ry="1.2" fill="#fff" opacity="0.14" transform="rotate(-24 -2.6 -3.3)" />
          <g transform="translate(3.5 -6.2) rotate(18)">
            <path d="M0 0 L-3.2 -2 C -3.8 -1, -3.8 1, -3.2 2 Z M0 0 L3.2 -2 C 3.8 -1, 3.8 1, 3.2 2 Z" fill="#f97316" />
            <circle r="1" fill="#fdba74" />
          </g>
          <g className="ojos">
            <circle cx="-2.7" cy="-0.5" r="2.5" fill="#fff" />
            <circle cx="2.7" cy="-0.5" r="2.5" fill="#fff" />
            <g className="pupilas">
              <circle cx="-2.4" cy="-0.1" r="1.25" fill="#14112c" />
              <circle cx="3" cy="-0.1" r="1.25" fill="#14112c" />
              <circle cx="-2" cy="-0.6" r="0.42" fill="#fff" />
              <circle cx="3.4" cy="-0.6" r="0.42" fill="#fff" />
            </g>
          </g>
          <circle cx="-5" cy="3" r="1.3" fill="#f472b6" opacity="0.85" />
          <circle cx="5" cy="3" r="1.3" fill="#f472b6" opacity="0.85" />
          <path d="M-2 3.3 Q 0 5.6, 2 3.3" stroke="#fff" strokeWidth="0.85" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}
