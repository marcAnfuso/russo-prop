import { HALLOWEEN_FRASE } from "@/lib/halloween";

/**
 * Cintillo slim arriba de todo (dentro del navbar fijo), mismo formato que el
 * del Mundial. En mobile se omite "Feliz Halloween." para que entre la frase.
 * Sin emoji de calabaza: ya están la del subrayado del Hero y Russia.
 */
export default function HalloweenStrip() {
  return (
    <div className="w-full bg-navy text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap px-3 text-[12px] font-medium sm:gap-2.5 sm:px-4 sm:text-[12.5px]">
        <span className="hidden font-semibold sm:inline">Feliz Halloween.</span>
        <span className="truncate text-orange-300">{HALLOWEEN_FRASE}</span>
      </div>
    </div>
  );
}
