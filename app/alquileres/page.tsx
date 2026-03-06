import PropertyListWithMap from "@/components/PropertyListWithMap";

export const metadata = {
  title: "Alquileres | Russo Propiedades",
  description: "Propiedades en alquiler en San Justo, La Matanza y zona oeste",
};

export default function AlquileresPage() {
  return <PropertyListWithMap operationType="alquiler" />;
}
