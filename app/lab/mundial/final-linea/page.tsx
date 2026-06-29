"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HeroLineaPatria from "../_components/HeroLineaPatria";
import MundialConfetti from "../_components/MundialConfetti";
import MundialSticker from "../_components/MundialSticker";
import RussiaFabVincha from "../_components/RussiaFabVincha";

/**
 * Combo discreto, vista limpia (sin barra de Lab):
 * línea ondulada celeste/blanca + sol bajo "empieza acá" (sin bufanda)
 * + confetti + sticker + Russia con vincha.
 */
export default function Page() {
  return (
    <>
      <MundialConfetti count={70} duration={6000} />
      <HeroLineaPatria />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">
            (acá seguiría el resto del home)
          </p>
          <h2 className="font-display text-2xl font-semibold text-navy">
            Vista limpia del hero
          </h2>
        </div>
      </section>

      <MundialSticker />
      <RussiaFabVincha />

      {/* Volver discreto al índice del lab */}
      <Link
        href="/lab/mundial"
        className="fixed top-[84px] left-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow ring-1 ring-gray-100 hover:text-magenta transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Lab
      </Link>
    </>
  );
}
