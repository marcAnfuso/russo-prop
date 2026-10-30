"use client";

import type gsap from "gsap";
import { useEscena } from "./IntroStage";

/**
 * "La llave": una puerta vieja; por la cerradura ya se espía la web real. Entra
 * una llave con cabeza de calabaza, gira, la puerta se sacude y la cerradura se
 * agranda hasta que la web ocupa todo: se entra literalmente por el ojo de la
 * cerradura. El agujero es una máscara real, no un fundido.
 */
const TABLAS = [0, 118, 214, 356, 470, 612, 708, 842, 958, 1090, 1204, 1338, 1452];

function construir(tl: gsap.core.Timeline) {
  tl.from(".puerta-luz", { opacity: 0, duration: 0.7, ease: "power1.out" }, 0)
    .from(".t1", { y: 18, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, 0.3)
    .from(".llave", { y: 340, autoAlpha: 0, duration: 0.95, ease: "power3.out" }, 0.65)
    .to(".llave", { rotation: 90, svgOrigin: "800 462", duration: 0.42, ease: "back.out(1.7)" }, 1.75)
    .to(".resplandor", { opacity: 1, duration: 0.2, ease: "power2.out" }, 2.02)
    .to(".hoja", { x: 4, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, 2.02)
    .from(".t2", { y: 18, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 2.2)
    .to([".t1", ".t2", ".llave"], { autoAlpha: 0, duration: 0.22, ease: "power1.in" }, 3.3)
    .to(".agujero", { scale: 62, svgOrigin: "800 462", duration: 1.05, ease: "expo.in" }, 3.3);
}

function poster() {
  // Cuadro fijo: puerta, llave puesta y las dos frases.
}

export default function EscenaLlave({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  return (
    <div ref={root} className="absolute inset-0">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="ll-madera" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a2148" />
            <stop offset="55%" stopColor="#1b1a3f" />
            <stop offset="100%" stopColor="#100f2a" />
          </linearGradient>
          <radialGradient id="ll-luz" cx="800" cy="440" r="760" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7a4a2e" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#3b2a55" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#05050f" stopOpacity="0.72" />
          </radialGradient>
          <radialGradient id="ll-resplandor" cx="800" cy="462" r="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ll-bronce" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9c46a" />
            <stop offset="50%" stopColor="#a8742c" />
            <stop offset="100%" stopColor="#6e4a1c" />
          </linearGradient>
          <mask id="ll-cerradura" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000">
            <rect width="1600" height="1000" fill="#fff" />
            <g className="agujero" fill="#000">
              <circle cx="800" cy="444" r="25" />
              <path d="M789 458 L778 528 L822 528 L811 458 Z" />
            </g>
          </mask>
        </defs>

        <g mask="url(#ll-cerradura)">
          <g className="hoja">
            <rect x="-20" width="1640" height="1000" fill="url(#ll-madera)" />
            {/* tablas */}
            {TABLAS.map((x, i) => (
              <g key={x}>
                <rect x={x} width={i % 3 === 1 ? 118 : 96} height="1000" fill={i % 2 ? "#ffffff" : "#000000"} opacity={i % 2 ? 0.018 : 0.07} />
                <rect x={x} width="4" height="1000" fill="#070716" opacity="0.8" />
                <rect x={x + 4} width="1.5" height="1000" fill="#fff" opacity="0.05" />
              </g>
            ))}
            {/* vetas */}
            <g fill="none" stroke="#fff" strokeOpacity="0.035" strokeWidth="2">
              <path d="M60 0 C 74 240, 40 500, 66 1000" /><path d="M300 0 C 286 300, 330 620, 296 1000" />
              <path d="M540 0 C 556 260, 520 640, 548 1000" /><path d="M1010 0 C 990 280, 1030 620, 1006 1000" />
              <path d="M1270 0 C 1288 240, 1250 700, 1276 1000" /><path d="M1520 0 C 1500 320, 1540 640, 1516 1000" />
            </g>
            {/* herrajes */}
            {[150, 850].map((y) => (
              <g key={y}>
                <rect x="-20" y={y - 34} width="1640" height="68" fill="#15152c" />
                <rect x="-20" y={y - 34} width="1640" height="3" fill="#fff" opacity="0.1" />
                <rect x="-20" y={y + 31} width="1640" height="3" fill="#000" opacity="0.6" />
                {Array.from({ length: 15 }).map((_, i) => (
                  <g key={i}>
                    <circle cx={60 + i * 106} cy={y} r="10" fill="#2a2a48" />
                    <circle cx={57 + i * 106} cy={y - 3} r="3" fill="#fff" opacity="0.25" />
                  </g>
                ))}
              </g>
            ))}
            <rect width="1600" height="1000" fill="url(#ll-luz)" className="puerta-luz" />
            {/* chapa de la cerradura */}
            <rect x="714" y="326" width="172" height="316" rx="86" fill="#000" opacity="0.4" transform="translate(5 9)" />
            <rect x="714" y="326" width="172" height="316" rx="86" fill="url(#ll-bronce)" />
            <rect x="726" y="338" width="148" height="292" rx="74" fill="none" stroke="#3f2a0e" strokeOpacity="0.55" strokeWidth="3" />
            {[360, 608].map((y) => (
              <g key={y}>
                <circle cx="800" cy={y} r="9" fill="#5c3e16" />
                <circle cx="798" cy={y - 2} r="3" fill="#ffe7a8" opacity="0.8" />
              </g>
            ))}
            <rect width="1600" height="1000" fill="url(#ll-resplandor)" className="resplandor" opacity="0" />
          </g>
        </g>

        {/* llave con cabeza de calabaza */}
        <g className="llave">
          <rect x="792" y="462" width="16" height="136" rx="3" fill="url(#ll-bronce)" stroke="#3f2a0e" strokeOpacity="0.5" />
          <rect x="781" y="572" width="38" height="11" rx="3" fill="#a8742c" />
          <g transform="translate(800 630)">
            <path d="M-3 -36 C -3 -48, 6 -52, 13 -50 C 8 -46, 6 -42, 6 -36 Z" fill="#65a30d" />
            <ellipse rx="48" ry="39" fill="#f97316" />
            <ellipse cx="-26" rx="18" ry="37" fill="none" stroke="#c2410c" strokeWidth="2.5" />
            <ellipse cx="26" rx="18" ry="37" fill="none" stroke="#c2410c" strokeWidth="2.5" />
            <ellipse rx="10" ry="38" fill="none" stroke="#c2410c" strokeWidth="2.5" />
            <path d="M-29 -7 L-15 -20 L-10 -3 Z M29 -7 L15 -20 L10 -3 Z" fill="#fde047" />
            <path d="M-30 8 C -18 28, 18 28, 30 8 L 21 13 L 14 7 L 7 14 L 0 7 L -7 14 L -14 7 L -21 13 Z" fill="#fde047" />
          </g>
        </g>
      </svg>

      <p className="t1 absolute inset-x-6 top-[13%] text-center font-display text-[clamp(2.4rem,6.4vw,5rem)] font-bold leading-none tracking-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)] sm:top-[9%]">
        Feliz Halloween
      </p>
      <p className="t2 absolute inset-x-6 bottom-[8%] text-center font-display text-[clamp(1.6rem,3.6vw,2.9rem)] font-semibold italic leading-tight text-orange-200 [text-shadow:0_3px_18px_rgba(0,0,0,0.7)] sm:bottom-[7%]">
        Pasá, si te animás.
      </p>
    </div>
  );
}
