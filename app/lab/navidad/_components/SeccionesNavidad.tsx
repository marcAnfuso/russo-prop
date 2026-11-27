"use client";

import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/data/types";
import { AdornosEstilos, BolitaEscondida, CardDecorada, type Deco } from "./Adornos";

/** Decoración de cada card, en orden. Las "bolitas" doradas son las escondidas. */
const DESTACADAS: { deco: Deco; bolita?: string; nota?: number }[] = [
  { deco: "bola", nota: 1318.5 },
  { deco: "luces" },
  { deco: "mono" },
  { deco: "acebo" },
  { deco: "bola", bolita: "card-destacada" },
  { deco: "luces" },
];
const NUEVOS: { deco: Deco; bolita?: string; nota?: number }[] = [
  { deco: "mono" },
  { deco: "bola", bolita: "card-nueva" },
  { deco: "acebo" },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
      <span aria-hidden="true" className="text-base leading-none">🎄</span>
      {children}
    </p>
  );
}

export default function SeccionesNavidad({ destacadas, nuevas }: { destacadas: Property[]; nuevas: Property[] }) {
  return (
    <>
      <AdornosEstilos />
      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <Kicker>Elegidas por el equipo</Kicker>
            <h2 className="relative inline-block font-display text-3xl font-semibold text-navy sm:text-4xl">
              Propiedades destacadas
              <BolitaEscondida id="titulo" className="absolute -right-9 -top-4" largo={14} />
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {destacadas.map((p, i) => {
              const d = DESTACADAS[i % DESTACADAS.length];
              return (
                <CardDecorada key={p.id} deco={d.deco} bolita={d.bolita} nota={d.nota}>
                  <PropertyCard property={p} compact hideOperationBadge />
                </CardDecorada>
              );
            })}
          </div>
        </div>
      </section>

      {nuevas.length > 0 && (
        <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <Kicker>Recién llegadas</Kicker>
              <h2 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Nuevos ingresos</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {nuevas.map((p, i) => {
                const d = NUEVOS[i % NUEVOS.length];
                return (
                  <CardDecorada key={p.id} deco={d.deco} bolita={d.bolita} nota={d.nota}>
                    <PropertyCard property={p} compact />
                  </CardDecorada>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Resto del home (placeholder)</p>
          <p className="text-sm leading-relaxed text-gray-500">
            Acá seguirían las demás secciones. ¿Ya encontraste todas las bolitas?
            <BolitaEscondida id="placeholder" colgando={false} className="ml-1 align-middle" />
          </p>
        </div>
      </section>
    </>
  );
}
