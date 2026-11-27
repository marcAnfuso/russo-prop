import NavidadShell from "../_components/NavidadShell";
import NavidadStrip from "../_components/NavidadStrip";
import GuirnaldaOverlay from "../_components/GuirnaldaOverlay";
import MonoUnderline from "../_components/MonoUnderline";
import RussiaFabGorro from "../_components/RussiaFabGorro";
import Hero from "@/components/Hero";

export const metadata = { title: "Lab · Navidad · Guirnalda y moño" };

export default function Page() {
  return (
    <>
      <NavidadStrip />
      <NavidadShell
        name="Guirnalda y moño"
        desc="Guirnalda de luces que se prende al entrar, 'empieza acá' atado con moño de regalo y Russia con gorro."
        stripOffset
        customHero={
          <div className="relative">
            <Hero underline={<MonoUnderline />} />
            <GuirnaldaOverlay top={108} />
          </div>
        }
      />
      <RussiaFabGorro />
    </>
  );
}
