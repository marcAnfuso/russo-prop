import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { listPicks } from "@/lib/picks";
import { listMediaPicks } from "@/lib/media-picks";
import { fetchDevelopments } from "@/lib/xintel-developments";
import AdminLogin from "./AdminLogin";
import AdminConsole from "./AdminConsole";

export const metadata: Metadata = {
  title: "Admin · Russo",
  description: "Panel interno — no indexar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const [ventas, alquileres, featured, fresh, sold, media, developments, hiddenDevs] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    listPicks("featured"),
    listPicks("new"),
    listPicks("sold"),
    listMediaPicks(),
    fetchDevelopments(),
    listPicks("development_hidden"),
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
      initialSold={sold}
      initialMedia={media}
      initialDevelopments={developments}
      initialHiddenDevelopments={hiddenDevs}
      currentUser={{
        id: me.id,
        username: me.username,
        displayName: me.display_name,
        role: me.role,
      }}
    />
  );
}
