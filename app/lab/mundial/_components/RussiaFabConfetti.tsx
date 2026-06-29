"use client";

import { useState } from "react";
import RussiaFabDemo from "./RussiaFabDemo";
import MundialConfetti from "./MundialConfetti";

/**
 * Russia: confeti celeste/blanco al hacer click en el FAB por primera vez.
 * En producción dispararía al abrir el chat por primera vez en la sesión.
 */
export default function RussiaFabConfetti() {
  const [burst, setBurst] = useState(0);

  return (
    <>
      <RussiaFabDemo onClick={() => setBurst((b) => b + 1)} />
      {burst > 0 && <MundialConfetti key={burst} count={50} duration={4500} />}
    </>
  );
}
