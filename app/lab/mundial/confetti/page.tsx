"use client";

import VariantShell from "../_components/VariantShell";
import MundialConfetti from "../_components/MundialConfetti";
import { useState } from "react";

export default function Page() {
  const [key, setKey] = useState(0);

  return (
    <>
      <MundialConfetti key={key} count={70} duration={6000} />
      <VariantShell
        name="Confetti al cargar"
        desc="Papelitos celestes y blancos que caen al entrar."
      >
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-md px-6 text-center">
            <button
              type="button"
              onClick={() => setKey((k) => k + 1)}
              className="rounded-full bg-magenta text-white text-sm font-bold px-6 py-3 hover:bg-magenta-600 transition-colors shadow-lg"
            >
              Volver a disparar 🎉
            </button>
            <p className="mt-3 text-xs text-gray-500">
              En producción se dispara una sola vez por sesión.
            </p>
          </div>
        </section>
      </VariantShell>
    </>
  );
}
