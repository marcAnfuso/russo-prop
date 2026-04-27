import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listAllAlerts, describeCriterion } from "@/lib/alerts-db";
import AdminLogin from "../AdminLogin";
import AlertsClient from "./AlertsClient";

export const metadata: Metadata = {
  title: "Alertas · Admin",
  description: "Suscriptores a alertas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAlertsPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const alerts = await listAllAlerts();
  const enriched = alerts.map((a) => ({
    ...a,
    summary: describeCriterion(a.criterion),
    notified_count: (a.notified_ids ?? []).length,
  }));

  const activeCount = alerts.filter((a) => a.active).length;

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
            <Bell className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Alertas
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy">
              Suscriptores a alertas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeCount} activos · {alerts.length} totales · cron diario a
              las 12:00 UTC chequea matches y manda digest.
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Sin suscriptores todavía. Cuando alguien apriete &ldquo;Avisame&rdquo;
            en los listings, va a aparecer acá.
          </div>
        ) : (
          <AlertsClient initial={enriched} />
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-2">
          <BellOff className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Importante</p>
            <p className="mt-1 text-amber-800/90 leading-relaxed">
              Para que los emails se envíen, configurá la env var{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                RESEND_API_KEY
              </code>{" "}
              en Vercel. Mientras no esté seteada, las alertas se guardan
              normalmente pero los emails quedan en log y no se mandan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
