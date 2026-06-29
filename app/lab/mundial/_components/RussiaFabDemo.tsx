"use client";

import { Sparkles } from "lucide-react";

/**
 * FAB de Russia en modo "demo" — solo el visual, sin chat real.
 * Acepta children para superponer adornos (vincha, pintura, pelota, etc.).
 */
export default function RussiaFabDemo({
  children,
  onClick,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Russia · demo"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-3"
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-magenta/40 blur-xl opacity-100 animate-russia-pulse"
        />
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-magenta via-[#cc006f] to-navy shadow-[0_18px_36px_-10px_rgba(230,0,126,0.55),0_8px_16px_-6px_rgba(26,34,81,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06] group-active:scale-[0.97]">
          <Sparkles className="h-5 w-5 text-white drop-shadow-sm" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1.5 rounded-full bg-white text-magenta text-[9px] font-black uppercase tracking-widest flex items-center justify-center shadow-md ring-1 ring-magenta/20">
          IA
        </span>
        {/* Slot para adorno mundialista */}
        {children}
      </div>
      <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-3.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_6px_18px_-6px_rgba(26,34,81,0.25)] ring-1 ring-gray-100">
        Russia
        <span className="text-magenta">·</span>
        <span className="text-gray-500 font-semibold">preguntale</span>
      </span>
      <style jsx global>{`
        @keyframes russiaPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.18); opacity: 0.85; }
        }
        .animate-russia-pulse {
          animation: russiaPulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </button>
  );
}
