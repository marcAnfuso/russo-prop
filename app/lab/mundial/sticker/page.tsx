import VariantShell from "../_components/VariantShell";
import MundialSticker from "../_components/MundialSticker";

export const metadata = { title: "Lab · Mundial · Sticker" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Sticker en esquina"
        desc="Sticker flotante 🇦🇷 ¡Vamos! con wiggle. Click → confeti."
      />
      <MundialSticker />
    </>
  );
}
