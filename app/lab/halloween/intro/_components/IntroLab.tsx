"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Hero from "@/components/Hero";
import IntroStage from "./IntroStage";

const ESCENAS = {
  llave: dynamic(() => import("./EscenaLlave"), { ssr: false }),
  casa: dynamic(() => import("./EscenaCasa"), { ssr: false }),
  arana: dynamic(() => import("./EscenaArana"), { ssr: false }),
};
type Id = keyof typeof ESCENAS;
const OPCIONES: { id: Id; nombre: string }[] = [
  { id: "llave", nombre: "1. La llave" },
  { id: "casa", nombre: "2. La casa" },
  { id: "arana", nombre: "3. La araña" },
];

/**
 * Lab de las intros: la web real de fondo y una barra para reproducir cada
 * opción. En producción se vería una sola vez por dispositivo.
 */
export default function IntroLab() {
  const [escena, setEscena] = useState<Id>("llave");
  const [toma, setToma] = useState(1);
  const [jugando, setJugando] = useState(true);
  const reproducir = (id: Id) => {
    setEscena(id);
    setToma((n) => n + 1);
    setJugando(true);
  };

  return (
    <>
      <main><Hero /></main>
      {jugando && (
        <IntroStage key={`${escena}-${toma}`} onDone={() => setJugando(false)} Escena={ESCENAS[escena]} />
      )}
      <nav aria-label="Opciones de intro" className="fixed bottom-5 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-max -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_18px_40px_-14px_rgba(10,12,40,0.6)] ring-1 ring-black/5">
        <Link href="/" aria-label="Ir al sitio" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100"><ArrowLeft className="h-4 w-4" /></Link>
        {OPCIONES.map((o) => (
          <button key={o.id} type="button" onClick={() => reproducir(o.id)} className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${escena === o.id ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}>
            {o.nombre}
          </button>
        ))}
        <button type="button" onClick={() => reproducir(escena)} aria-label="Repetir" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100"><RotateCcw className="h-4 w-4" /></button>
      </nav>
    </>
  );
}
