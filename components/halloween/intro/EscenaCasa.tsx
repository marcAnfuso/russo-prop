"use client";

import type gsap from "gsap";
import { useEscena } from "./IntroStage";

/**
 * "La casa": de noche, una casa torcida con el cartel de Russo en la entrada.
 * Se prenden las ventanas de a una, salen murciélagos por la chimenea, aparece
 * un fantasmita que saluda y se mete por la puerta justo cuando se abre: la
 * cámara lo sigue y la luz de adentro se vuelve la web.
 */
const ESTRELLAS = [
  [120, 90, 2.4], [260, 200, 1.6], [420, 70, 2], [560, 160, 1.4], [660, 60, 2.2], [760, 210, 1.5],
  [860, 90, 1.8], [1060, 120, 1.5], [1210, 70, 2.3], [1340, 190, 1.7], [1490, 100, 2.2], [1000, 40, 1.6],
  [190, 330, 1.4], [1420, 330, 1.5], [600, 290, 1.4], [1120, 310, 1.2],
];

const BATS = [
  { x: -300, y: -230, s: 1.1, d: 0 }, { x: 240, y: -300, s: 0.8, d: 0.07 }, { x: -520, y: -180, s: 0.9, d: 0.13 },
  { x: 480, y: -210, s: 1.25, d: 0.05 }, { x: -130, y: -340, s: 0.65, d: 0.2 }, { x: 680, y: -260, s: 0.7, d: 0.18 },
  { x: -760, y: -300, s: 0.75, d: 0.26 }, { x: 90, y: -390, s: 1, d: 0.3 }, { x: 380, y: -390, s: 0.6, d: 0.34 },
];

const VENTANAS = [
  { x: 592, y: 436, w: 40, h: 56 }, { x: 684, y: 574, w: 62, h: 74 }, { x: 864, y: 574, w: 62, h: 74 },
  { x: 592, y: 574, w: 40, h: 56 },
];

