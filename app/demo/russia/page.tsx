import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import RussiaSearchChat from "@/components/RussiaSearchChat";

export const metadata: Metadata = {
  title: "Demo · Russia conversacional",
  description: "Demo del asistente Russia con búsqueda en lenguaje natural sobre el catálogo de Russo Propiedades.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DemoRussiaPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-navy via-navy to-[#2d3a7a] py-10 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta/20 border border-magenta/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-magenta-100 backdrop-blur-sm mb-4">
            <Sparkles className="h-3 w-3" />
            Demo · Beta
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight mb-3">
            Búsqueda{" "}
            <em className="text-magenta italic">conversacional</em>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Decile a Russia lo que buscás en castellano normal y te encuentra
            las propiedades en el catálogo. Sin filtros, sin formularios, sin
            click en 5 dropdowns.
          </p>
        </div>

        {/* Chat */}
        <div className="h-[calc(100vh-320px)] min-h-[600px]">
          <RussiaSearchChat />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-white/50 text-xs space-y-1">
          <p>
            Russia consulta el catálogo en vivo. Los resultados son
            propiedades reales que están publicadas.
          </p>
          <p>
            <strong className="text-white/70">¿No encuentra lo que buscás?</strong>{" "}
            Mandá un WhatsApp al{" "}
            <a
              href="https://wa.me/5491150187340"
              target="_blank"
              rel="noopener noreferrer"
              className="text-magenta-100 hover:underline"
            >
              +54 11 5018 7340
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
