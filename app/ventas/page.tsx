import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import PropertyListSkeleton from "@/components/PropertyListSkeleton";
import { fetchAllProperties, toListProperty } from "@/lib/xintel";
import { listPicks } from "@/lib/picks";

export const metadata = {
  title: "Propiedades en venta",
  description: "Encontrá casas, departamentos, terrenos y más en venta en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en venta",
    description: "Encontrá tu próximo hogar en zona oeste",
  },
};

async function VentasContent() {
  const [properties, soldIds] = await Promise.all([
    fetchAllProperties("venta"),
    listPicks("sold"),
  ]);
  const soldSet = new Set(soldIds);
  // Strip campos pesados antes de serializar: el HTML bajaba casi 1.9 MB
  // con las 658 propiedades completas y Chrome mataba el renderer en
  // devices flojos. El detail page re-fetchea la ficha entera.
  const listProperties = properties.map((p) => ({
    ...toListProperty(p),
    sold: soldSet.has(p.id),
  }));
  return (
    <PropertyListWithMap
      operationType="venta"
      initialProperties={listProperties}
      initialHasMore={false}
      totalCount={listProperties.length}
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
