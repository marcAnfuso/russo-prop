import VariantShell from "../_components/VariantShell";
import RussiaFabPintura from "../_components/RussiaFabPintura";

export const metadata = { title: "Lab · Mundial · Russia cara pintada" };

export default function Page() {
  return (
    <>
      <VariantShell
        name="Russia cara pintada"
        desc="Dos rayitas celestes diagonales sobre el ícono. Más minimal que la vincha."
      />
      <RussiaFabPintura />
    </>
  );
}
