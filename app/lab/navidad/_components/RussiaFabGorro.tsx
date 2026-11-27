"use client";

import { Sparkles } from "lucide-react";

/**
 * Gorro de Papá Noel caído hacia la izquierda, apoyado sobre el FAB de
 * Russia (56px). El pompón se balancea despacito.
 */
function GorroNoel() {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 56" className="absolute inset-0 w-14 h-14 pointer-events-none overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
      {/* copa roja, la punta cae a la izquierda */}
      <path d="M9 12 C 12 -2, 26 -10, 38 -6 C 44 -4, 47 4, 48 12 Z" fill="#dc2626" />
      <path d="M38 -6 C 44 -4, 47 4, 48 12 L 42 12 C 41 4, 39 -1, 34 -4 Z" fill="#991b1b" opacity="0.45" />
      <g className="gorro-punta">
        <path d="M14 3 C 10 0, 4 2, -1 9 L 3 11 C 6 7, 10 6, 15 8 Z" fill="#dc2626" />
        <circle cx="0" cy="11" r="5" fill="#fff" />
        <circle cx="-1.5" cy="9.5" r="1.6" fill="#f1f5f9" />
      </g>
      {/* ribete de piel */}
      <rect x="5" y="9" width="46" height="9" rx="4.5" fill="#fff" />
      <rect x="5" y="14" width="46" height="4" rx="2" fill="#e2e8f0" />
      <style>{`
        .gorro-punta { transform-box: view-box; transform-origin: 15px 6px; animation: gorro-vaiven 3.6s ease-in-out infinite; }
        @keyframes gorro-vaiven { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-9deg); } }
        @media (prefers-reduced-motion: reduce) { .gorro-punta { animation: none; } }
      `}</style>
    </svg>
  );
}

/**
 * FAB de Russia en modo demo (solo visual) con gorro de Papá Noel y el
 * saludo de temporada en el globito. Sin el chip "IA" (choca con el gorro,
 * igual que pasó con el sombrero de bruja).
 */
export default function RussiaFabGorro({ saludo = "¿te ayudo con el regalo? 🎁" }: { saludo?: string } = {}) {
  return (
    <button type="button" aria-label="Russia · demo" className="fixed bottom-6 left-6 z-40 group flex items-center gap-3">
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0 rounded-full bg-magenta/40 blur-xl animate-russia-pulse" />
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-magenta via-[#cc006f] to-navy shadow-[0_18px_36px_-10px_rgba(230,0,126,0.55),0_8px_16px_-6px_rgba(26,34,81,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06]">
          <Sparkles className="h-5 w-5 text-white drop-shadow-sm translate-y-1" />
        </div>
        <GorroNoel />
      </div>
      <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-3.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_6px_18px_-6px_rgba(26,34,81,0.25)] ring-1 ring-gray-100">
        Russia
        <span className="text-magenta">·</span>
        <span className="text-gray-500 font-semibold">{saludo}</span>
      </span>
      <style jsx global>{`
        /* Solo en este lab: escondemos el FAB real de Russia (vive en la
           misma esquina) para que se vea el de prueba con el gorro. */
        button[aria-label="Abrir Russia, asistente IA"], div.animate-russia-fade { display: none !important; }
        @keyframes russiaPulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.18); opacity: 0.85; } }
        .animate-russia-pulse { animation: russiaPulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </button>
  );
}
