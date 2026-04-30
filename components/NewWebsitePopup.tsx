"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const STORAGE_KEY = "russo_new_web_popup_dismissed_at";
const COOLDOWN_HOURS = 24;
const SHOW_DELAY_MS = 1500;
const EXIT_DURATION_MS = 280;

export default function NewWebsitePopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lastDismissedAt = Number(stored);
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
        if (Date.now() - lastDismissedAt < cooldownMs) return;
      }
    } catch {
      // localStorage bloqueado
    }
    timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // ESC para cerrar
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    if (closing) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // noop
    }
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, EXIT_DURATION_MS);
  }

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${
        closing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a la nueva web"
      style={{ perspective: "1200px" }}
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm cursor-default"
      />

      {/* Wrapper externo · borde magenta animado y entrada sticker
          La capa de "borde magenta circulando" es un cuadrado más grande
          que el card que rota detrás del mismo. El overflow-hidden +
          padding del wrapper recorta para que sólo se vea como un anillo
          de 2px alrededor del card. */}
      <div
        className={`relative w-full max-w-[420px] popup-sticker rounded-[22px] overflow-hidden p-[2px] shadow-[0_40px_100px_-20px_rgba(26,34,81,0.5)] ${
          closing ? "animate-stickerOut" : "animate-stickerLand"
        }`}
      >
        {/* Borde magenta circulando · cuadrado grande con conic gradient
            que rota alrededor del centro del card */}
        <div aria-hidden="true" className="popup-border-bg" />

        {/* Card */}
        <div className="relative z-10 rounded-[20px] overflow-hidden bg-gradient-to-br from-navy to-[#2d3a7a] text-white">
          {/* Glow decorations */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(230,0,126,0.4) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(230,0,126,0.2) 0%, transparent 50%)",
            }}
          />

          {/* Close */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 px-8 pt-10 pb-8 text-center">
            {/* Logo */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-[0_10px_30px_-8px_rgba(230,0,126,0.45)] mb-3 p-2.5">
              <Image
                src="/images/logo-icon.webp"
                alt="Russo Propiedades"
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-magenta-100 mb-5">
              Nueva web 2026
            </p>

            <h2 className="font-display text-[2.4rem] leading-[1.05] font-semibold mb-3">
              Una experiencia{" "}
              <em className="text-magenta italic">renovada</em>.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-[320px] mx-auto">
              Después de 30 años, llevamos Russo Propiedades a su mejor versión digital.
            </p>

            {/* Bullets con stagger */}
            <ul className="space-y-2.5 mb-7 text-sm text-white/90 text-left inline-block">
              {[
                "Búsqueda por mapa de toda zona oeste",
                "Alertas cuando entra una propiedad como la que buscás",
                "Más de 700 propiedades actualizadas en tiempo real",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 animate-bulletIn opacity-0"
                  style={{ animationDelay: `${600 + i * 120}ms` }}
                >
                  <span className="text-magenta font-bold mt-0.5">→</span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex gap-2.5">
              <a
                href="/ventas"
                onClick={dismiss}
                className="flex-1 text-center rounded-full bg-magenta text-white font-bold text-[13px] px-4 py-3 hover:bg-magenta-600 transition-colors animate-pulseGlow"
              >
                Empezar a buscar
              </a>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full bg-white/10 border border-white/25 text-white font-semibold text-[13px] px-5 py-3 hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        /* "Sticker land" · cae desde arriba-izquierda rotando en 3D y
           hace un pequeño rebote al aterrizar, como una pegatina recién
           pegada que se acomoda. */
        @keyframes stickerLand {
          0% {
            opacity: 0;
            transform: translate3d(-260px, -180px, 0) rotateZ(-18deg) rotateX(35deg) scale(0.7);
          }
          55% {
            opacity: 1;
            transform: translate3d(8px, 14px, 0) rotateZ(2deg) rotateX(-4deg) scale(1.03);
          }
          75% {
            transform: translate3d(-2px, -4px, 0) rotateZ(-1deg) rotateX(2deg) scale(0.99);
          }
          90% {
            transform: translate3d(0, 1px, 0) rotateZ(0.3deg) rotateX(-0.5deg) scale(1.005);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotateZ(0) rotateX(0) scale(1);
          }
        }
        @keyframes stickerOut {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotateZ(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 12px, 0) rotateZ(2deg) scale(0.92);
          }
        }
        @keyframes bulletIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 10px 24px -8px rgba(230,0,126,0.6);
          }
          50% {
            box-shadow: 0 14px 32px -6px rgba(230,0,126,0.85), 0 0 0 4px rgba(230,0,126,0.18);
          }
        }
        /* Borde magenta circulando · un cuadrado grande con conic
           gradient gira detrás del card, y el overflow-hidden + padding
           del wrapper recorta para que sólo se vea como un anillo
           alrededor del card. */
        @keyframes rotateBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes borderFadeIn {
          to { opacity: 1; }
        }
        .popup-sticker {
          transform-origin: center;
          will-change: transform, opacity;
        }
        .popup-border-bg {
          position: absolute;
          width: 200%;
          height: 200%;
          left: -50%;
          top: -50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 250deg,
            rgba(230, 0, 126, 0.3) 290deg,
            rgba(230, 0, 126, 1) 320deg,
            rgba(255, 220, 240, 1) 340deg,
            rgba(230, 0, 126, 1) 360deg
          );
          opacity: 0;
          animation:
            rotateBorder 4.5s linear infinite,
            borderFadeIn 0.5s ease-out 0.6s forwards;
          pointer-events: none;
          z-index: 0;
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-fadeOut { animation: fadeOut ${EXIT_DURATION_MS}ms ease-in forwards; }
        .animate-stickerLand {
          animation: stickerLand 0.85s cubic-bezier(0.34, 1.2, 0.5, 1) forwards;
        }
        .animate-stickerOut {
          animation: stickerOut ${EXIT_DURATION_MS}ms ease-in forwards;
        }
        .animate-bulletIn {
          animation: bulletIn 0.45s ease-out forwards;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2.4s ease-in-out infinite;
          animation-delay: 1s;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn, .animate-fadeOut, .animate-stickerLand, .animate-stickerOut,
          .animate-bulletIn, .animate-pulseGlow,
          .popup-border-bg {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
