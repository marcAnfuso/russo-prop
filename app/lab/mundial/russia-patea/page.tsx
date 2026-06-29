"use client";

import VariantShell from "../_components/VariantShell";
import RussiaFabPatea from "../_components/RussiaFabPatea";
import { useState } from "react";

export default function Page() {
  const [key, setKey] = useState(0);
  return (
    <>
      <VariantShell
        name="Russia patea"
        desc="Wind-up + pelota que sale rodando hacia la derecha de la pantalla."
      >
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-md px-6 text-center">
            <button
              type="button"
              onClick={() => setKey((k) => k + 1)}
              className="rounded-full bg-magenta text-white text-sm font-bold px-6 py-3 hover:bg-magenta-600 transition-colors shadow-lg"
            >
              Volver a patear ⚽
            </button>
            <p className="mt-3 text-xs text-gray-500">
              En producción se ejecuta una sola vez por sesión.
            </p>
          </div>
        </section>
      </VariantShell>
      <RussiaFabPatea key={key} />
    </>
  );
}
