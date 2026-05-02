"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface ExampleMeta {
  icon: React.ReactNode;
  text: string;
  tag: string;
}

interface RussiaPageCTAProps {
  /** Tamaño del CTA principal */
  size?: "md" | "lg";
  /** Si se pasa, abre Russia con ese mensaje pre-cargado y lo dispara
   * automáticamente. Útil para los ejemplos clickables. */
  presetMessage?: string;
  /** "primary" = botón grande magenta · "example" = card de ejemplo */
  variant?: "primary" | "example";
  /** Para variant="example" · datos del ejemplo */
  example?: ExampleMeta;
}

export default function RussiaPageCTA({
  size = "md",
  presetMessage,
  variant = "primary",
  example,
}: RussiaPageCTAProps) {
  function open() {
    // Disparamos un custom event que escucha RussiaWidget montado en el
    // layout · evita prop drilling y/o context.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("russia:open", {
          detail: presetMessage ? { presetMessage } : undefined,
        })
      );
    }
  }

  if (variant === "example" && example) {
    return (
      <button
        type="button"
        onClick={open}
        className="group flex items-start gap-3 text-left rounded-2xl bg-white border border-gray-100/80 shadow-[0_2px_4px_-2px_rgba(26,34,81,0.04),0_10px_28px_-14px_rgba(26,34,81,0.16)] p-4 hover:shadow-[0_8px_16px_-4px_rgba(230,0,126,0.18),0_18px_40px_-16px_rgba(26,34,81,0.22)] hover:border-magenta/30 hover:-translate-y-0.5 transition-all duration-300"
      >
        <span className="flex-shrink-0 h-9 w-9 rounded-xl bg-magenta/10 text-magenta flex items-center justify-center group-hover:bg-magenta group-hover:text-white transition-colors">
          {example.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
            {example.tag}
          </p>
          <p className="text-sm font-medium text-navy leading-snug pr-6">
            {example.text}
          </p>
        </div>
        <ArrowRight className="flex-shrink-0 h-4 w-4 text-gray-300 group-hover:text-magenta group-hover:translate-x-0.5 transition-all" />
      </button>
    );
  }

  const padding = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={open}
      className={`inline-flex items-center gap-2 rounded-full bg-magenta text-white font-bold ${padding} shadow-[0_10px_28px_-8px_rgba(230,0,126,0.6)] hover:bg-magenta-600 hover:shadow-[0_14px_36px_-8px_rgba(230,0,126,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_6px_18px_-6px_rgba(230,0,126,0.55)] transition-all duration-200`}
    >
      <Sparkles className={iconSize} />
      Probar Russia ahora
    </button>
  );
}
