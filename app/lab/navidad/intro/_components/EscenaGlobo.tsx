"use client";

import { useMemo } from "react";
import type gsap from "gsap";
import { useEscena } from "@/components/halloween/intro/IntroStage";

/**
 * "La bola de nieve de Russo": cae una bola de cristal con la casita adentro,
 * alguien la sacude, la nieve se arremolina y, cuando se asienta, se prenden
 * las luces de la casa y del arbolito. Papá Noel pasa por arriba dejando una
 * estela, y la cámara se mete en la bola y entra por la puerta: la web.
 *
 * Composición en columna (título arriba, bola al medio, frase abajo) para que
 * las letras nunca pisen el dibujo, en ninguna pantalla.
 */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Bola: centro (500, 430), radio 290. Base de 700 a 880.
const CX = 500;
const CY = 430;
const R = 290;

const NIEVE_ADENTRO = Array.from({ length: 64 }, (_, i) => {
  const a = rnd(i, 1) * Math.PI * 2;
  const d = Math.sqrt(rnd(i, 2)) * (R - 30);
  return {
    x0: Math.round(CX + (rnd(i, 3) - 0.5) * 420),
    y0: Math.round(650 + rnd(i, 4) * 50),
    x: Math.round(CX + Math.cos(a) * d),
    y: Math.round(CY + Math.sin(a) * d * 0.9 - 40),
    r: 2 + Math.round(rnd(i, 5) * 3),
    caida: 70 + Math.round(rnd(i, 6) * 120),
    vaiven: Math.round((rnd(i, 7) - 0.5) * 40),
  };
});
const NIEVE_AFUERA = Array.from({ length: 60 }, (_, i) => ({
  x: Math.round(rnd(i, 8) * 1700) - 50,
  y: Math.round(rnd(i, 9) * 800) - 200,
  r: 1.5 + Math.round(rnd(i, 10) * 25) / 10,
  caida: 300 + Math.round(rnd(i, 11) * 300),
}));
const BOKEH = Array.from({ length: 14 }, (_, i) => ({
  x: Math.round(rnd(i, 12) * 1600),
  y: Math.round(rnd(i, 13) * 1000),
  r: 30 + Math.round(rnd(i, 14) * 70),
  c: ["#fde68a", "#ffffff", "#fca5a5"][i % 3],
}));
const ESTRELLAS = Array.from({ length: 22 }, (_, i) => {
  const a = rnd(i, 15) * Math.PI * 2;
  const d = Math.sqrt(rnd(i, 16)) * (R - 20);
  return [Math.round(CX + Math.cos(a) * d), Math.round(CY - 60 + Math.sin(a) * d * 0.55), 0.8 + rnd(i, 17) * 1.4];
}).filter(([, y]) => y < 420);

const COLORES = ["#ef4444", "#fff7e6", "#fbbf24"];
function tramo(x1: number, y1: number, x2: number, y2: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return [Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t)] as const;
  });
}
const FOCOS = [...tramo(398, 486, 500, 396, 7), ...tramo(500, 396, 602, 486, 7), ...tramo(590, 498, 410, 498, 8)];
const BOLITAS = [
  [330, 520, "#ef4444"], [312, 548, "#fff"], [344, 556, "#fbbf24"], [300, 584, "#ef4444"], [356, 590, "#fff"],
  [326, 610, "#fbbf24"], [292, 622, "#fff"], [368, 624, "#ef4444"],
  [672, 556, "#fff"], [688, 584, "#ef4444"], [660, 600, "#fbbf24"], [700, 618, "#fff"],
] as const;

/** Mismo cálculo que la tira de arriba, así los dos números coinciden. */
function diasAlBrindis() {
  const brindis = new Date("2026-12-25T00:00:00-03:00").getTime();
  return Math.ceil((brindis - Date.now()) / 86400000);
}

