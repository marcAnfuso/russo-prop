"use client";

import type gsap from "gsap";
import { useEscena } from "@/components/halloween/intro/IntroStage";

/**
 * "El regalo": cae una caja magenta con moño dorado, tiembla, se desata el
 * moño, vuela la tapa con una lluvia de confeti y de adentro sube la casita de
 * Russo, iluminada. La cámara entra por su puerta: tu próxima casa es el regalo.
 */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const CONFETI_COLORES = ["#fcd34d", "#ff3fa4", "#ffffff", "#7dd3fc", "#22c55e", "#ef4444"];
const CONFETI = Array.from({ length: 56 }, (_, i) => {
  const a = -Math.PI / 2 + (rnd(i, 1) - 0.5) * 2.6;
  const v = 260 + rnd(i, 2) * 420;
  return {
    x: Math.round(Math.cos(a) * v),
    y: Math.round(Math.sin(a) * v),
    rot: Math.round((rnd(i, 3) - 0.5) * 900),
    w: 7 + Math.round(rnd(i, 4) * 7),
    h: 4 + Math.round(rnd(i, 5) * 5),
    c: CONFETI_COLORES[i % CONFETI_COLORES.length],
    redondo: i % 5 === 0,
  };
});
const BOKEH = Array.from({ length: 16 }, (_, i) => ({
  x: Math.round(rnd(i, 7) * 1600),
  y: Math.round(rnd(i, 8) * 1000),
  r: 30 + Math.round(rnd(i, 9) * 70),
  c: ["#e6007e", "#fbbf24", "#7dd3fc", "#22c55e"][i % 4],
}));

function construir(tl: gsap.core.Timeline, root: HTMLDivElement) {
  tl.from(".fondo", { opacity: 0, duration: 0.5 }, 0)
    .from(".bokeh", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 1.2, stagger: 0.04, ease: "power2.out" }, 0)
    .to(".bokeh", { y: -40, duration: 5, ease: "none" }, 0);

  // La caja cae y rebota.
  tl.from(".caja", { y: -760, duration: 0.95, ease: "bounce.out" }, 0.15)
    .from(".sombra", { scale: 0.2, opacity: 0, svgOrigin: "800 742", duration: 0.95, ease: "bounce.out" }, 0.15)
    .from(".t1", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 0.85);

  // Tiembla: algo hay adentro.
  tl.to(".caja", { rotation: 5, svgOrigin: "800 735", duration: 0.07, repeat: 5, yoyo: true, ease: "sine.inOut" }, 1.3)
    .to(".caja", { rotation: -4, svgOrigin: "800 735", duration: 0.07, repeat: 5, yoyo: true, ease: "sine.inOut" }, 1.75)
    .to(".caja", { rotation: 0, svgOrigin: "800 735", duration: 0.05 }, 2.15);

  // Se desata el moño y vuela la tapa.
  tl.to(".lazo", { scale: 0, rotation: 40, svgOrigin: "800 470", duration: 0.28, ease: "back.in(2)" }, 2.1)
    .to(".tapa", { x: 300, y: -440, rotation: 38, svgOrigin: "800 496", duration: 0.85, ease: "power2.out" }, 2.3)
    .to(".tapa", { autoAlpha: 0, duration: 0.3 }, 2.85);

  // Luz, confeti y la casita.
  tl.to(".rayos", { opacity: 1, duration: 0.35 }, 2.32)
    .fromTo(".rayos", { rotation: -14 }, { rotation: 14, svgOrigin: "800 520", duration: 2.2, ease: "none" }, 2.32);
  root.querySelectorAll<SVGElement>(".confeti").forEach((c, i) => {
    const m = CONFETI[i];
    tl.set(c, { autoAlpha: 1 }, 2.32)
      .fromTo(c, { x: 0, y: 0, rotation: 0 }, { x: m.x, y: m.y, rotation: m.rot, duration: 0.9, ease: "power3.out" }, 2.32)
      .to(c, { y: m.y + 380, rotation: m.rot * 1.6, duration: 1.4, ease: "power1.in" }, 3.22)
      .to(c, { autoAlpha: 0, duration: 0.4 }, 4.1);
  });
  tl.to(".casita", { y: -250, scale: 1.5, svgOrigin: "800 600", duration: 0.95, ease: "back.out(1.5)" }, 2.42)
    .from(".casita-halo", { opacity: 0, duration: 0.6 }, 2.6)
    .to(".casita-ventana", { opacity: 1, duration: 0.2, stagger: 0.12 }, 3.0)
    .from(".t2", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 2.85);

  // A la puerta de la casita.
  tl.to(".t1, .t2", { autoAlpha: 0, duration: 0.25 }, 3.85)
    .to(".mundo", { scale: 30, svgOrigin: "800 382", duration: 1.1, ease: "expo.in" }, 3.9)
    .to(".destello", { opacity: 1, duration: 0.3, ease: "power1.in" }, 4.72)
    .to(root, { autoAlpha: 0, duration: 0.42, ease: "power1.out" }, 5.0);
}

function poster() {
  document.querySelector<SVGElement>(".tapa")?.style.setProperty("visibility", "hidden");
  document.querySelector<SVGElement>(".casita")?.setAttribute("transform", "translate(-400 -550) scale(1.5)");
  document.querySelectorAll<SVGElement>(".casita-ventana").forEach((v) => (v.style.opacity = "1"));
}

