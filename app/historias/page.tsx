import type { Metadata } from "next";
import { listMediaPicks } from "@/lib/media-picks";
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
  try {
    items = await listMediaPicks();
  } catch {
    // DB down — render empty state instead of crashing the page
  }
  return <HistoriasClient items={items} />;
}
