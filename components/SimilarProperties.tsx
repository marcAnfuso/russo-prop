import type { Property } from "@/data/types";
import PropertyCard from "@/components/PropertyCard";

interface SimilarPropertiesProps {
  currentProperty: Property;
  allProperties: Property[];
}

export default function SimilarProperties({
  currentProperty,
  allProperties,
}: SimilarPropertiesProps) {
  // Only show properties with the same operation (venta with venta, alquiler with alquiler)
  const others = allProperties.filter(
    (p) => p.id !== currentProperty.id && p.operation === currentProperty.operation
  );

  // Prefer same locality, then same type, then any
  const sameLocality = others.filter(
    (p) => p.locality === currentProperty.locality
  );
  const sameType = others.filter((p) => p.type === currentProperty.type);

  const ranked = [
    ...sameLocality,
    ...sameType.filter((p) => !sameLocality.includes(p)),
    ...others.filter(
      (p) => !sameLocality.includes(p) && !sameType.includes(p)
    ),
  ];

  const similar = ranked.slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-6">
        <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
        Propiedades similares
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {similar.map((property) => (
          <PropertyCard key={property.id} property={property} hideContactButtons />
        ))}
      </div>
    </section>
  );
}
