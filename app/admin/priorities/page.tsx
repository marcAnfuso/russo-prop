import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listPriorities, countPriorities } from "@/lib/priorities-db";
import { fetchAllProperties } from "@/lib/xintel";
import AdminLogin from "../AdminLogin";
import PrioritiesClient, { type EnrichedPriorityRow } from "./PrioritiesClient";

export const metadata: Metadata = {
  title: "Prioridades · Admin",
  description: "Orden de visibilidad de propiedades",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminPrioritiesPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  // Cargamos primera página de prioridades + total + todas las propiedades
  // (para enriquecer con dirección/imagen/precio en la tabla y para el
  // buscador local por RUS).
  const [{ rows, total }, totalAll, ventas, alquileres] = await Promise.all([
    listPriorities({ limit: PAGE_SIZE, offset: 0 }),
    countPriorities(),
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
  ]);
  void total;

  const propertyMap = new Map<string, ReturnType<typeof toPropertyMini>>();
  for (const p of [...ventas, ...alquileres]) {
    propertyMap.set(p.id, toPropertyMini(p));
  }

  const initialRows: EnrichedPriorityRow[] = rows.map((r) => ({
    ...r,
    property: propertyMap.get(r.xintel_id) ?? null,
  }));

  // Lista plana de propiedades para el buscador (id + code + addr + op).
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
            <ListOrdered className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Priority View
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Prioridad de visibilidad
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
            Las propiedades con prioridad más alta salen primero en los
            listados de Ventas y Alquileres. Las que no tienen prioridad
            aparecen al final, ordenadas por código.
          </p>
        </div>

        <PrioritiesClient
          initial={initialRows}
          totalAll={totalAll}
          pageSize={PAGE_SIZE}
          pool={searchablePool}
        />
      </div>
    </main>
  );
}

function toPropertyMini(p: {
  id: string;
  code: string;
  address: string;
  locality: string;
  operation: "venta" | "alquiler";
  price: number;
  currency: "USD" | "ARS";
  images: string[];
}) {
  return {
    id: p.id,
    code: p.code,
    address: p.address,
    locality: p.locality,
    operation: p.operation,
    price: p.price,
    currency: p.currency,
    image: p.images[0] ?? null,
  };
}
