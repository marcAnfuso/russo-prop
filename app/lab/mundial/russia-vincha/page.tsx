import VariantShell from "../_components/VariantShell";
import RussiaFabVincha from "../_components/RussiaFabVincha";

export const metadata = { title: "Lab · Mundial · Russia con vincha" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Russia con vincha"
        desc="Vinchita celeste/blanca + sol de mayo apoyada arriba del FAB."
      />
      <RussiaFabVincha />
    </>
  );
}
