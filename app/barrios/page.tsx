import type { Metadata } from "next";
import NeighborhoodGrid from "@/components/NeighborhoodGrid";
import BarrioDestacado from "@/components/BarrioDestacado";

export const metadata: Metadata = {
  title: "Barrios · Russo Propiedades",
  description:
    "Explorá los barrios de zona oeste donde Russo Propiedades opera: San Justo, Ramos Mejía, Villa Luzuriaga, Ciudadela, Haedo, Morón y más.",
};

export default function BarriosPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.35),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Zona oeste
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
              Los barrios que{" "}
              <span className="italic text-magenta">conocemos</span>{" "}
              a fondo.
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
              30 años caminando las mismas cuadras. Cada zona tiene su ritmo,
              su oferta y su oportunidad — te contamos cómo se vive en cada una.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de barrios */}
      <NeighborhoodGrid />

      {/* Barrio destacado */}
      <BarrioDestacado />
    </main>
  );
}
