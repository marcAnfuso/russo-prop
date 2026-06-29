"use client";

import { useState } from "react";
import VariantShell from "../_components/VariantShell";
import HeroBufanda from "../_components/HeroBufanda";
import MundialConfetti from "../_components/MundialConfetti";
import MundialSticker from "../_components/MundialSticker";
import RussiaFabVincha from "../_components/RussiaFabVincha";

/**
 * Combo final candidato a producción:
 *  - Confetti al cargar
 *  - Sticker 🇦🇷 en esquina (click → confeti)
 *  - Bufanda atada sobre "hogar" en el hero
 *  - Russia con vincha
 */
export default function Page() {
  const [key, setKey] = useState(0);

  return (
    <>
      <MundialConfetti key={key} count={70} duration={6000} />
      <VariantShell
        name="Combo final 🇦🇷"
        desc="Confetti + sticker + bufanda en 'hogar' + Russia con vincha."
        customHero={<HeroBufanda />}
      >
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-md px-6 text-center">
            <button
              type="button"
              onClick={() => setKey((k) => k + 1)}
              className="rounded-full bg-magenta text-white text-sm font-bold px-6 py-3 hover:bg-magenta-600 transition-colors shadow-lg"
            >
              Volver a disparar el confetti 🎉
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Mirá el hero (bufanda sobre &ldquo;hogar&rdquo;), el sticker abajo
              a la derecha y a Russia con vincha abajo a la izquierda.
            </p>
          </div>
        </section>
      </VariantShell>
      <MundialSticker />
      <RussiaFabVincha />
    </>
  );
}
