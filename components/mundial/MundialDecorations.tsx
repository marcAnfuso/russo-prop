"use client";

import { useEffect, useState } from "react";
import { useMundialActive } from "./useMundialActive";
import MundialConfetti from "./MundialConfetti";
import MundialSticker from "./MundialSticker";

const CONFETTI_KEY = "mundial_confetti_fired";

/**
 * Decoraciones globales del Mundial montadas en el layout:
 *  - Confetti al cargar (una vez por sesión)
 *  - Sticker 🇦🇷 en esquina
 *
 * Todo gateado por la ventana de fecha (useMundialActive).
 */
export default function MundialDecorations() {
  const active = useMundialActive();
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!active) return;
    try {
      if (!sessionStorage.getItem(CONFETTI_KEY)) {
        sessionStorage.setItem(CONFETTI_KEY, "1");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfetti(true);
      }
    } catch {
      setConfetti(true);
    }
  }, [active]);

  if (!active) return null;

  return (
    <>
      {confetti && <MundialConfetti count={70} duration={6000} />}
      <MundialSticker />
    </>
  );
}
