import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import PropertyListSkeleton from "@/components/PropertyListSkeleton";
import { fetchAllProperties } from "@/lib/xintel";

export const metadata = {
  title: "Propiedades en venta",
  description: "Encontrá casas, departamentos, terrenos y más en venta en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en venta",
    description: "Encontrá tu próximo hogar en zona oeste",
  },
};

async function VentasContent() {
  const properties = await fetchAllProperties("venta");
  return (
    <PropertyListWithMap
      operationType="venta"
      initialProperties={properties}
      initialHasMore={false}
      totalCount={properties.length}
    />
  );
}

export default function VentasPage() {
  return (
    <Suspense fallback={<PropertyListSkeleton operation="venta" />}>
      <VentasContent />
    </Suspense>
  );
}
