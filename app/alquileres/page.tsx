import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import PropertyListSkeleton from "@/components/PropertyListSkeleton";
import { fetchAllProperties, toListProperty } from "@/lib/xintel";

export const metadata = {
  title: "Propiedades en alquiler",
  description: "Alquilá casas, departamentos y más en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en alquiler",
    description: "Encontrá tu próximo alquiler en zona oeste",
  },
};

async function AlquileresContent() {
  const properties = await fetchAllProperties("alquiler");
  // Strip campos pesados: el detail page re-fetchea la ficha completa.
  const listProperties = properties.map(toListProperty);
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
