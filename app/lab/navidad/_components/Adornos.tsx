"use client";

import { useState } from "react";
import { campanita } from "./sonidos";
import { EVENTO_BOLITA } from "./RussiaRobot";

/* ──────────────────────────────────────────────────────────────────────────
 * Adornos navideños para las cards de propiedades. Van en un wrapper AFUERA
 * de la card (la card tiene overflow-hidden) y sólo ocupan zonas libres:
 * arriba al centro de la foto, el borde superior y la esquina inferior
 * derecha. Nunca pisan el badge de operación (arriba izq.), favorito y
 * compartir (arriba der.) ni el precio (abajo izq. de la foto).
 * ────────────────────────────────────────────────────────────────────────── */

export type Deco = "bola" | "luces" | "mono" | "acebo";

function Destellos({ color = "#fde68a" }: { color?: string }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: 10 }).map((_, i) => (
        <i key={i} className="ad-destello" style={{ "--a": `${i * 36}deg`, background: color } as React.CSSProperties} />
      ))}
    </span>
  );
}

/** Bola de árbol. Roja (decorativa) o dorada (es una de las escondidas). */
export function Bola({ dorada = false, id, size = 30, notaHz }: { dorada?: boolean; id?: string; size?: number; notaHz?: number }) {
  const [giro, setGiro] = useState(0);
  const [hallada, setHallada] = useState(false);
  const c = dorada
    ? { a: "#fff7d6", b: "#fbbf24", c: "#b45309" }
    : { a: "#fecaca", b: "#dc2626", c: "#7f1d1d" };
  const tocar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    campanita(notaHz ?? (dorada ? 1568 : 1318.5));
    setGiro((n) => n + 1);
    if (dorada && id && !hallada) {
      setHallada(true);
      window.dispatchEvent(new CustomEvent(EVENTO_BOLITA, { detail: id }));
    }
  };
  return (
    <button
      type="button"
      onClick={tocar}
      aria-label={dorada ? "Bolita dorada escondida" : "Bola de Navidad"}
      className="ad-bola pointer-events-auto relative block cursor-pointer"
      style={{ width: size, height: size * 1.2 }}
    >
      <span key={giro} className={`block h-full w-full ${giro ? "ad-gira" : ""}`}>
        <svg viewBox="0 0 30 36" className="h-full w-full overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
          <defs>
            <radialGradient id={`ad-bola-${dorada ? "d" : "r"}`} cx="35%" cy="40%" r="70%">
              <stop offset="0" stopColor={c.a} />
              <stop offset="0.45" stopColor={c.b} />
              <stop offset="1" stopColor={c.c} />
            </radialGradient>
          </defs>
          <rect x="11" y="0" width="8" height="6" rx="1.5" fill="#d4a017" stroke="#92400e" strokeWidth="0.6" />
          <circle cx="15" cy="21" r="14" fill={`url(#ad-bola-${dorada ? "d" : "r"})`} />
          <path d="M3 19 Q 9 24, 15 19 T 27 19" stroke={dorada ? "#fff" : "#fde68a"} strokeOpacity="0.85" strokeWidth="1.3" fill="none" />
          <path d="M4 24 Q 9 28, 15 24 T 26 24" stroke={dorada ? "#fff" : "#fde68a"} strokeOpacity="0.5" strokeWidth="0.9" fill="none" />
          <ellipse cx="10" cy="14" rx="3.2" ry="2" fill="#fff" opacity="0.75" transform="rotate(-30 10 14)" />
        </svg>
      </span>
      {dorada && !hallada && <span aria-hidden="true" className="ad-brillo pointer-events-none absolute -right-1 -top-1 text-[10px] text-amber-200">✦</span>}
      {giro > 0 && <Destellos key={`d${giro}`} color={dorada ? "#fde68a" : "#fecaca"} />}
    </button>
  );
}

/** Bolita dorada suelta, para esconder en cualquier rincón de la página. */
export function BolitaEscondida({ id, className = "", colgando = true, largo = 22 }: { id: string; className?: string; colgando?: boolean; largo?: number }) {
  return (
    <span className={`ad-pendulo inline-flex flex-col items-center ${className}`}>
      {colgando && <span aria-hidden="true" className="block w-[1.5px] bg-amber-400/90" style={{ height: largo }} />}
      <Bola dorada id={id} size={18} />
    </span>
  );
}

