import { Suspense } from "react";
import PropertyListWithMap from "@/components/PropertyListWithMap";
import { fetchProperties } from "@/lib/xintel";

export const metadata = {
  title: "Propiedades en Venta | Russo Propiedades",
  description: "Encontrá casas, departamentos, terrenos y más en venta en San Justo, La Matanza y zona oeste. Russo Propiedades, más de 30 años de experiencia.",
  openGraph: {
    title: "Propiedades en Venta | Russo Propiedades",
    description: "Encontrá tu próximo hogar en zona oeste",
  },
};

async function VentasContent() {
  const { properties, hasMore, total } = await fetchProperties({ operation: "venta", page: 1 });
  return <PropertyListWithMap operationType="venta" initialProperties={properties} initialHasMore={hasMore} totalCount={total} />;
}

export default function VentasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <VentasContent />
    </Suspense>
  );
}
