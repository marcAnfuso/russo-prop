import VariantShell from "../_components/VariantShell";
import RussiaFabConfetti from "../_components/RussiaFabConfetti";

export const metadata = { title: "Lab · Mundial · Russia confetti" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Russia confetti"
        desc="Click en el botón de Russia → confeti celeste/blanco. Dispara una vez por sesión en producción."
      />
      <RussiaFabConfetti />
    </>
  );
}
