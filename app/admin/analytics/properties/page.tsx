import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  MessageCircle,
  TrendingUp,
  Heart,
  Clock,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getPropertyRanking, type PropertyRankingRow } from "@/lib/analytics-db";
import { fetchAllProperties } from "@/lib/xintel";
import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";
import AdminLogin from "../../AdminLogin";

export const metadata: Metadata = {
  title: "Propiedades · Analytics",
  description: "Ranking de propiedades",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SortKey = "views" | "contacts" | "conversion" | "favorites" | "time";

interface PageProps {
  searchParams: Promise<{ days?: string; sort?: string }>;
}

const TABS: { key: SortKey; label: string; icon: typeof Eye; description: string }[] = [
  { key: "views",      label: "Más vistas",       icon: Eye,           description: "Las que más se miran." },
  { key: "contacts",   label: "Más contactadas",  icon: MessageCircle, description: "Las que más generan consultas (WhatsApp, llamadas, formularios, chat IA)." },
  { key: "conversion", label: "Mejor conversión", icon: TrendingUp,    description: "Las que tienen el mejor ratio de contactos sobre vistas. Mínimo 5 vistas para entrar." },
  { key: "favorites",  label: "Más favoriteadas", icon: Heart,         description: "Las que más usuarios marcan como favoritas." },
  { key: "time",       label: "Más tiempo",       icon: Clock,         description: "Las que captan la atención más larga (tiempo promedio de lectura)." },
];

function parseSort(raw: string | undefined): SortKey {
  if (raw && TABS.some((t) => t.key === raw)) return raw as SortKey;
  return "views";
}

export default async function PropertiesAnalyticsPage({ searchParams }: PageProps) {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const { days: daysParam, sort: sortParam } = await searchParams;
  const days = (() => {
    const n = Number(daysParam);
    return Number.isFinite(n) && n > 0 && n <= 365 ? n : 30;
  })();
  const sort = parseSort(sortParam);

  // Traemos ranking + data completa de propiedades para joinear thumbs/dirección
  const [ranking, all] = await Promise.all([
    getPropertyRanking(days, 50),
    fetchAllProperties(),
  ]);

  // Aplicamos el orden según tab
  const sorted = applySort(ranking, sort).slice(0, 30);

  const propertyById = new Map<string, Property>(all.map((p) => [p.id, p]));

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Analytics
          </Link>
          <div className="flex items-center gap-2 text-magenta">
            <BarChart3 className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Ranking de propiedades
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy">
              Ranking de propiedades
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {TABS.find((t) => t.key === sort)?.description}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
            {[7, 30, 90, 365].map((d) => {
              const params = new URLSearchParams();
              params.set("days", String(d));
              params.set("sort", sort);
              return (
                <Link
                  key={d}
                  href={`/admin/analytics/properties?${params.toString()}`}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    d === days
                      ? "bg-magenta text-white"
                      : "text-navy hover:bg-gray-50"
                  }`}
                >
                  {d === 7 ? "7d" : d === 30 ? "30d" : d === 90 ? "90d" : "1 año"}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap border-b border-gray-200">
          {TABS.map((t) => {
            const params = new URLSearchParams();
            params.set("days", String(days));
            params.set("sort", t.key);
            const active = t.key === sort;
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={`/admin/analytics/properties?${params.toString()}`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                  active
                    ? "border-magenta text-magenta"
                    : "border-transparent text-gray-500 hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Sin data todavía para este rango.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Propiedad</th>
                  <th className="text-right px-4 py-3 font-semibold">Vistas</th>
                  <th className="text-right px-4 py-3 font-semibold">Contactos</th>
                  <th className="text-right px-4 py-3 font-semibold">Conversión</th>
                  <th className="text-right px-4 py-3 font-semibold">Favs</th>
                  <th className="text-right px-4 py-3 font-semibold">Tiempo medio</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <PropertyRow
                    key={row.property_id}
                    rank={i + 1}
                    row={row}
                    property={propertyById.get(row.property_id)}
                    highlight={sort}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function PropertyRow({
  rank,
  row,
  property,
  highlight,
}: {
  rank: number;
  row: PropertyRankingRow;
  property: Property | undefined;
  highlight: SortKey;
}) {
  const conversion = row.views > 0 ? (row.contacts / row.views) * 100 : 0;
  const cellCls = (col: SortKey) =>
    `text-right px-4 py-3 tabular-nums ${
      col === highlight ? "text-magenta font-bold" : "text-gray-600"
    }`;

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 font-mono-price text-gray-400 tabular-nums">
        {rank.toString().padStart(2, "0")}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/propiedad/${row.property_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <div className="relative flex-shrink-0 h-12 w-16 rounded-md overflow-hidden bg-gray-100">
            {property?.images?.[0] ? (
              <Image
                src={property.images[0]}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-mono">RUS{row.property_id}</p>
            <p className="text-sm font-semibold text-navy truncate group-hover:text-magenta transition-colors">
              {property?.address ?? "Propiedad"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {property?.locality}
              {property
                ? ` · ${property.currency === "ARS" ? "$" : "USD"} ${formatPrice(property.price)}`
                : ""}
            </p>
          </div>
        </Link>
      </td>
      <td className={cellCls("views")}>{row.views}</td>
      <td className={cellCls("contacts")}>{row.contacts}</td>
      <td className={cellCls("conversion")}>{conversion.toFixed(1)}%</td>
      <td className={cellCls("favorites")}>{row.favorites}</td>
      <td className={cellCls("time")}>
        {row.avg_time_seconds > 0 ? formatTime(row.avg_time_seconds) : "—"}
      </td>
    </tr>
  );
}

function applySort(rows: PropertyRankingRow[], sort: SortKey): PropertyRankingRow[] {
  const copy = rows.slice();
  switch (sort) {
    case "views":
      return copy.sort((a, b) => b.views - a.views);
    case "contacts":
      return copy.sort((a, b) => b.contacts - a.contacts || b.views - a.views);
    case "conversion":
      return copy
        .filter((r) => r.views >= 5)
        .sort((a, b) => {
          const ra = a.contacts / a.views;
          const rb = b.contacts / b.views;
          return rb - ra;
        });
    case "favorites":
      return copy.sort((a, b) => b.favorites - a.favorites);
    case "time":
      return copy.sort((a, b) => b.avg_time_seconds - a.avg_time_seconds);
    default:
      return copy;
  }
}

function formatTime(sec: number): string {
  const s = Math.round(sec);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}
