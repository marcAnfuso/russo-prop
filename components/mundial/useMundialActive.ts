"use client";

import { useEffect, useState } from "react";
import { isMundialActive } from "@/lib/mundial";

/**
 * Devuelve si el Mundial está activo, resuelto en el cliente tras el montaje.
 * Arranca en `false` (SSR) y pasa a `true` si la fecha cae dentro de la
 * ventana — así evitamos mismatch de hidratación y no forzamos render dinámico
 * en todas las páginas.
 */
export function useMundialActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(isMundialActive());
  }, []);
  return active;
}
