"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcw } from "lucide-react";
import IntroStage from "@/components/halloween/intro/IntroStage";
import { EVENTO_INTRO_FIN } from "./useArranque";

const EscenaGlobo = dynamic(() => import("../intro/_components/EscenaGlobo"), { ssr: false });
const CLAVE = "russo_intro_navidad";

/**
 * La bola de nieve a pantalla completa antes de la web. En producción, una
 * vez por dispositivo; en el lab, en cada carga y con botón para repetirla.
 * Al terminar (o al saltearla) avisa con `russo:intro-fin` para que recién
 * ahí pasen el trineo y aparezca Rudolf.
 */
export default function IntroNavidad({ lab = false }: { lab?: boolean }) {
  const [toma, setToma] = useState(0);

  useEffect(() => {
    if (!lab) {
      try {
        if (localStorage.getItem(CLAVE)) {
          window.dispatchEvent(new Event(EVENTO_INTRO_FIN));
          return;
        }
        localStorage.setItem(CLAVE, "1");
      } catch { /* sin storage: se ve igual */ }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToma(1);
  }, [lab]);

  const fin = useCallback(() => {
    setToma(0);
    window.dispatchEvent(new Event(EVENTO_INTRO_FIN));
  }, []);

  return (
    <>
      {toma > 0 && <IntroStage key={toma} label="Intro de Navidad" onDone={fin} Escena={EscenaGlobo} />}
      {lab && toma === 0 && (
        <button type="button" onClick={() => { window.scrollTo(0, 0); setToma((n) => n + 1); }} className="fixed right-3 top-[220px] z-[46] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-navy shadow ring-1 ring-gray-200 hover:bg-white">
          <RotateCcw className="h-3 w-3" /> Repetir la bola de nieve (lab)
        </button>
      )}
    </>
  );
}
