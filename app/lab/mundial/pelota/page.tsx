import VariantShell from "../_components/VariantShell";
import PelotaRodando from "../_components/PelotaRodando";

export const metadata = { title: "Lab · Mundial · Pelota rodando" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Pelota rodando"
        desc="Cada 12 segundos cruza la parte inferior. Easter egg."
      />
      <PelotaRodando intervalMs={12000} />
    </>
  );
}
