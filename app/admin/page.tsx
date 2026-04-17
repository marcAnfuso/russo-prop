import type { Metadata } from "next";
import { currentSessionIsAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { listPicks } from "@/lib/picks";
import AdminLogin from "./AdminLogin";
import AdminConsole from "./AdminConsole";

export const metadata: Metadata = {
  title: "Admin · Russo",
  description: "Panel interno — no indexar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await currentSessionIsAdmin();
  if (!authed) return <AdminLogin />;

  const [ventas, alquileres, featured, fresh] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    listPicks("featured"),
    listPicks("new"),
  ]);
  const all = [...ventas, ...alquileres];
  // Deduplicate in case a listing shows in both operations somehow.
  const byId = new Map(all.map((p) => [p.id, p]));
  const properties = Array.from(byId.values()).map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    address: p.address,
    locality: p.locality,
    operation: p.operation,
    price: p.price,
    currency: p.currency,
    image: p.images[0] ?? null,
    type: p.type,
  }));

  return (
    <AdminConsole
      properties={properties}
      initialFeatured={featured}
      initialNew={fresh}
    />
  );
}
