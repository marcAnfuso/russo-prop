import VariantShell from "../_components/VariantShell";
import RussiaFabPelotaRebote from "../_components/RussiaFabPelotaRebote";

export const metadata = { title: "Lab · Mundial · Russia pelota" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Russia con pelota"
        desc="Pelotita rebotando permanentemente al lado del FAB."
      />
      <RussiaFabPelotaRebote />
    </>
  );
}
