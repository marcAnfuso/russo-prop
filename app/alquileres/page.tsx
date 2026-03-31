import PropertyListWithMap from "@/components/PropertyListWithMap";
import { fetchProperties } from "@/lib/xintel";

export const metadata = {
  title: "Propiedades en Alquiler | Russo Propiedades",
  description: "Alquilá casas, departamentos y más en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en Alquiler | Russo Propiedades",
    description: "Encontrá tu próximo alquiler en zona oeste",
  },
};

export default async function AlquileresPage() {
  const { properties, hasMore, total } = await fetchProperties({ operation: "alquiler", page: 1 });
  return <PropertyListWithMap operationType="alquiler" initialProperties={properties} initialHasMore={hasMore} totalCount={total} />;
}
