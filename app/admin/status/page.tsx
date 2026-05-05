import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listStatuses, countStatuses } from "@/lib/status-db";
import { fetchAllProperties } from "@/lib/xintel";
import AdminLogin from "../AdminLogin";
import StatusClient, { type EnrichedStatusRow, type StatusPropertyMini } from "./StatusClient";

export const metadata: Metadata = {
  title: "Estado de propiedades · Admin",
  description: "Marcar propiedades como reservadas o vendidas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminStatusPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const [{ rows, total }, counts, ventas, alquileres] = await Promise.all([
    listStatuses({ limit: PAGE_SIZE, offset: 0 }),
    countStatuses(),
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
  ]);
  void total;

  const propertyMap = new Map<string, StatusPropertyMini>();
  for (const p of [...ventas, ...alquileres]) {
    propertyMap.set(p.id, {
      id: p.id,
      code: p.code,
      address: p.address,
      locality: p.locality,
      operation: p.operation,
      price: p.price,
      currency: p.currency,
      image: p.images[0] ?? null,
    });
  }

  const initialRows: EnrichedStatusRow[] = rows.map((r) => ({
    ...r,
    property: propertyMap.get(r.xintel_id) ?? null,
  }));

  const searchablePool = Array.from(propertyMap.values());

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
          <div className="flex items-center gap-2 text-magenta">
            <BadgeCheck className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Estado de propiedades
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Reservadas y vendidas
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
            Marcá una propiedad como <strong>reservada</strong> (oculta el
            precio y muestra badge "Reservado") o <strong>vendida</strong>{" "}
            (badge "Vendimos"). El cambio se aplica al instante en la web.
            Volver a "activa" elimina el override y la web vuelve a mostrar lo
            que diga Xintel.
          </p>
        </div>

        <StatusClient
          initial={initialRows}
          counts={counts}
          pageSize={PAGE_SIZE}
          pool={searchablePool}
        />
      </div>
    </main>
  );
}
