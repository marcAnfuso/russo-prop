import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  getOverviewWithDelta,
  getDailyTimeline,
  getTopPaths,
  getTopReferrers,
  getDeviceBreakdown,
  getTopProperties,
  getCountryBreakdown,
  getTopSearches,
  getScrollDepthDistribution,
  getContactBreakdown,
  getHourlyTraffic,
} from "@/lib/analytics-db";
import AdminLogin from "../AdminLogin";
import AnalyticsDashboard from "./AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics · Admin",
  description: "Métricas internas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const { days: daysParam } = await searchParams;
  const days = (() => {
    const n = Number(daysParam);
    return Number.isFinite(n) && n > 0 && n <= 365 ? n : 7;
  })();

  const [
    overview,
    daily,
    topPaths,
    topReferrers,
    devices,
    topProps,
    countries,
    topSearches,
    scrollDist,
    contactDist,
    hourly,
  ] = await Promise.all([
    getOverviewWithDelta(days),
    getDailyTimeline(days),
    getTopPaths(days, 10),
    getTopReferrers(days, 8),
    getDeviceBreakdown(days),
    getTopProperties(days, 10),
    getCountryBreakdown(days, 8),
    getTopSearches(days, 8),
    getScrollDepthDistribution(days),
    getContactBreakdown(days),
    getHourlyTraffic(days),
  ]);

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
            <BarChart3 className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Analytics
            </p>
          </div>
        </div>
      </header>

      <AnalyticsDashboard
        days={days}
        overview={overview}
        daily={daily}
        topPaths={topPaths}
        topReferrers={topReferrers}
        devices={devices}
        topProperties={topProps}
        countries={countries}
        topSearches={topSearches}
        scrollDist={scrollDist}
        contactDist={contactDist}
        hourly={hourly}
      />
    </main>
  );
}
