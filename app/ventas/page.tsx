import PropertyListWithMap from "@/components/PropertyListWithMap";

export const metadata = {
  title: "Ventas | Russo Propiedades",
  description: "Propiedades en venta en San Justo, La Matanza y zona oeste",
};

export default function VentasPage() {
  return <PropertyListWithMap operationType="venta" />;
}
