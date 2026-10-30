"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// En un chunk aparte: quien no ve la intro no descarga GSAP ni la escena.
const IntroCasa = dynamic(() => import("./IntroCasa"), { ssr: false });

/**
 * Monta la intro sólo si IntroHalloweenScript ya decidió que este visitante
 * la ve (la marca está en <html>). No repite ninguna regla acá.
 */
export default function IntroHalloween() {
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    if (!document.documentElement.classList.contains("hw-intro")) return;
    new Image().src = "/images/halloween/cartel-russo.webp";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiva(true);
  }, []);

  const onDone = useCallback(() => {
    document.documentElement.classList.remove("hw-intro", "hw-cover");
    setActiva(false);
  }, []);

  return activa ? <IntroCasa onDone={onDone} /> : null;
}
