import type { AreaMeasurement } from "@/data/types";

interface Props {
  areas: AreaMeasurement[];
}

/**
 * Formats Xintel area values like "62.00m2" → "62 m²" for display.
 * Leaves non-numeric values untouched (so "3.40 x 2.90" passes through).
 */
function formatArea(value: string): string {
  const match = value.match(/^(\d+)(?:[.,]0+)?m?2?$/i);
  if (match) return `${match[1]} m²`;
  // Replace standalone "m2" with "m²"
  return value.replace(/\bm2\b/gi, "m²");
}

export default function AreaMeasurementsTable({ areas }: Props) {
  if (!areas || areas.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-4">
        <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
        Medidas
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {areas.map((a, i) => (
              <tr
                key={a.label}
                className={i < areas.length - 1 ? "border-b border-gray-100" : ""}
              >
                <td className="bg-gray-50/60 px-4 py-3 font-medium text-gray-500 w-1/3">
                  Sup. {a.label.toLowerCase()}
                </td>
                <td className="px-4 py-3 font-mono-price font-semibold text-navy">
                  {formatArea(a.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        Las superficies y medidas son aproximadas y a solo efecto orientativo.
      </p>
    </section>
  );
}
