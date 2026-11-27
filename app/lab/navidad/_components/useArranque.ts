"use client";

import { useEffect, useState } from "react";

/** Evento que dispara la intro de pantalla completa al terminar (o al saltearla). */
export const EVENTO_INTRO_FIN = "russo:intro-fin";

/**
 * `true` cuando ya se puede arrancar: enseguida si no hay que esperar nada, o
 * cuando llega el evento (así el trineo y Russia no corren detrás de la intro).
 */
export function useArranque(esperar?: string) {
  const [listo, setListo] = useState(!esperar);
  useEffect(() => {
    if (!esperar) return;
    const on = () => setListo(true);
    window.addEventListener(esperar, on);
    return () => window.removeEventListener(esperar, on);
  }, [esperar]);
  return listo;
}
