"use client";

import { useLayoutEffect, useState } from "react";
import { INTRO_KEY } from "@/lib/halloween";
import EscenaCasa from "./EscenaCasa";
import IntroStage from "./IntroStage";

/**
 * La escena toma el lugar de la tapa en el mismo cuadro. Si la tapa ya venció
 * (el chunk llegó tarde), no aparece encima de una web que ya se está usando.
 */
export default function IntroCasa({ onDone }: { onDone: () => void }) {
  const [aTiempo] = useState(() => document.documentElement.classList.contains("hw-cover"));

  useLayoutEffect(() => {
    if (!aTiempo) {
      onDone();
      return;
    }
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      // noop
    }
    document.documentElement.classList.remove("hw-cover");
  }, [aTiempo, onDone]);

  return aTiempo ? <IntroStage onDone={onDone} Escena={EscenaCasa} /> : null;
}
