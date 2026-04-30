import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads-db";
import AdminLogin from "../AdminLogin";
import LeadsClient from "./LeadsClient";

export const metadata: Metadata = {
  title: "Leads · Admin",
  description: "Personas que llenaron un formulario",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminLeadsPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const data = await listLeads({ status: "todos", limit: PAGE_SIZE, offset: 0 });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
          <div className="flex items-center gap-2 text-magenta">
            <Inbox className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Leads
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Leads · personas que se contactaron
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cada fila es alguien que llenó un formulario en el sitio
            (página de contacto, modal de propiedad o tasación).
          </p>
        </div>

        <LeadsClient initial={data.rows} initialCounts={data.counts} pageSize={PAGE_SIZE} />
      </div>
    </main>
  );
}
