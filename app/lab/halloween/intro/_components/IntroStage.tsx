"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type Construir = (tl: gsap.core.Timeline, root: HTMLDivElement) => void;

/**
 * Corre la coreografía de una escena. `construir` y `poster` son funciones de
 * módulo (estables): la primera arma el timeline, la segunda deja el cuadro
 * fijo para quien tiene "reducir animaciones".
 */
export function useEscena(construir: Construir, poster: () => void, onFin: () => void) {
  const root = useRef<HTMLDivElement>(null);
  const fin = useRef(onFin);
  useEffect(() => {
    fin.current = onFin;
  }, [onFin]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // En un aparato lento GSAP frena el tiempo para no saltar cuadros, y la
    // intro podría durar muchísimo. Acá manda el reloj: se saltean cuadros,
    // pero termina a horario. Se restaura al salir.
    gsap.ticker.lagSmoothing(0);
    const ctx = gsap.context(() => {
      if (reducido) {
        poster();
        gsap.to(el, { autoAlpha: 0, duration: 0.5, delay: 2.4, onComplete: () => fin.current() });
        return;
      }
      const tl = gsap.timeline({ onComplete: () => fin.current() });
      construir(tl, el);
      (window as unknown as { __introTl?: gsap.core.Timeline }).__introTl = tl; // QA del lab
    }, el);
    return () => {
      ctx.revert();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [construir, poster]);

  return root;
}

/**
 * Marco común de las intros: pantalla completa por delante de toda la web,
 * sin scroll mientras dura, con "Saltar" siempre a mano (y Esc).
 */
export default function IntroStage({
  onDone,
  Escena,
}: {
  onDone: () => void;
  Escena: React.ComponentType<{ onFin: () => void }>;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cerrado = useRef(false);

  const onFin = useCallback(() => {
    if (cerrado.current) return;
    cerrado.current = true;
    onDone();
  }, [onDone]);

  const saltar = useCallback(() => {
    // Con CSS y un timer, no con GSAP: saltar tiene que andar aunque la
    // animación esté trabada.
    if (cerrado.current || !stage.current) return;
    stage.current.style.transition = "opacity 220ms ease-out";
    stage.current.style.opacity = "0";
    stage.current.style.pointerEvents = "none";
    window.setTimeout(onFin, 240);
  }, [onFin]);

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") saltar();
    };
    window.addEventListener("keydown", onKey);
    // Red de seguridad: pase lo que pase, a los 8 s la web queda libre.
    const seguro = window.setTimeout(saltar, 8000);
    return () => {
      window.clearTimeout(seguro);
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [saltar]);

  return (
    <div ref={stage} role="dialog" aria-label="Intro de Halloween" className="fixed inset-0 z-[200] overflow-hidden">
      <Escena onFin={onFin} />
      <button
        type="button"
        onClick={saltar}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/35 px-4 py-2 text-[13px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
      >
        Saltar
      </button>
    </div>
  );
}
