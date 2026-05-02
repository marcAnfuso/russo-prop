"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import RussiaSearchChat from "@/components/RussiaSearchChat";

const ONBOARDING_KEY = "russo_russia_onboarded";
const POPUP_KEY = "russo_new_web_popup_dismissed_at";

export default function RussiaWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [breathe, setBreathe] = useState(true);
  const [presetMessage, setPresetMessage] = useState<string | undefined>();

  // No montar en /demo/russia (ya tiene su propio chat full-screen) ni
  // en /admin/* (paneles internos)
  const hideOn = ["/demo/russia"];
  const isHidden =
    hideOn.some((p) => pathname?.startsWith(p)) ||
    pathname?.startsWith("/admin");

  // Onboarding tip: aparece la primera vez que el visitante entra al
  // sitio · solo en home · espera al popup de "nueva web 2026" para no
  // solaparse · localStorage flag para no repetir.
  useEffect(() => {
    if (isHidden || pathname !== "/") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (localStorage.getItem(ONBOARDING_KEY)) return;
      // Esperar a que el popup de "nueva web 2026" haya sido cerrado
      // (o nunca aparecido). Si está activo, esperamos.
      const popupActive = !localStorage.getItem(POPUP_KEY);
      const delay = popupActive ? 8000 : 2500;
      timer = setTimeout(() => setShowOnboarding(true), delay);
    } catch {
      // localStorage bloqueado · mostramos igual a los 5s
      timer = setTimeout(() => setShowOnboarding(true), 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, isHidden]);

  // Apagar el "respiro" del FAB después de la primera interacción (con
  // el FAB o con el onboarding)
  useEffect(() => {
    if (!breathe) return;
    if (open || !showOnboarding) return;
    // si el onboarding está abierto, mantener el breathe activo
  }, [open, showOnboarding, breathe]);

  const dismissOnboarding = useCallback((openChat = false) => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // noop
    }
    setShowOnboarding(false);
    if (openChat) {
      setOpen(true);
      setBreathe(false);
    }
  }, []);

  const openChat = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* noop */
    }
    setBreathe(false);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }, []);

  // ESC para cerrar el modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeChat();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  // Custom event "russia:open" · permite que RussiaPageCTA o cualquier
  // otro componente del sitio abra Russia con un preset opcional
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { presetMessage?: string } | undefined;
      setShowOnboarding(false);
      try {
        localStorage.setItem(ONBOARDING_KEY, "1");
      } catch {
        /* noop */
      }
      setBreathe(false);
      setPresetMessage(detail?.presetMessage);
      setOpen(true);
    }
    window.addEventListener("russia:open", handler);
    return () => window.removeEventListener("russia:open", handler);
  }, []);

  // Limpiar preset al cerrar para que no se reuse
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setPresetMessage(undefined), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (isHidden) return null;

  return (
    <>
      {/* FAB · esquina inferior izquierda · over WhatsApp que está a la
          derecha. z-40 para no chocar con el modal (z-60). */}
      <button
        type="button"
        onClick={openChat}
        aria-label="Abrir Russia, asistente IA"
        className={`fixed bottom-6 left-6 z-40 group flex items-center gap-3 ${
          breathe ? "russia-fab-breathe" : ""
        }`}
      >
        <div className="relative">
          {/* Glow magenta sutil detrás · más visible cuando breathe */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 rounded-full bg-magenta/40 blur-xl transition-opacity duration-500 ${
              breathe ? "opacity-100 animate-russia-pulse" : "opacity-0 group-hover:opacity-60"
            }`}
          />
          {/* Botón principal */}
          <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-magenta via-[#cc006f] to-navy shadow-[0_18px_36px_-10px_rgba(230,0,126,0.55),0_8px_16px_-6px_rgba(26,34,81,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06] group-active:scale-[0.97]">
            <Sparkles className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          {/* Chip "IA" */}
          <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1.5 rounded-full bg-white text-magenta text-[9px] font-black uppercase tracking-widest flex items-center justify-center shadow-md ring-1 ring-magenta/20">
            IA
          </span>
        </div>
        {/* Etiqueta visible en desktop */}
        <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-3.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_6px_18px_-6px_rgba(26,34,81,0.25)] ring-1 ring-gray-100 group-hover:bg-white transition-colors">
          Russia
          <span className="text-magenta">·</span>
          <span className="text-gray-500 font-semibold">preguntale</span>
        </span>
      </button>

      {/* Onboarding tooltip · spotlight + tarjeta flotante */}
      {showOnboarding && !open && (
        <div className="fixed inset-0 z-50 pointer-events-none animate-russia-fade">
          {/* Backdrop muy sutil · no oscurece como el modal · sólo
              llama atención al FAB */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/30 backdrop-blur-[2px]"
            onClick={() => dismissOnboarding(false)}
            style={{ pointerEvents: "auto" }}
          />
          {/* Spotlight: anillo que rodea el FAB */}
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-3 h-20 w-20 rounded-full border-2 border-magenta/70 animate-russia-ring pointer-events-none"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
          />
          {/* Tarjeta del tip · esquina inferior izquierda, encima del FAB */}
          <div
            className="absolute bottom-28 left-6 max-w-[340px] rounded-2xl bg-white shadow-[0_30px_70px_-20px_rgba(26,34,81,0.45),0_8px_24px_-12px_rgba(26,34,81,0.25)] ring-1 ring-gray-100/80 overflow-hidden animate-russia-pop"
            style={{ pointerEvents: "auto" }}
          >
            {/* Cinta magenta arriba */}
            <div className="h-1 bg-gradient-to-r from-magenta via-[#cc006f] to-navy" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta/10 text-magenta px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Nuevo · IA
                </span>
                <button
                  type="button"
                  onClick={() => dismissOnboarding(false)}
                  aria-label="Cerrar tip"
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <h3 className="font-display text-lg font-semibold text-navy leading-tight mb-1.5">
                Buscá hablándole a <em className="text-magenta italic">Russia</em>
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                Decile lo que querés en castellano normal —
                <em>&ldquo;casa en San Justo cerca de la estación, hasta 200K&rdquo;</em>
                — y te encuentra propiedades del catálogo, sin filtros.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => dismissOnboarding(true)}
                  className="flex-1 rounded-full bg-magenta text-white text-[12px] font-bold py-2.5 hover:bg-magenta-600 transition-colors shadow-[0_8px_20px_-6px_rgba(230,0,126,0.55)]"
                >
                  Probar ahora
                </button>
                <button
                  type="button"
                  onClick={() => dismissOnboarding(false)}
                  className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-[12px] font-semibold px-4 py-2.5 transition-colors"
                >
                  Después
                </button>
              </div>
            </div>
          </div>
          {/* Flecha sutil del tip al FAB */}
          <svg
            aria-hidden="true"
            className="absolute bottom-[88px] left-[42px] text-magenta/60 animate-russia-fade"
            width="24"
            height="44"
            viewBox="0 0 24 44"
            fill="none"
          >
            <path
              d="M12 2 Q 10 22, 12 42 M 7 36 L 12 42 L 17 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* Modal del chat */}
      {open && (
        <div
          className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6 ${
            closing ? "animate-russia-fadeout" : "animate-russia-fadein"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Chat con Russia"
        >
          {/* Backdrop */}
          <button
            type="button"
            onClick={closeChat}
            aria-label="Cerrar chat"
            className="absolute inset-0 bg-navy/55 backdrop-blur-md cursor-default"
          />
          {/* Card del chat */}
          <div
            className={`relative w-full sm:max-w-[480px] sm:h-[640px] sm:max-h-[85vh] h-[88vh] ${
              closing ? "animate-russia-slideout" : "animate-russia-slidein"
            }`}
          >
            <RussiaSearchChat presetMessage={presetMessage} />
            {/* Botón cerrar · esquina superior derecha del modal,
                fuera del chat para no tapar contenido */}
            <button
              type="button"
              onClick={closeChat}
              aria-label="Cerrar"
              className="hidden sm:flex absolute -top-3 -right-3 z-20 h-9 w-9 rounded-full bg-white text-navy shadow-[0_10px_24px_-6px_rgba(26,34,81,0.4)] ring-1 ring-gray-100 items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {/* En mobile, botón cerrar arriba flotante */}
            <button
              type="button"
              onClick={closeChat}
              aria-label="Cerrar"
              className="sm:hidden absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur text-navy shadow-md flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes russiaPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.18); opacity: 0.85; }
        }
        @keyframes russiaRing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes russiaPop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes russiaFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes russiaFadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes russiaFadeout {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes russiaSlidein {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes russiaSlideout {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
        }
        :global(.animate-russia-pulse) {
          animation: russiaPulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        :global(.animate-russia-ring) {
          animation: russiaRing 2.4s ease-in-out infinite;
        }
        :global(.animate-russia-pop) {
          animation: russiaPop 0.34s cubic-bezier(0.25, 0.85, 0.4, 1.05) forwards;
        }
        :global(.animate-russia-fade) {
          animation: russiaFade 0.3s ease-out;
        }
        :global(.animate-russia-fadein) {
          animation: russiaFadein 0.22s ease-out;
        }
        :global(.animate-russia-fadeout) {
          animation: russiaFadeout 0.2s ease-in forwards;
        }
        :global(.animate-russia-slidein) {
          animation: russiaSlidein 0.32s cubic-bezier(0.25, 0.85, 0.4, 1.05) forwards;
        }
        :global(.animate-russia-slideout) {
          animation: russiaSlideout 0.2s ease-in forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-russia-pulse),
          :global(.animate-russia-ring),
          :global(.animate-russia-pop),
          :global(.animate-russia-fade),
          :global(.animate-russia-fadein),
          :global(.animate-russia-fadeout),
          :global(.animate-russia-slidein),
          :global(.animate-russia-slideout) {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
