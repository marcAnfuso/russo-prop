"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Hero from "@/components/Hero";

/**
 * Shell común para los prototipos: pequeña barra superior con
 * info del variant + el Hero real abajo para ver el efecto integrado.
 *
 * Permite reemplazar el Hero por uno custom (variant `hero`).
 */
export default function VariantShell({
  name,
  desc,
  customHero,
  children,
}: {
  name: string;
  desc: string;
  customHero?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3">
          <Link
            href="/lab/mundial"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-magenta transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-magenta">
              Lab · Mundial
            </p>
            <h1 className="font-display text-sm font-semibold text-navy leading-tight">
              {name}
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 hidden sm:block max-w-[220px] text-right leading-tight">
            {desc}
          </p>
        </div>
      </div>

      <main className="min-h-screen">
        {customHero ?? <Hero />}

        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">
              Sección siguiente (placeholder)
            </p>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Acá iría el resto del home
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              El prototipo muestra solo el Hero más arriba para que veas cómo
              se integra el efecto del Mundial. El sticky bar de arriba no es
              parte del diseño, sirve para que puedas volver al índice.
            </p>
          </div>
        </section>

        {children}
      </main>
    </>
  );
}
