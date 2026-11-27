import NavidadShell from "../_components/NavidadShell";
import NavidadStrip from "../_components/NavidadStrip";
import FuegosOverlay from "../_components/FuegosOverlay";
import BengalaUnderline from "../_components/BengalaUnderline";
import RussiaFabGorro from "../_components/RussiaFabGorro";
import Hero from "@/components/Hero";

export const metadata = { title: "Lab · Navidad · El brindis del 24" };

export default function Page() {
  return (
    <>
      <NavidadStrip modo="countdown" emoji="🥂" />
      <NavidadShell
        name="El brindis del 24"
        desc="Navidad argentina, de verano: fuegos artificiales en el cielo del Hero (tocá el cielo y sale uno), bengalita y cuenta regresiva al brindis."
        stripOffset
        customHero={
          <FuegosOverlay>
            <Hero underline={<BengalaUnderline />} />
          </FuegosOverlay>
        }
      />
      <RussiaFabGorro saludo="¿brindamos por tu casa nueva? 🥂" />
    </>
  );
}
