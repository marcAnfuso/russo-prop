"use client";

import { useEffect, useRef } from "react";

/**
 * Fuegos artificiales del brindis del 24 a las 12 (la Navidad argentina es
 * de verano y de vereda, no de nieve). Un canvas transparente sobre el Hero:
 * al entrar salen tres, después uno cada tanto, y si tocás el cielo (no el
 * buscador) sale uno donde tocaste — el easter egg para compartir.
 *
 * Paleta: dorado, magenta Russo, blanco y celeste. Liviano: partículas con
 * estela corta, se pausa con la pestaña oculta y respeta reduced-motion.
 */
type Particula = { x: number; y: number; vx: number; vy: number; vida: number; max: number; color: string; px: number; py: number; chispa: boolean };
type Cohete = { x: number; y: number; ty: number; vy: number; color: string[] };

const PALETAS = [
  ["#fcd34d", "#fde68a", "#ffffff"], // dorado
  ["#ff3fa4", "#e6007e", "#fbcfe8"], // magenta
  ["#7dd3fc", "#ffffff", "#bae6fd"], // celeste y blanco
  ["#fcd34d", "#ff3fa4", "#ffffff"], // mezcla
];

const NO_DISPARAR = "input,button,a,form,select,textarea,label,[role=listbox],[role=option],[data-no-fuegos]";

export default function FuegosOverlay({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lanzar = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts: Particula[] = [];
    const cohetes: Cohete[] = [];
    const paleta = () => PALETAS[Math.floor(Math.random() * PALETAS.length)];

    const explotar = (x: number, y: number, colores: string[]) => {
      const n = w < 640 ? 46 : 70;
      const fuerza = w < 640 ? 3.1 : 4.2;
      const anillo = Math.random() < 0.35;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.1;
        const v = anillo ? fuerza : fuerza * (0.35 + Math.random() * 0.75);
        const max = 55 + Math.random() * 35;
        parts.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: max, max, color: colores[i % colores.length], chispa: Math.random() < 0.3 });
      }
    };
    const disparar = (tx: number, ty: number) => {
      if (reduce) return;
      cohetes.push({ x: tx + (Math.random() - 0.5) * 40, y: h, ty, vy: -(Math.sqrt(2 * 0.12 * (h - ty)) ), color: paleta() });
    };
    lanzar.current = disparar;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const alAzar = () => disparar(w * (0.12 + Math.random() * 0.76), h * (0.24 + Math.random() * 0.18));
    [700, 1300, 2100].forEach((t) => timers.push(setTimeout(alAzar, t)));
    let ciclo: ReturnType<typeof setTimeout>;
    const programar = () => { ciclo = setTimeout(() => { if (!document.hidden) alAzar(); programar(); }, 4200 + Math.random() * 3800); };
    programar();

    // Física a paso fijo de 60 Hz: en pantallas de 120/240 Hz no se acelera.
    const PASO = 1000 / 60;
    const actualizar = () => {
      for (let i = cohetes.length - 1; i >= 0; i--) {
        const c = cohetes[i];
        c.y += c.vy; c.vy += 0.12;
        if (c.vy >= -0.4 || c.y <= c.ty) { explotar(c.x, c.y, c.color); cohetes.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.px = p.x; p.py = p.y;
        p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.045;
        p.x += p.vx; p.y += p.vy; p.vida--;
        if (p.vida <= 0) parts.splice(i, 1);
      }
    };
    const dibujar = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(255,230,170,0.85)"; ctx.lineWidth = 2;
      for (const c of cohetes) { ctx.beginPath(); ctx.moveTo(c.x, c.y + 16); ctx.lineTo(c.x, c.y); ctx.stroke(); }
      ctx.lineWidth = 1.8;
      for (const p of parts) {
        const k = p.vida / p.max;
        const titila = p.chispa && k < 0.5 ? (Math.random() < 0.5 ? 0 : 1) : 1;
        ctx.globalAlpha = Math.min(1, k * 1.4) * titila;
        ctx.strokeStyle = p.color;
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    let raf = 0;
    let ultimo = performance.now();
    let acumulado = 0;
    const frame = (now: number) => {
      acumulado = Math.min(acumulado + (now - ultimo), 250);
      ultimo = now;
      while (acumulado >= PASO) { actualizar(); acumulado -= PASO; }
      dibujar();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout); clearTimeout(ciclo);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(NO_DISPARAR)) return;
    const r = canvas.current!.getBoundingClientRect();
    const y = e.clientY - r.top;
    if (y > r.height * 0.78) return; // abajo de todo no: es zona de scroll en el celu
    lanzar.current(e.clientX - r.left, Math.max(y, r.height * 0.2));
  };

  return (
    <div ref={wrap} className="relative" onPointerDown={onPointerDown}>
      {children}
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[6] h-full w-full" />
    </div>
  );
}
