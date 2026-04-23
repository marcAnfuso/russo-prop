import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import PropertyListSkeleton from "@/components/PropertyListSkeleton";
import { fetchAllProperties, toListProperty } from "@/lib/xintel";
import { listPicks } from "@/lib/picks";

export const metadata = {
  title: "Propiedades en alquiler",
  description: "Alquilá casas, departamentos y más en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en alquiler",
    description: "Encontrá tu próximo alquiler en zona oeste",
  },
};

async function AlquileresContent() {
  const [properties, soldIds] = await Promise.all([
    fetchAllProperties("alquiler"),
    listPicks("sold"),
  ]);
  const soldSet = new Set(soldIds);
  // Strip campos pesados: el detail page re-fetchea la ficha completa.
  const listProperties = properties.map((p) => ({
    ...toListProperty(p),
    sold: soldSet.has(p.id),
  }));
  return (
    <PropertyListWithMap
      operationType="alquiler"
      initialProperties={listProperties}
      initialHasMore={false}
      totalCount={listProperties.length}
    />
  );
}

export default function AlquileresPage() {
  return (
    <Suspense fallback={<PropertyListSkeleton operation="alquiler" />}>
      <AlquileresContent />
    </Suspense>
  );
}