function construir(tl: gsap.core.Timeline, root: HTMLDivElement) {
  // Fondo: bokeh y nieve de afuera todo el rato.
  tl.from(".bokeh", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%", duration: 1.2, stagger: 0.05, ease: "power2.out" }, 0);
  root.querySelectorAll<SVGElement>(".copo-afuera").forEach((c, i) => {
    tl.fromTo(c, { y: 0 }, { y: NIEVE_AFUERA[i].caida * 2, duration: 5.6, ease: "none" }, 0);
  });

  // La bola cae y rebota.
  tl.from(".bola", { y: -1100, duration: 1.0, ease: "bounce.out" }, 0.1)
    .from(".sombra", { scaleX: 0.2, opacity: 0, transformOrigin: "50% 50%", duration: 1.0, ease: "bounce.out" }, 0.1)
    .fromTo(".cuenta", { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, 0.3)
    .from(".t1 .letra", { y: 30, autoAlpha: 0, rotation: 8, duration: 0.5, stagger: 0.025, ease: "back.out(2.5)" }, 0.45);

  // ¡La sacuden! La nieve sube.
  tl.to(".agitable", { rotation: 9, svgOrigin: "500 880", duration: 0.09, repeat: 7, yoyo: true, ease: "sine.inOut" }, 1.15)
    .to(".agitable", { rotation: 0, svgOrigin: "500 880", duration: 0.25, ease: "elastic.out(1, 0.4)" }, 1.87);
  root.querySelectorAll<SVGElement>(".copo").forEach((c, i) => {
    const m = NIEVE_ADENTRO[i];
    tl.to(c, { x: m.x - m.x0, y: m.y - m.y0, duration: 0.7, ease: "power3.out" }, 1.2 + (i % 8) * 0.02)
      .to(c, { y: `+=${m.caida}`, duration: 3.0, ease: "sine.inOut" }, 1.95)
      .to(c, { x: `+=${m.vaiven}`, duration: 1.0, repeat: 2, yoyo: true, ease: "sine.inOut" }, 1.95);
  });

  // Se prende todo.
  tl.to(".ventana", { opacity: 1, duration: 0.25, stagger: 0.12 }, 2.0)
    .to(".foco", { opacity: 1, duration: 0.07, stagger: 0.035 }, 2.05)
    .from(".bolita", { scale: 0, transformOrigin: "50% 0%", duration: 0.3, stagger: 0.04, ease: "back.out(3)" }, 2.1)
    .fromTo(".estrella-arbol", { scale: 0, rotation: -140 }, { scale: 1, rotation: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2.4)" }, 2.55)
    .to(".halo-estrella", { opacity: 1, duration: 0.4 }, 2.65)
    .from(".t2", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 2.4)
    .fromTo(".titila", { opacity: 1 }, { opacity: 0.35, immediateRender: false, duration: 0.2, repeat: 3, yoyo: true, stagger: 0.02 }, 2.9);

  // Papá Noel pasa por arriba de la bola, en arco, con estela.
  const vuelo = (sel: string, d: number) => {
    tl.set(sel, { autoAlpha: 1 }, 2.2 + d)
      .fromTo(sel, { x: 60 }, { x: 940, duration: 1.9, ease: "none" }, 2.2 + d)
      .fromTo(sel, { y: 330 }, { y: 70, duration: 0.95, ease: "sine.out" }, 2.2 + d)
      .to(sel, { y: 300, duration: 0.95, ease: "sine.in" }, 3.15 + d)
      .fromTo(sel, { rotation: -16 }, { rotation: 16, duration: 1.9, ease: "none" }, 2.2 + d)
      .to(sel, { autoAlpha: 0, duration: 0.25 }, 3.85 + d);
  };
  vuelo(".trineo", 0);
  root.querySelectorAll<SVGElement>(".estela").forEach((_, i) => vuelo(`.estela-${i}`, 0.05 + i * 0.05));
  tl.to(".reno-pata", { rotation: 25, transformOrigin: "50% 0%", duration: 0.11, repeat: 15, yoyo: true, ease: "sine.inOut" }, 2.2);

  // Adentro de la bola, por la puerta.
  tl.to(".cuenta, .t1, .t2", { autoAlpha: 0, duration: 0.3 }, 4.0)
    .to(".fondo", { opacity: 0, duration: 0.6 }, 4.0)
    .to(".puerta", { scaleX: 0.08, transformOrigin: "0% 50%", duration: 0.45, ease: "power2.inOut" }, 3.85)
    .to(".zoom", { scale: 22, svgOrigin: "500 594", duration: 1.1, ease: "expo.in" }, 4.05)
    .to(".destello", { opacity: 1, duration: 0.3, ease: "power1.in" }, 4.85)
    .to(root, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, 5.15);
}

function poster() {
  document.querySelectorAll<SVGElement>(".foco, .ventana").forEach((v) => (v.style.opacity = "1"));
}

function Trineo() {
  return (
    <g transform="scale(1.45)">
      {/* renos */}
      {[0, 52].map((dx) => (
        <g key={dx} transform={`translate(${dx + 40} -4)`}>
          <ellipse cx="0" cy="0" rx="17" ry="8" fill="#8b5a2b" />
          <path d="M13 -4 L21 -14" stroke="#8b5a2b" strokeWidth="6" strokeLinecap="round" />
          <circle cx="23" cy="-15" r="5.5" fill="#8b5a2b" />
          <path d="M20 -20 L17 -30 M17 -26 L12 -30 M24 -20 L28 -30 M28 -26 L33 -29" stroke="#5c3a1a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28.5" cy="-14" r={dx ? 3.4 : 2} fill={dx ? "#ef4444" : "#3b2412"} />
          <g className="reno-pata"><path d="M-10 4 L-14 17 M10 4 L14 17" stroke="#6b4423" strokeWidth="3" strokeLinecap="round" /></g>
        </g>
      ))}
      <path d="M-8 -2 C 10 -8, 30 -6, 40 -4 M-8 2 C 30 4, 70 0, 92 -4" stroke="#fbbf24" strokeWidth="1.6" fill="none" />
      {/* trineo con Papá Noel */}
      <path d="M-70 -14 L-12 -14 C -6 -14, -4 -4, -8 6 L-58 6 C -70 6, -76 -2, -70 -14 Z" fill="#dc2626" />
      <path d="M-70 -14 L-12 -14" stroke="#fbbf24" strokeWidth="3" />
      <path d="M-78 14 L-4 14 C 4 14, 6 8, 2 4" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="-38" cy="-24" r="10" fill="#dc2626" />
      <circle cx="-36" cy="-34" r="7" fill="#fcd9b8" />
      <path d="M-42 -32 C -42 -24, -30 -24, -30 -32 Z" fill="#fff" />
      <path d="M-44 -38 L-30 -38 L-40 -52 Z" fill="#dc2626" />
      <circle cx="-41" cy="-52" r="3" fill="#fff" />
      <rect x="-45" y="-40" width="16" height="4" rx="2" fill="#fff" />
      <rect x="-66" y="-30" width="18" height="16" rx="3" fill="#e6007e" />
      <path d="M-57 -30 V-14 M-66 -22 H-48" stroke="#fbbf24" strokeWidth="2" />
    </g>
  );
}

export default function EscenaGlobo({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  const dias = useMemo(() => diasAlBrindis(), []);
  const cuenta = dias <= 0 ? "Se vienen las fiestas" : dias === 1 ? "¡Esta noche brindamos!" : dias <= 40 ? `Faltan ${dias} días para el brindis` : "Se vienen las fiestas";
  const titulo = "Está llegando la Navidad";

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-[#7a0d1c]">
      {/* Fondo rojo con bokeh y nieve */}
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="fondo absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="gb-fondo" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#c8102e" />
            <stop offset="55%" stopColor="#8f0e22" />
            <stop offset="100%" stopColor="#4a0611" />
          </radialGradient>
          <filter id="gb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
          <pattern id="gb-rayas" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="30" height="60" fill="#fff" opacity="0.035" />
          </pattern>
        </defs>
        <rect width="1600" height="1000" fill="url(#gb-fondo)" />
        <rect width="1600" height="1000" fill="url(#gb-rayas)" />
        <g filter="url(#gb-blur)">
          {BOKEH.map((b, i) => <circle key={i} className="bokeh" cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity="0.13" />)}
        </g>
        {NIEVE_AFUERA.map((c, i) => <circle key={i} className="copo-afuera" cx={c.x} cy={c.y} r={c.r} fill="#fff" opacity="0.75" />)}
      </svg>

      <div className="relative flex h-full flex-col items-center px-4 pb-[3vh] pt-16 sm:pt-[5vh]">
        {/* Arriba: cuenta regresiva y título */}
        <div className="cuenta mb-3 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b0102a] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] sm:text-[13px]">
          🎄 {cuenta}
        </div>
        <h2 className="t1 text-center font-display text-[clamp(2rem,5.2vw,4.4rem)] font-bold leading-[1.02] tracking-tight text-white [text-shadow:0_4px_24px_rgba(60,0,10,0.5)]" aria-label={titulo}>
          {titulo.split(" ").map((palabra, pi) => (
            <span key={pi} className="inline-block whitespace-nowrap">
              {palabra.split("").map((l, li) => <span key={li} className="letra inline-block">{l}</span>)}
              {pi < titulo.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
            </span>
          ))}
          <span className="letra inline-block text-amber-300">…</span>
        </h2>

        {/* Medio: la bola */}
        <svg viewBox="0 0 1000 960" preserveAspectRatio="xMidYMid meet" className="mt-1 min-h-0 w-full flex-1 overflow-visible" aria-hidden="true">
          <defs>
            <clipPath id="gb-adentro"><circle cx={CX} cy={CY} r={R - 4} /></clipPath>
            <linearGradient id="gb-noche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e1440" />
              <stop offset="70%" stopColor="#1a2251" />
              <stop offset="100%" stopColor="#2b3a7a" />
            </linearGradient>
            <radialGradient id="gb-vidrio" cx="38%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.02" />
              <stop offset="92%" stopColor="#dbeafe" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="gb-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a2a14" />
              <stop offset="100%" stopColor="#2e140a" />
            </linearGradient>
            <linearGradient id="gb-oro" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b7791f" />
              <stop offset="35%" stopColor="#fde68a" />
              <stop offset="65%" stopColor="#f6c453" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <radialGradient id="gb-luz" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gb-adentro-casa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffaf0" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>

          <ellipse className="sombra" cx="500" cy="905" rx="300" ry="26" fill="#2a0008" opacity="0.45" />

          <g className="bola">
            <g className="zoom">
              <g className="agitable">
                {/* adentro de la bola */}
                <g clipPath="url(#gb-adentro)">
                  <rect x={CX - R} y={CY - R} width={R * 2} height={R * 2} fill="url(#gb-noche)" />
                  {ESTRELLAS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r.toFixed(1)} fill="#fff" opacity="0.8" />)}
                  <circle cx="640" cy="230" r="34" fill="#fff7e0" opacity="0.95" />
                  <circle cx="654" cy="222" r="30" fill="#1a2251" opacity="0.95" />

                  {/* colinas nevadas */}
                  <path d="M190 640 C 300 590, 420 610, 500 612 C 600 614, 700 580, 820 620 L820 760 L190 760 Z" fill="#e8eef8" />

                  {/* arbolitos */}
                  <g>
                    <rect x="322" y="626" width="16" height="22" fill="#6b3d1f" />
                    <path d="M270 636 L330 520 L390 636 Z" fill="#14532d" />
                    <path d="M284 582 L330 486 L376 582 Z" fill="#166534" />
                    <path d="M298 530 L330 460 L362 530 Z" fill="#15803d" />
                    <path d="M276 632 C 300 624, 360 624, 386 632 L390 638 L270 638 Z M288 578 C 310 572, 350 572, 374 578 L376 582 L284 582 Z" fill="#fff" />
                    <circle className="halo-estrella" cx="330" cy="452" r="30" fill="url(#gb-luz)" opacity="0" />
                    <path className="estrella-arbol" d="M330 438 L334 448 L345 449 L337 456 L340 467 L330 461 L320 467 L323 456 L315 449 L326 448 Z" fill="#fcd34d" />
                    <rect x="676" y="626" width="12" height="18" fill="#6b3d1f" />
                    <path d="M640 634 L682 548 L724 634 Z" fill="#14532d" />
                    <path d="M652 588 L682 520 L712 588 Z" fill="#166534" />
                    <path d="M644 630 C 670 624, 700 624, 720 630 L724 636 L640 636 Z" fill="#fff" />
                  </g>
                  {BOLITAS.map(([x, y, c], i) => (
                    <g key={i} className="bolita">
                      <circle cx={x} cy={y} r="5.5" fill={c} stroke={c === "#fff" ? "#e5e7eb" : "none"} />
                      <circle cx={x - 1.6} cy={y - 1.6} r="1.5" fill="#fff" opacity="0.8" />
                    </g>
                  ))}

                  {/* la casita */}
                  <g>
                    <rect x="556" y="412" width="26" height="50" fill="#b91c1c" />
                    <path d="M552 412 C 558 402, 572 404, 576 408 C 582 402, 590 404, 588 414 L552 414 Z" fill="#fff" />
                    <rect x="420" y="482" width="160" height="134" fill="#fdf8f1" />
                    <path d="M398 490 L500 392 L602 490 Z" fill="#b91c1c" />
                    <path d="M392 492 L500 384 L608 492 L600 498 C 594 506, 584 504, 580 498 C 572 506, 560 504, 556 496 L500 418 L444 496 C 440 504, 428 506, 420 498 C 414 504, 404 504, 400 498 Z" fill="#fff" />
                    {[[434, 516], [536, 516]].map(([x, y]) => (
                      <g key={x}>
                        <g className="ventana" opacity="0">
                          <circle cx={x + 15} cy={y + 17} r="40" fill="url(#gb-luz)" />
                          <rect x={x} y={y} width="30" height="34" rx="2" fill="#fde68a" />
                        </g>
                        <rect x={x} y={y} width="30" height="34" rx="2" fill="none" stroke="#b91c1c" strokeWidth="3" />
                        <path d={`M${x + 15} ${y} V${y + 34} M${x} ${y + 17} H${x + 30}`} stroke="#b91c1c" strokeWidth="2.5" />
                        <path d={`M${x - 4} ${y + 36} Q ${x + 15} ${y + 44}, ${x + 34} ${y + 36}`} stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
                      </g>
                    ))}
                    <g className="ventana" opacity="0">
                      <circle cx="500" cy="458" r="26" fill="url(#gb-luz)" />
                      <circle cx="500" cy="458" r="11" fill="#fde68a" />
                    </g>
                    <circle cx="500" cy="458" r="13" fill="none" stroke="#166534" strokeWidth="4" />
                    <path d="M486 616 L486 572 C 486 556, 514 556, 514 572 L514 616 Z" fill="url(#gb-adentro-casa)" />
                    <path d="M486 616 L486 572 C 486 556, 514 556, 514 572 L514 616 Z" fill="#c81e2c" className="puerta" />
                    <circle cx="500" cy="580" r="7" fill="none" stroke="#166534" strokeWidth="3.5" />
                    <circle cx="500" cy="587" r="2" fill="#ef4444" />
                    <rect x="472" y="614" width="56" height="6" fill="#e2e8f0" />
                    {/* cartelito Russo */}
                    <g transform="rotate(-5 610 612)">
                      <rect x="606" y="590" width="5" height="40" fill="#6b3d1f" />
                      <rect x="582" y="572" width="54" height="28" rx="2" fill="#e6007e" />
                      <rect x="585" y="575" width="48" height="13" rx="1" fill="#fff" />
                      <image href="/images/halloween/cartel-russo.webp" x="587" y="575.6" width="44" height="11.4" />
                      <text x="609" y="597" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">Navidad 2026</text>
                    </g>
                  </g>
                  {/* luces */}
                  <path d={"M" + FOCOS.map(([x, y]) => `${x} ${y - 4}`).join(" L")} fill="none" stroke="#3f0a12" strokeWidth="1.2" />
                  {FOCOS.map(([x, y], i) => {
                    const c = COLORES[i % 3];
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="3" fill={c} opacity="0.3" />
                        <g className={`foco ${i % 2 ? "titila" : ""}`} opacity="0">
                          <circle cx={x} cy={y} r="9" fill={c} opacity="0.35" />
                          <circle cx={x} cy={y} r="3.4" fill={c} />
                        </g>
                      </g>
                    );
                  })}

                  {/* nieve adentro: arranca asentada abajo */}
                  {NIEVE_ADENTRO.map((c, i) => <circle key={i} className="copo" cx={c.x0} cy={c.y0} r={c.r} fill="#fff" />)}
                </g>

                {/* el vidrio */}
                <circle cx={CX} cy={CY} r={R} fill="url(#gb-vidrio)" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
                <path d={`M${CX - 210} ${CY - 120} A ${R - 40} ${R - 40} 0 0 1 ${CX - 60} ${CY - 240}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="12" strokeLinecap="round" />
                <path d={`M${CX - 236} ${CY - 40} A ${R - 40} ${R - 40} 0 0 1 ${CX - 228} ${CY - 86}`} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="8" strokeLinecap="round" />
                <path d={`M${CX + 180} ${CY + 190} A ${R - 30} ${R - 30} 0 0 0 ${CX + 236} ${CY + 110}`} fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="6" strokeLinecap="round" />

                {/* la base */}
                <path d="M262 706 L738 706 L780 868 C 780 880, 220 880, 220 868 Z" fill="url(#gb-base)" />
                <ellipse cx="500" cy="706" rx="238" ry="26" fill="url(#gb-oro)" />
                <ellipse cx="500" cy="702" rx="226" ry="20" fill="#3b1a0c" />
                <path d="M238 790 L762 790 L768 812 L232 812 Z" fill="#c8102e" />
                <path d="M238 790 L762 790 M232 812 L768 812" stroke="url(#gb-oro)" strokeWidth="3" />
                <rect x="220" y="862" width="560" height="12" rx="6" fill="url(#gb-oro)" />
                {/* placa con el logo */}
                <rect x="404" y="728" width="192" height="52" rx="8" fill="url(#gb-oro)" />
                <rect x="410" y="734" width="180" height="40" rx="5" fill="#fffaf0" />
                <image href="/images/halloween/cartel-russo.webp" x="425" y="738" width="150" height="32" />
                {/* acebo */}
                <g transform="translate(300 820)">
                  <path d="M0 0 c -14 -14, -30 -6, -24 4 c 8 8, 20 2, 24 -4 Z M0 0 c 14 -14, 30 -6, 24 4 c -8 8, -20 2, -24 -4 Z" fill="#166534" />
                  <circle cx="-3" cy="2" r="4.5" fill="#dc2626" /><circle cx="4" cy="4" r="4" fill="#dc2626" />
                </g>
                <g transform="translate(700 820)">
                  <path d="M0 0 c -14 -14, -30 -6, -24 4 c 8 8, 20 2, 24 -4 Z M0 0 c 14 -14, 30 -6, 24 4 c -8 8, -20 2, -24 -4 Z" fill="#166534" />
                  <circle cx="-3" cy="2" r="4.5" fill="#dc2626" /><circle cx="4" cy="4" r="4" fill="#dc2626" />
                </g>
              </g>
            </g>
          </g>

          {/* trineo y estela, por delante */}
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} className={`estela estela-${i}`} style={{ visibility: "hidden" }}>
              <path d="M-70 0 l3 -8 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 Z" transform={`scale(${(1.5 - i * 0.16).toFixed(2)})`} fill={i % 2 ? "#fde68a" : "#fff"} opacity={(0.95 - i * 0.12).toFixed(2)} />
            </g>
          ))}
          <g className="trineo" style={{ visibility: "hidden" }}>
            <Trineo />
          </g>
        </svg>

        {/* Abajo: la frase */}
        <p className="t2 mt-1 text-center font-display text-[clamp(1.2rem,2.6vw,2.1rem)] font-semibold italic leading-tight text-amber-200 [text-shadow:0_2px_16px_rgba(60,0,10,0.6)]">
          Que estas fiestas te encuentren en casa.
        </p>
      </div>

      <div className="destello pointer-events-none absolute inset-0 bg-[#fffaf0] opacity-0" />
    </div>
  );
}
