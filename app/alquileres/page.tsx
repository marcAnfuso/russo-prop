import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import PropertyListSkeleton from "@/components/PropertyListSkeleton";
import { fetchAllProperties } from "@/lib/xintel";

export const metadata = {
  title: "Propiedades en Alquiler | Russo Propiedades",
  description: "Alquilá casas, departamentos y más en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en Alquiler | Russo Propiedades",
    description: "Encontrá tu próximo alquiler en zona oeste",
  },
};

async function AlquileresContent() {
  const properties = await fetchAllProperties("alquiler");
  return (
    <PropertyListWithMap
      operationType="alquiler"
      initialProperties={properties}
      initialHasMore={false}
      totalCount={properties.length}
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
