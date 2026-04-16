import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";

interface Row {
  label: string;
  value: string | number;
}

function operationLabel(op: string): string {
  return op === "alquiler" ? "Alquiler" : "Venta";
}

function typeLabel(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function yesNo(v?: boolean): string | null {
  if (v === true) return "Sí";
  if (v === false) return "No";
  return null;
}

export default function PropertyDetailsTable({ property }: { property: Property }) {
  const d = property.details ?? {};
  const f = property.features ?? {};

  // Build left column (general)
  const left: Row[] = [
    { label: "Tipo", value: typeLabel(property.type) },
    { label: "Operación", value: operationLabel(property.operation) },
    { label: "Localidad", value: property.district || "—" },
    { label: "Barrio", value: property.locality || "—" },
    { label: "Dirección", value: property.address || "—" },
  ];
  if (f.rooms) left.push({ label: "Ambientes", value: f.rooms });
  if (f.bedrooms) left.push({ label: "Dormitorios", value: f.bedrooms });
  if (d.category) left.push({ label: "Categoría", value: d.category });
  if (f.age != null && f.age > 0) left.push({ label: "Antigüedad", value: `${f.age} años` });
  if (d.expenses) left.push({ label: "Expensas", value: `$ ${formatPrice(d.expenses)}` });
  if (d.tax) left.push({ label: "Impuesto", value: `$ ${formatPrice(d.tax)}` });
  if (d.orientation) left.push({ label: "Ubicación", value: d.orientation });
  if (d.apartmentType) left.push({ label: "Tipo", value: d.apartmentType.toUpperCase() });

  // Build right column (unit-specific)
  const right: Row[] = [];
  if (d.floor) right.push({ label: "Piso", value: `${d.floor}°` });
  if (d.aptNumber) right.push({ label: "Depto.", value: d.aptNumber });
  const hw = yesNo(d.hasHotWater);
  if (hw) right.push({ label: "Agua caliente", value: hw });
  if (d.elevators) right.push({ label: "Ascensores", value: d.elevators });
  if (f.bathrooms) right.push({ label: "Baños", value: f.bathrooms });
  if (d.condition) right.push({ label: "Estado", value: d.condition });
  if (f.garage) right.push({ label: "Cocheras", value: f.garage });

  // Nothing to render if both columns empty (unlikely but be defensive)
  if (left.length === 0 && right.length === 0) return null;

  // Pair rows side by side. If columns differ in length, pad with undefined.
  const maxLen = Math.max(left.length, right.length);
  const pairs: [Row | undefined, Row | undefined][] = [];
  for (let i = 0; i < maxLen; i++) {
    pairs.push([left[i], right[i]]);
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-navy mb-4">
        Detalles de la propiedad
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {pairs.map(([l, r], i) => (
              <tr
                key={i}
                className={`${i < maxLen - 1 ? "border-b border-gray-100" : ""}`}
              >
                {l ? (
                  <>
                    <td className="bg-gray-50/60 px-4 py-3 font-medium text-gray-500 w-1/5">
                      {l.label}
                    </td>
                    <td className="px-4 py-3 text-navy w-3/10 whitespace-pre-wrap">
                      {l.value}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="bg-gray-50/60 w-1/5" />
                    <td className="w-3/10" />
                  </>
                )}
                {r ? (
                  <>
                    <td className="bg-gray-50/60 px-4 py-3 font-medium text-gray-500 w-1/5 border-l border-gray-100">
                      {r.label}
                    </td>
                    <td className="px-4 py-3 text-navy w-3/10">{r.value}</td>
                  </>
                ) : (
                  <>
                    <td className="bg-gray-50/60 w-1/5 border-l border-gray-100" />
                    <td className="w-3/10" />
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
