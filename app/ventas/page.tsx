import PropertyListWithMap from "@/components/PropertyListWithMap";
import { fetchProperties } from "@/lib/xintel";

export const metadata = {
  title: "Ventas | Russo Propiedades",
  description: "Propiedades en venta en San Justo, La Matanza y zona oeste",
};

export default async function VentasPage() {
  const { properties, hasMore, total } = await fetchProperties({ operation: "venta", page: 1 });
  return <PropertyListWithMap operationType="venta" initialProperties={properties} initialHasMore={hasMore} totalCount={total} />;
}
