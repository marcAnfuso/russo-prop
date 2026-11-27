import NavidadShell from "../_components/NavidadShell";
import NavidadStrip from "../_components/NavidadStrip";
import FuegosOverlay from "../_components/FuegosOverlay";
import BengalaUnderline from "../_components/BengalaUnderline";
import RussiaRobot from "../_components/RussiaRobot";
import Trineo from "../_components/Trineo";
import SeccionesNavidad from "../_components/SeccionesNavidad";
import { BolitaEscondida } from "../_components/Adornos";
import Hero from "@/components/Hero";
import { getHomeFeatured, getHomeNewListings } from "@/lib/homepage-lists";

export const metadata = { title: "Lab · Navidad · Todo junto" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [destacadas, nuevas] = await Promise.all([
    getHomeFeatured(6).catch(() => []),
    getHomeNewListings(3).catch(() => []),
  ]);
  return (
    <>
      <NavidadStrip modo="countdown" emoji="🥂" />
      <NavidadShell
        name="Todo junto: el brindis + Russia robot + cards"
        desc="Trineo de Papá Noel (1 vez por día), fuegos y bengalita en el Hero, Russia robot navideña (tocala, tiene voz) y cards decoradas. Hay 5 bolitas doradas escondidas."
        stripOffset
        placeholder={false}
        customHero={
          <FuegosOverlay>
            <Hero underline={<BengalaUnderline />} />
            {/* una bolita colgando en el cielo, entre las palmeras */}
            <BolitaEscondida id="hero" largo={70} className="absolute right-[7%] top-[170px] z-[7]" />
          </FuegosOverlay>
        }
      >
        <SeccionesNavidad destacadas={destacadas} nuevas={nuevas} />
      </NavidadShell>
      <Trineo lab top={205} />
      <RussiaRobot totalBolitas={5} />
    </>
  );
}
