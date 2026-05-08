import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import AdminLogin from "../AdminLogin";
import CoordsFixClient from "./CoordsFixClient";

export const metadata: Metadata = {
  title: "Coordenadas · Admin",
  description: "Detectar y corregir coordenadas mal cargadas en Xintel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCoordsPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

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
            <MapPin className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Coordenadas
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Coordenadas mal cargadas
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
            Detecta propiedades cuyo lat/lng en Xintel está fuera del bounding
            box de zona oeste o lejos del barrio declarado. Podés corregirlas
            con Google Geocoding (cuesta ~USD 0.005 por propiedad y queda
            cacheado en nuestra DB para siempre).
          </p>
        </div>

        <CoordsFixClient />
      </div>
    </main>
  );
}
