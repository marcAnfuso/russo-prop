"use client";

import { useMundialActive } from "./useMundialActive";

/**
 * Reserva el alto del navbar fijo. Durante el Mundial el navbar es más alto
 * (cintillo countdown + 3 estrellas bajo el logo), así que empujamos el
 * contenido para que no quede tapado. Fuera del Mundial vuelve a pt-72.
 */
export default function SiteContentOffset({ children }: { children: React.ReactNode }) {
  const mundial = useMundialActive();
  return <div className={mundial ? "pt-[138px]" : "pt-[72px]"}>{children}</div>;
}
