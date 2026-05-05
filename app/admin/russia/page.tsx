import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getRussiaStats, listRussiaSessions } from "@/lib/russia-logs";
import AdminLogin from "../AdminLogin";
import RussiaLogsClient from "./RussiaLogsClient";

export const metadata: Metadata = {
  title: "Uso de Russia · Admin",
  description: "Monitoreo de consultas a la asistente IA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminRussiaPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const [{ sessions, total }, stats] = await Promise.all([
    listRussiaSessions({ limit: PAGE_SIZE, offset: 0 }),
    getRussiaStats(),
  ]);

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
            <MessageCircle className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Russia · uso
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Consultas a Russia
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
            Cada mensaje que la gente le manda a la IA queda registrado acá
            (anonimizado). Sirve para detectar abuso, ver qué consultan los
            visitantes y estimar costos.
          </p>
        </div>

        <RussiaLogsClient
          initialSessions={sessions}
          initialTotal={total}
          stats={stats}
          pageSize={PAGE_SIZE}
        />
      </div>
    </main>
  );
}
