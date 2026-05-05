import type { Metadata } from "next";
import { listMediaPicks } from "@/lib/media-picks";
import { getReactionsMap } from "@/lib/media-reactions";
import { fetchAllProperties } from "@/lib/xintel";
import HistoriasClient from "./HistoriasClient";

export const metadata: Metadata = {
  title: "Historias",
  description:
    "Momentos que vivimos con nuestros clientes — nuevos dueños tocando la campana, tours por propiedades, el día a día de Russo Propiedades.",
  alternates: { canonical: "https://russo-prop.vercel.app/historias" },
};

export const dynamic = "force-dynamic";

export default async function HistoriasPage() {
  let items: Awaited<ReturnType<typeof listMediaPicks>> = [];
  let reactionsMap = new Map<string, { heart: number; home: number; key: number }>();
  let propertyMap = new Map<string, { code: string; address: string; locality: string }>();

  try {
    items = await listMediaPicks();
  } catch {
    // DB down — render empty state instead of crashing the page
  }
  try {
    reactionsMap = await getReactionsMap();
  } catch {
    // sin reacciones · arranca todo en 0
  }
  // Solo nos interesan las props vinculadas. Si ninguna historia tiene
  // property_id, evitamos el fetch caro.
  const linkedIds = new Set(items.map((i) => i.property_id).filter((x): x is string => !!x));
  if (linkedIds.size > 0) {
    try {
      const [v, a] = await Promise.all([
        fetchAllProperties("venta"),
        fetchAllProperties("alquiler"),
      ]);
      for (const p of [...v, ...a]) {
        if (linkedIds.has(p.id)) {
          propertyMap.set(p.id, {
            code: p.code,
            address: p.address,
            locality: p.locality,
          });
        }
      }
    } catch {
      // si Xintel cae, mostramos sin info extra
    }
  }

  // Enriquecer items con reactions + property info
  const enriched = items.map((i) => ({
    ...i,
    reactions: reactionsMap.get(i.id) ?? { heart: 0, home: 0, key: 0 },
    property: i.property_id ? propertyMap.get(i.property_id) ?? null : null,
  }));

  return <HistoriasClient items={enriched} />;
}
