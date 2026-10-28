"use client";

import { useMundialActive } from "./useMundialActive";
import { useHalloweenActive } from "@/components/halloween/useHalloweenActive";

/**
 * Reserva el alto del navbar fijo. Durante el Mundial el navbar es más alto
 * (cintillo countdown + 3 estrellas bajo el logo), así que empujamos el
 * contenido para que no quede tapado. En Halloween solo suma el cintillo
 * (36px). Fuera de temporada vuelve a pt-72.
 */
export default function SiteContentOffset({ children }: { children: React.ReactNode }) {
  const mundial = useMundialActive();
  const halloween = useHalloweenActive();
  const pt = mundial ? "pt-[138px]" : halloween ? "pt-[108px]" : "pt-[72px]";
  return <div className={pt}>{children}</div>;
}
