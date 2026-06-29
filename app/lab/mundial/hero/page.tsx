import VariantShell from "../_components/VariantShell";
import PatrioHero from "../_components/PatrioHero";

export const metadata = { title: "Lab · Mundial · Hero patrio" };

export default function Page() {
  return (
    <VariantShell
      name="Hero patrio"
      desc="Kicker con 🇦🇷 + subrayado bajo 'empieza acá' en gradiente bandera."
      customHero={<PatrioHero />}
    />
  );
}
