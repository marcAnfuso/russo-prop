"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/** Medianoche del 24 al 25 (hora argentina): el brindis. */
const BRINDIS_NAVIDAD = new Date("2026-12-25T00:00:00-03:00").getTime();
const BRINDIS_ANIO_NUEVO = new Date("2027-01-01T00:00:00-03:00").getTime();
const DIA = 86_400_000;

/** "Faltan 28 días para el brindis" → "¡Esta noche brindamos!" → Año Nuevo. */
function cuentaRegresiva(now: number): { titulo: string; frase: string } {
  if (now < BRINDIS_NAVIDAD) {
    const dias = Math.ceil((BRINDIS_NAVIDAD - now) / DIA);
    if (dias <= 1) return { titulo: "¡Esta noche brindamos!", frase: "Feliz Navidad de parte de todo el equipo." };
    return { titulo: `Faltan ${dias} días para el brindis.`, frase: "Que el próximo lo hagas en casa nueva." };
  }
  if (now < BRINDIS_ANIO_NUEVO) {
    const dias = Math.ceil((BRINDIS_ANIO_NUEVO - now) / DIA);
    if (dias <= 1) return { titulo: "¡Esta noche se va el 2026!", frase: "Que el 2027 te encuentre en casa nueva." };
    return { titulo: `Faltan ${dias} días para el 2027.`, frase: "Que te encuentre en casa nueva." };
  }
  return { titulo: "¡Feliz 2027!", frase: "Arrancamos el año buscando tu casa." };
}

/**
 * Cintillo slim (como el del Mundial y Halloween), navy con acento dorado.
 * Dos modos: frase fija, o cuenta regresiva al brindis (el que pegó en el
 * Mundial fue justamente el countdown). En producción iría dentro del
 * navbar; acá va fijo debajo para el mockup.
 */
export default function NavidadStrip({
  modo = "frase",
  emoji = "🎄",
  titulo = "Se vienen las fiestas.",
  frase = "Que el 2027 te encuentre en casa nueva.",
}: { modo?: "frase" | "countdown"; emoji?: string; titulo?: string; frase?: string } = {}) {
  const [open, setOpen] = useState(true);
  const [texto, setTexto] = useState<{ titulo: string; frase: string } | null>(null);
  useEffect(() => {
    if (modo !== "countdown") return;
    const tick = () => setTexto(cuentaRegresiva(Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [modo]);
  if (!open) return null;
  const t = modo === "countdown" ? texto ?? { titulo: " ", frase: " " } : { titulo, frase };
  return (
    <div className="fixed left-0 right-0 top-[72px] z-40 w-full bg-navy text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-3 text-[12px] font-medium sm:gap-2.5 sm:px-4 sm:text-[12.5px]">
        <span aria-hidden="true">{emoji}</span>
        <span className="font-semibold tabular-nums">{t.titulo}</span>
        <span className="hidden sm:inline text-amber-300">{t.frase}</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="absolute right-3 rounded p-1 text-white/60 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