/** Guirnalda mini que cae sobre el borde superior de la card. */
function LucesBorde() {
  const n = 9;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const local = (t * 2) % 1; // dos panzas
    return { x: t * 100, y: 2 + 9 * 4 * local * (1 - local) };
  });
  const colores = ["#fff4cf", "#dc2626", "#fbbf24", "#16a34a", "#ff3fa4"];
  return (
    <span aria-hidden="true" className="ad-luces pointer-events-none absolute inset-x-3 -top-2 z-40 block h-6">
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path d="M0 2 Q 25 20, 50 2 Q 75 20, 100 2" stroke="#14532d" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" />
      </svg>
      {pts.map((p, i) => (
        <i
          key={i}
          className="ad-lucecita"
          style={{ left: `${p.x}%`, top: p.y, "--c": colores[i % colores.length], "--i": i } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

/** Moño de regalo sentado sobre el borde superior, con cintas. */
function Mono() {
  return (
    <span aria-hidden="true" className="ad-mono pointer-events-none absolute left-1/2 -top-4 z-40 block h-11 w-16 -translate-x-1/2">
      <svg viewBox="0 0 64 44" className="h-full w-full overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
        <path d="M30 22 L 20 42 L 25 40 L 27 44 L 33 24 Z" fill="#991b1b" />
        <path d="M34 22 L 42 42 L 37 40.5 L 35.5 44 L 31 24 Z" fill="#b91c1c" />
        <path d="M32 20 C 18 2, 2 6, 5 16 C 8 26, 24 24, 32 20 Z" fill="#dc2626" />
        <path d="M32 20 C 46 2, 62 6, 59 16 C 56 26, 40 24, 32 20 Z" fill="#dc2626" />
        <path d="M31 19 C 22 10, 13 10, 11 14" stroke="#fca5a5" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M33 19 C 42 10, 51 10, 53 14" stroke="#fca5a5" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="27" y="15" width="10" height="10" rx="3.5" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

/**
 * Ramitas de acebo (hojas + bayas): una grande asomando por la esquina
 * inferior derecha y otra más chica, espejada, abrazando la superior
 * izquierda desde afuera (sin tapar el cartelito de Venta/Alquiler).
 */
function Acebo() {
  return (
    <>
      <RamitaAcebo className="ad-acebo -bottom-3 -right-3 h-14 w-14" />
      <RamitaAcebo className="ad-acebo-2 -left-4 -top-4 h-12 w-12" />
    </>
  );
}

function RamitaAcebo({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute z-40 block ${className}`}>
      <svg viewBox="0 0 56 56" className="h-full w-full overflow-visible drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)]">
        <path d="M28 30 C 22 22, 10 22, 4 16 C 8 16, 8 12, 6 9 C 10 11, 13 9, 14 6 C 16 10, 20 10, 22 8 C 22 13, 26 15, 28 14 C 26 18, 27 24, 28 30 Z" fill="#15803d" />
        <path d="M28 30 C 22 22, 10 22, 4 16" stroke="#14532d" strokeWidth="1" fill="none" />
        <path d="M30 30 C 34 22, 44 16, 52 12 C 50 16, 52 19, 54 21 C 50 21, 48 24, 48 27 C 45 24, 41 25, 39 27 C 40 23, 36 21, 34 22 C 34 26, 32 28, 30 30 Z" fill="#16a34a" />
        <path d="M30 30 C 34 22, 44 16, 52 12" stroke="#14532d" strokeWidth="1" fill="none" />
        <circle cx="27" cy="33" r="5" fill="#dc2626" /><circle cx="33" cy="35" r="4.5" fill="#b91c1c" /><circle cx="29" cy="39" r="4.5" fill="#ef4444" />
        <circle cx="25.5" cy="31.5" r="1.4" fill="#fff" opacity="0.8" /><circle cx="31.8" cy="33.5" r="1.2" fill="#fff" opacity="0.7" />
      </svg>
    </span>
  );
}

/**
 * Wrapper de card decorada. `bolita` convierte la bola en dorada y la suma
 * a la búsqueda de Russia.
 */
export function CardDecorada({ deco, bolita, nota, children }: { deco: Deco; bolita?: string; nota?: number; children: React.ReactNode }) {
  return (
    <div className="group/deco relative h-full">
      {children}
      {deco === "bola" && (
        <span className="ad-cuelga pointer-events-none absolute left-1/2 -top-3 z-40 flex -translate-x-1/2 flex-col items-center">
          <span aria-hidden="true" className="block h-12 w-[1.5px] bg-gradient-to-b from-amber-500 to-amber-300 shadow-[0_0_2px_rgba(0,0,0,0.35)]" />
          <Bola dorada={!!bolita} id={bolita} notaHz={nota} />
        </span>
      )}
      {deco === "luces" && <LucesBorde />}
      {deco === "mono" && <Mono />}
      {deco === "acebo" && <Acebo />}
    </div>
  );
}

/** Estilos compartidos de los adornos (montar una vez por página). */
export function AdornosEstilos() {
  return (
    <style jsx global>{`
      .ad-cuelga { transform-origin: top center; animation: ad-hamaca 4.5s ease-in-out infinite; }
      .group\\/deco:hover .ad-cuelga { animation: ad-hamaca-fuerte 1.6s ease-out; }
      .ad-pendulo { transform-origin: top center; animation: ad-hamaca 3.8s ease-in-out infinite; }
      @keyframes ad-hamaca { 0%, 100% { transform: translateX(-50%) rotate(-3deg); } 50% { transform: translateX(-50%) rotate(3deg); } }
      .ad-pendulo { animation-name: ad-hamaca-sola; }
      @keyframes ad-hamaca-sola { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
      @keyframes ad-hamaca-fuerte {
        0% { transform: translateX(-50%) rotate(0); } 20% { transform: translateX(-50%) rotate(16deg); } 45% { transform: translateX(-50%) rotate(-11deg); }
        65% { transform: translateX(-50%) rotate(6deg); } 85% { transform: translateX(-50%) rotate(-2deg); } 100% { transform: translateX(-50%) rotate(0); }
      }
      .ad-gira { animation: ad-gira 0.7s cubic-bezier(0.3, 1.4, 0.5, 1); }
      @keyframes ad-gira { 0% { transform: scale(1) rotateY(0); } 40% { transform: scale(1.25) rotateY(180deg); } 100% { transform: scale(1) rotateY(360deg); } }
      .ad-brillo { animation: ad-brillo 1.8s ease-in-out infinite; }
      @keyframes ad-brillo { 0%, 100% { opacity: 1; transform: scale(1) rotate(0); } 50% { opacity: 0.2; transform: scale(0.6) rotate(45deg); } }
      .ad-destello { position: absolute; left: 0; top: 0; width: 3px; height: 3px; border-radius: 9px; animation: ad-destello 0.7s ease-out forwards; }
      @keyframes ad-destello { from { transform: rotate(var(--a)) translateX(4px); opacity: 1; } to { transform: rotate(var(--a)) translateX(30px); opacity: 0; } }

      .ad-lucecita { position: absolute; width: 7px; height: 9px; margin-left: -3.5px; border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; background: var(--c); box-shadow: 0 0 8px 2px var(--c); animation: ad-titila 2.4s ease-in-out calc(var(--i) * 0.27s) infinite; }
      .group\\/deco:hover .ad-lucecita { animation: ad-persigue 0.9s linear calc(var(--i) * 0.1s) infinite; }
      @keyframes ad-titila { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes ad-persigue { 0%, 100% { opacity: 0.35; transform: scale(0.85); } 30% { opacity: 1; transform: scale(1.25); } }

      .ad-mono { transition: transform 0.3s; }
      .group\\/deco:hover .ad-mono { animation: ad-mono 0.8s ease-in-out; }
      @keyframes ad-mono { 0%, 100% { transform: translateX(-50%) rotate(0) scale(1); } 30% { transform: translateX(-50%) rotate(-10deg) scale(1.12); } 60% { transform: translateX(-50%) rotate(8deg) scale(1.05); } }

      .ad-acebo { transform-origin: 70% 70%; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .group\\/deco:hover .ad-acebo { transform: rotate(-14deg) scale(1.12); }
      .ad-acebo-2 { transform: rotate(160deg); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s; }
      .group\\/deco:hover .ad-acebo-2 { transform: rotate(176deg) scale(1.12); }

      @media (prefers-reduced-motion: reduce) {
        .ad-cuelga, .ad-pendulo, .ad-gira, .ad-brillo, .ad-lucecita, .ad-mono { animation: none !important; }
        .ad-cuelga { transform: translateX(-50%); }
      }
    `}</style>
  );
}