export default function EscenaRegalo({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  return (
    <div ref={root} className="absolute inset-0 bg-[#0a0d2c]">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="rg-fondo" cx="50%" cy="55%" r="70%">
            <stop offset="0%" stopColor="#2b3277" />
            <stop offset="60%" stopColor="#151a4c" />
            <stop offset="100%" stopColor="#080a26" />
          </radialGradient>
          <filter id="rg-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          <linearGradient id="rg-caja" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2d97" />
            <stop offset="100%" stopColor="#b8005f" />
          </linearGradient>
          <linearGradient id="rg-tapa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4aa6" />
            <stop offset="100%" stopColor="#d1006e" />
          </linearGradient>
          <linearGradient id="rg-oro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#f5b82e" />
            <stop offset="100%" stopColor="#c98a12" />
          </linearGradient>
          <linearGradient id="rg-rayo" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="rg-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="mundo">
          <rect className="fondo" x="-100" y="-100" width="1800" height="1200" fill="url(#rg-fondo)" />
          <g filter="url(#rg-blur)">
            {BOKEH.map((b, i) => (
              <circle key={i} className="bokeh" cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity="0.16" />
            ))}
          </g>

          <g className="rayos" opacity="0">
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d="M790 520 L760 -200 L840 -200 L810 520 Z" fill="url(#rg-rayo)" transform={`rotate(${-78 + i * 12} 800 520)`} />
            ))}
          </g>

          <ellipse className="sombra" cx="800" cy="742" rx="150" ry="16" fill="#000" opacity="0.35" />

          <g className="caja">
            {/* la casita espera adentro (la tapa la del frente la tapan) */}
            <g className="casita">
              <circle className="casita-halo" cx="800" cy="600" r="150" fill="url(#rg-halo)" />
              <path d="M730 640 L730 590 L800 532 L870 590 L870 640 Z" fill="#fff" />
              <path d="M716 596 L800 524 L884 596" fill="none" stroke="#e6007e" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
              <rect x="845" y="540" width="14" height="30" fill="#fff" />
              <path d="M786 640 L786 610 C 786 598, 814 598, 814 610 L814 640 Z" fill="#fff7dc" stroke="#e6007e" strokeWidth="3" />
              <rect className="casita-ventana" x="744" y="598" width="26" height="22" rx="2" fill="#fcd34d" opacity="0.25" />
              <rect className="casita-ventana" x="830" y="598" width="26" height="22" rx="2" fill="#fcd34d" opacity="0.25" />
              <circle cx="800" cy="574" r="8" fill="#fcd34d" />
            </g>

            {/* cuerpo */}
            <rect x="680" y="524" width="240" height="210" rx="6" fill="url(#rg-caja)" />
            <rect x="680" y="524" width="240" height="18" fill="#000" opacity="0.15" />
            <rect x="787" y="524" width="26" height="210" fill="url(#rg-oro)" />
            <rect x="680" y="612" width="240" height="24" fill="url(#rg-oro)" />
            <g fill="#fff" opacity="0.18">
              <circle cx="716" cy="566" r="5" /><circle cx="884" cy="690" r="5" /><circle cx="740" cy="700" r="4" /><circle cx="870" cy="572" r="4" />
            </g>

            {/* tapa con moño */}
            <g className="tapa">
              <rect x="664" y="470" width="272" height="58" rx="6" fill="url(#rg-tapa)" />
              <rect x="783" y="470" width="34" height="58" fill="url(#rg-oro)" />
              <g className="lazo">
                <path d="M800 470 C 760 420, 700 420, 716 458 C 726 478, 770 476, 800 470 Z" fill="url(#rg-oro)" stroke="#b07a10" strokeWidth="2" />
                <path d="M800 470 C 840 420, 900 420, 884 458 C 874 478, 830 476, 800 470 Z" fill="url(#rg-oro)" stroke="#b07a10" strokeWidth="2" />
                <path d="M792 474 L770 520 L782 516 L786 528 L800 476 Z M808 474 L830 520 L818 516 L814 528 L800 476 Z" fill="#e0a21c" />
                <circle cx="800" cy="470" r="13" fill="#f5b82e" stroke="#b07a10" strokeWidth="2" />
              </g>
            </g>
          </g>

          <g transform="translate(800 520)">
            {CONFETI.map((c, i) =>
              c.redondo ? (
                <circle key={i} className="confeti" r={c.h} fill={c.c} style={{ visibility: "hidden" }} />
              ) : (
                <rect key={i} className="confeti" x={-c.w / 2} y={-c.h / 2} width={c.w} height={c.h} rx="1" fill={c.c} style={{ visibility: "hidden" }} />
              ),
            )}
          </g>
        </g>

        <rect className="destello" x="-100" y="-100" width="1800" height="1200" fill="#fff7dc" opacity="0" />
      </svg>

      <div className="absolute inset-x-6 bottom-[4%] text-center sm:bottom-[3.5%]">
        <p className="t1 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-white">
          Este año, el regalo es grande.
        </p>
        <p className="t2 mt-1 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-semibold italic leading-tight text-pink-200">
          Tiene puerta, ventanas y es tuyo.
        </p>
      </div>
    </div>
  );
}
