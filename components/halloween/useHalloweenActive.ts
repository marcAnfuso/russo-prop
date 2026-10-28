"use client";

import { useEffect, useState } from "react";
import { isHalloweenActive } from "@/lib/halloween";

const PREVIEW_KEY = "russo_halloween_preview";

/**
 * Igual que useMundialActive: arranca en `false` en el servidor y se resuelve
 * en el cliente tras el montaje (sin mismatch de hidratación ni render
 * dinámico). Además acepta `?halloween=1` para previsualizar antes de fecha;
 * la preferencia queda en sessionStorage para que sobreviva la navegación.
 */
export function useHalloweenActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let preview = false;
    try {
      const q = new URLSearchParams(window.location.search).get("halloween");
      if (q === "1") sessionStorage.setItem(PREVIEW_KEY, "1");
      if (q === "0") sessionStorage.removeItem(PREVIEW_KEY);
      preview = sessionStorage.getItem(PREVIEW_KEY) === "1";
    } catch {
      // sessionStorage bloqueado (modo privado, etc.): solo cuenta la fecha.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(preview || isHalloweenActive());
  }, []);
  return active;
}
