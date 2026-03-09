import PropertyListWithMap from "@/components/PropertyListWithMap";
import { fetchProperties } from "@/lib/xintel";

export const metadata = {
  title: "Alquileres | Russo Propiedades",
  description: "Propiedades en alquiler en San Justo, La Matanza y zona oeste",
};

export default async function AlquileresPage() {
  const { properties, hasMore, total } = await fetchProperties({ operation: "alquiler", page: 1 });
  return <PropertyListWithMap operationType="alquiler" initialProperties={properties} initialHasMore={hasMore} totalCount={total} />;
}
