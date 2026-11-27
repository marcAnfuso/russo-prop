import NavidadShell from "../_components/NavidadShell";
import NavidadStrip from "../_components/NavidadStrip";
import FuegosOverlay from "../_components/FuegosOverlay";
import { GuirnaldaPino, TituloNavidad } from "../_components/AdornosTitulo";
import RussiaRobot from "../_components/RussiaRobot";
import Trineo from "../_components/Trineo";
import IntroNavidad from "../_components/IntroNavidad";
import SeccionesNavidad from "../_components/SeccionesNavidad";
import { BolitaEscondida } from "../_components/Adornos";
import { EVENTO_INTRO_FIN } from "../_components/useArranque";
import Hero from "@/components/Hero";
import { getHomeFeatured, getHomeNewListings } from "@/lib/homepage-lists";

export const metadata = { title: "Lab · Navidad · Combo bola de nieve" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [destacadas, nuevas] = await Promise.all([
    getHomeFeatured(6).catch(() => []),
    getHomeNewListings(3).catch(() => []),
  ]);
  return (
    <>
      <NavidadStrip modo="countdown" emoji="🎄" />
      <NavidadShell
        name="Combo 1: bola de nieve + Rudolf"
        desc="Intro de la bola de nieve (1 vez por dispositivo) → trineo (1 vez por día) → título con guirnalda de pino, bolitas y botita, Rudolf (el reno IA, tocalo) y cards decoradas. Hay 5 bolitas doradas escondidas."
        stripOffset
        placeholder={false}
        barra={false}
        customHero={
          <FuegosOverlay>
            <Hero titulo={<TituloNavidad />} underline={<GuirnaldaPino />} />
            <BolitaEscondida id="hero" largo={70} className="absolute right-[7%] top-[170px] z-[7]" />
          </FuegosOverlay>
        }
      >
        <SeccionesNavidad destacadas={destacadas} nuevas={nuevas} />
      </NavidadShell>
      <IntroNavidad lab boton={false} />
      <Trineo lab boton={false} esperar={EVENTO_INTRO_FIN} />
      <RussiaRobot totalBolitas={5} variante="reno" esperar={EVENTO_INTRO_FIN} />
    </>
  );
}
