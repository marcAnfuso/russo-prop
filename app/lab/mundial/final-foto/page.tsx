"use client";

import { useState } from "react";
import VariantShell from "../_components/VariantShell";
import HeroBufandaFoto from "../_components/HeroBufandaFoto";
import MundialConfetti from "../_components/MundialConfetti";
import MundialSticker from "../_components/MundialSticker";
import RussiaFabVincha from "../_components/RussiaFabVincha";

/**
 * Igual que /final pero con la bufanda FOTO-REAL (SDXL local) sobre "hogar".
 */
export default function Page() {
  const [key, setKey] = useState(0);

  return (
    <>
      <MundialConfetti key={key} count={70} duration={6000} />
      <VariantShell
        name="Combo final · bufanda foto 🇦🇷"
        desc="Bufanda foto-real (IA local) + confetti + sticker + Russia con vincha."
        customHero={<HeroBufandaFoto />}
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
              Bufanda generada con SDXL local y recortada con rembg.
            </p>
          </div>
        </section>
      </VariantShell>
      <MundialSticker />
      <RussiaFabVincha />
    </>
  );
}