function construir(tl: gsap.core.Timeline, root: HTMLDivElement) {
  tl.from(".luna", { y: 170, duration: 1.5, ease: "power3.out" }, 0)
    .from(".estrella", { opacity: 0, duration: 0.5, stagger: 0.03 }, 0.1)
    .from(".frente", { opacity: 0, duration: 0.5, ease: "power1.out" }, 0);

  // Las ventanas se prenden de a una, con un parpadeo de vela.
  root.querySelectorAll<SVGElement>(".ventana").forEach((v, i) => {
    const t = 0.75 + i * 0.26;
    tl.to(v, { opacity: 1, duration: 0.06 }, t)
      .to(v, { opacity: 0.35, duration: 0.06 }, t + 0.07)
      .to(v, { opacity: 1, duration: 0.12 }, t + 0.14);
  });
  tl.from(".t1", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 1.15);

  // Murciélagos por la chimenea.
  root.querySelectorAll<SVGElement>(".bat").forEach((b, i) => {
    const m = BATS[i];
    const t = 1.75 + m.d;
    tl.set(b, { autoAlpha: 1 }, t)
      .fromTo(b, { x: 0, scale: 0.25 }, { x: m.x, scale: m.s * 1.8, duration: 1.5, ease: "power1.in" }, t)
      .fromTo(b, { y: 0 }, { y: m.y, duration: 1.5, ease: "power2.out" }, t)
      .to(b, { autoAlpha: 0, duration: 0.3 }, t + 1.2)
      .fromTo(b.querySelector(".ala"), { scaleY: 1 }, { scaleY: 0.35, svgOrigin: "0 0", duration: 0.08 + i * 0.004, repeat: 17, yoyo: true, ease: "sine.inOut" }, t);
  });

  // El fantasmita: aparece, flota, saluda, pestañea y va hacia la puerta.
  tl.fromTo(".fantasma", { autoAlpha: 0, scale: 0.55, y: 26 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.6)" }, 1.5)
    .to(".fantasma-flota", { y: -9, duration: 0.5, ease: "sine.inOut", repeat: 3, yoyo: true }, 1.6)
    .to(".fantasma-brazo", { rotation: -30, svgOrigin: "28 2", duration: 0.15, ease: "sine.inOut", repeat: 5, yoyo: true }, 2.05)
    .to(".fantasma-ojos", { scaleY: 0.1, svgOrigin: "0 -8", duration: 0.06, repeat: 1, yoyo: true }, 2.72)
    .to(".fantasma", { x: -185, y: 142, scale: 0.42, duration: 0.55, ease: "power2.in" }, 2.95)
    .to(".fantasma", { autoAlpha: 0, duration: 0.15 }, 3.42);

  tl.from(".t2", { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 2.4)
    .to(".hoja-puerta", { scaleX: 0.08, svgOrigin: "771 750", duration: 0.5, ease: "power2.inOut" }, 3.25)
    .to(".t1, .t2", { autoAlpha: 0, duration: 0.25 }, 3.45)
    .to(".mundo", { scale: 26, svgOrigin: "800 742", duration: 1.15, ease: "expo.in" }, 3.5)
    .to(".cielo", { scale: 1.25, svgOrigin: "800 500", duration: 1.15, ease: "power2.in" }, 3.5)
    .to(".destello", { opacity: 1, duration: 0.3, ease: "power1.in" }, 4.38)
    .to(root, { autoAlpha: 0, duration: 0.42, ease: "power1.out" }, 4.68);
}

function poster() {
  document.querySelectorAll<SVGElement>(".ventana").forEach((v) => (v.style.opacity = "1"));
  document.querySelector<SVGElement>(".fantasma")?.style.setProperty("visibility", "visible");
}

const BAT_ALA_IZQ = "M0 0 C -6 -10, -16 -12, -26 -8 C -22 -4, -21 0, -21 5 C -17 1, -12 2, -9 7 C -6 3, -3 3, 0 5 Z";
const BAT_ALA_DER = "M0 0 C 6 -10, 16 -12, 26 -8 C 22 -4, 21 0, 21 5 C 17 1, 12 2, 9 7 C 6 3, 3 3, 0 5 Z";

export default function EscenaCasa({ onFin }: { onFin: () => void }) {
  const root = useEscena(construir, poster, onFin);
  return (
    <div ref={root} className="absolute inset-0 bg-[#0a0d2c]">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="cs-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#090c2a" />
            <stop offset="52%" stopColor="#201a55" />
            <stop offset="82%" stopColor="#6a2a63" />
          </linearGradient>
          <radialGradient id="cs-luna" cx="42%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fff6da" />
            <stop offset="72%" stopColor="#f6dfa4" />
            <stop offset="100%" stopColor="#e0b96e" />
          </radialGradient>
          <radialGradient id="cs-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cs-ventana" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cs-adentro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff3c9" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <radialGradient id="cs-fantasma" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="cielo">
          <rect x="-100" y="-100" width="1800" height="1200" fill="url(#cs-cielo)" />
          {ESTRELLAS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} className="estrella" cx={x} cy={y} r={r} fill="#fff" opacity="0.85" />
          ))}
          <g className="luna">
            <circle cx="960" cy="290" r="290" fill="url(#cs-halo)" />
            <circle cx="960" cy="290" r="118" fill="url(#cs-luna)" />
            <g fill="#d9b671" opacity="0.5">
              <circle cx="925" cy="258" r="18" /><circle cx="995" cy="316" r="24" /><circle cx="948" cy="342" r="9" /><circle cx="1010" cy="244" r="8" />
            </g>
          </g>
        </g>

        <g className="mundo">
          <path className="frente" d="M-100 760 C 200 660, 460 700, 800 730 C 1140 760, 1400 660, 1700 720 L 1700 1100 L -100 1100 Z" fill="#141244" />

          {/* árboles pelados */}
          <g fill="none" stroke="#080822" strokeLinecap="round">
            <path d="M270 800 C 262 700, 292 640, 268 540" strokeWidth="26" />
            <path d="M272 640 C 230 600, 200 590, 160 530 M274 600 C 320 560, 340 520, 390 480 M268 560 C 250 510, 270 470, 240 420 M325 548 C 340 510, 332 480, 352 450 M205 584 C 180 575, 150 578, 120 560" strokeWidth="10" />
            <path d="M1344 800 C 1356 720, 1326 660, 1352 590" strokeWidth="22" />
            <path d="M1344 660 C 1390 620, 1420 610, 1460 560 M1346 630 C 1300 590, 1282 560, 1250 520 M1352 596 C 1362 550, 1344 520, 1370 470 M1300 588 C 1280 560, 1290 530, 1268 500" strokeWidth="9" />
          </g>

          {/* la casa, torcida a propósito */}
          <g>
            {/* chimenea */}
            <path d="M892 380 L948 376 L952 492 L896 492 Z" fill="#0b0a26" />
            <rect x="884" y="368" width="72" height="16" rx="2" fill="#15133a" transform="rotate(-3 920 376)" />
            {/* cuerpo */}
            <path d="M642 802 L652 526 L968 538 L978 802 Z" fill="#0d0c2c" />
            {/* techo */}
            <path d="M622 540 L806 346 L996 548 Z" fill="#14123a" />
            <path d="M622 540 L806 346 L812 354 L640 542 Z" fill="#26235c" opacity="0.6" />
            {/* torre */}
            <path d="M566 802 L572 398 L658 402 L662 802 Z" fill="#100f33" />
            <path d="M552 406 L618 230 L676 410 Z" fill="#17143f" />
            <path d="M552 406 L618 230 L622 240 L566 408 Z" fill="#2c2868" opacity="0.6" />
            <circle cx="618" cy="228" r="6" fill="#f97316" />
            {/* tejas */}
            <g stroke="#26235c" strokeOpacity="0.55" strokeWidth="2" fill="none">
              <path d="M700 476 L910 482 M736 436 L878 440 M768 398 L844 400 M586 352 L650 354 M596 312 L640 314" />
            </g>
            {/* ventanas */}
            {VENTANAS.map((v, i) => (
              <g key={i} className="ventana" opacity="0">
                <circle cx={v.x + v.w / 2} cy={v.y + v.h / 2} r={v.h * 1.25} fill="url(#cs-ventana)" />
                <rect x={v.x} y={v.y} width={v.w} height={v.h} rx="3" fill="#fcd34d" />
                <path d={`M${v.x + v.w / 2} ${v.y} V${v.y + v.h} M${v.x} ${v.y + v.h * 0.48} H${v.x + v.w}`} stroke="#0d0c2c" strokeWidth="4" />
              </g>
            ))}
            <g className="ventana" opacity="0">
              <circle cx="806" cy="484" r="50" fill="url(#cs-ventana)" />
              <circle cx="806" cy="484" r="23" fill="#fcd34d" />
              <path d="M806 461 V507 M783 484 H829" stroke="#0d0c2c" strokeWidth="4" />
            </g>
            {/* puerta */}
            <path d="M771 802 L771 720 C 771 690, 829 690, 829 720 L829 802 Z" fill="url(#cs-adentro)" />
            <path className="hoja-puerta" d="M771 802 L771 720 C 771 690, 829 690, 829 720 L829 802 Z" fill="#2a1a12" />
            <path d="M762 802 L762 716 C 762 678, 838 678, 838 716 L838 802" fill="none" stroke="#1f1c52" strokeWidth="6" />
            {/* escalones */}
            <rect x="752" y="800" width="96" height="8" fill="#1a1848" />
            <rect x="740" y="808" width="120" height="8" fill="#14123c" />
          </g>

          {/* cartel de la inmobiliaria */}
          <g transform="rotate(-5 958 796)">
            <rect x="953" y="716" width="9" height="102" fill="#3a2614" />
            <rect x="900" y="690" width="118" height="62" rx="4" fill="#e6007e" />
            <rect x="905" y="695" width="108" height="52" rx="2" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" />
            <rect x="908" y="698" width="102" height="29" rx="1.5" fill="#fff" />
            <image href="/images/halloween/cartel-russo.webp" x="912" y="700.3" width="94" height="24.4" />
            <text x="959" y="741.5" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#fff">en venta</text>
          </g>

          {/* fantasmita: misma cara simpática que la araña del Hero */}
          <g transform="translate(985 610)">
            <g className="fantasma" style={{ visibility: "hidden" }}>
              <g className="fantasma-flota">
                <circle r="72" fill="url(#cs-fantasma)" />
                <path d="M-32 -2 C -42 -8, -46 2, -38 8 C -36 10, -32 10, -29 8 Z" fill="#f4f1ff" />
                <path className="fantasma-brazo" d="M28 8 C 34 6, 42 0, 44 -10 C 45 -16, 37 -17, 35 -11 C 34 -7, 31 -4, 28 -3 Z" fill="#f4f1ff" />
                <path d="M-30 38 L-30 -6 C -30 -46, 30 -46, 30 -6 L30 38 Q 22.5 28, 15 38 Q 7.5 48, 0 38 Q -7.5 28, -15 38 Q -22.5 48, -30 38 Z" fill="#f4f1ff" />
                <g className="fantasma-ojos" fill="#1a1a2e">
                  <ellipse cx="-10" cy="-8" rx="4.6" ry="6" />
                  <ellipse cx="10" cy="-8" rx="4.6" ry="6" />
                  <circle cx="-8.6" cy="-10.4" r="1.5" fill="#fff" />
                  <circle cx="11.4" cy="-10.4" r="1.5" fill="#fff" />
                </g>
                <circle cx="-18" cy="3" r="4" fill="#f472b6" opacity="0.6" />
                <circle cx="18" cy="3" r="4" fill="#f472b6" opacity="0.6" />
                <path d="M-6 3 Q 0 11, 6 3" stroke="#1a1a2e" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>

          {/* colina de adelante: acá apoya el texto */}
          <path d="M-100 830 C 240 770, 520 800, 800 816 C 1090 832, 1360 780, 1700 816 L 1700 1100 L -100 1100 Z" fill="#070720" />
        </g>

        {/* murciélagos: salen de la chimenea */}
        <g transform="translate(922 370)">
          {BATS.map((_, i) => (
            <g key={i} className="bat" style={{ visibility: "hidden" }}>
              <g className="ala">
                <path d={BAT_ALA_IZQ} fill="#060618" />
                <path d={BAT_ALA_DER} fill="#060618" />
              </g>
              <ellipse cy="1" rx="4" ry="7" fill="#060618" />
            </g>
          ))}
        </g>

        <rect className="destello" x="-100" y="-100" width="1800" height="1200" fill="#fff3c9" opacity="0" />
      </svg>

      <div className="absolute inset-x-6 bottom-[4%] text-center sm:bottom-[3.5%]">
        <p className="t1 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-white">
          Casas embrujadas no tenemos.
        </p>
        <p className="t2 mt-1 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-semibold italic leading-tight text-orange-200">
          Encantadoras, todas.
        </p>
      </div>
    </div>
  );
}
