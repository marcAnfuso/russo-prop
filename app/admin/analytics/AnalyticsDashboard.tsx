"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Metric,
  Text,
  AreaChart,
  BarList,
  DonutChart,
  Flex,
  Title,
  Grid,
  Tab,
  TabGroup,
  TabList,
} from "@tremor/react";
import type {
  OverviewStats,
  DailyPoint,
  TopItem,
  PropertyViewStat,
} from "@/lib/analytics-db";

interface Props {
  days: number;
  overview: OverviewStats;
  daily: DailyPoint[];
  topPaths: TopItem[];
  topReferrers: TopItem[];
  devices: TopItem[];
  topProperties: PropertyViewStat[];
}

const RANGES: { label: string; days: number }[] = [
  { label: "24 hs", days: 1 },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

export default function AnalyticsDashboard({
  days,
  overview,
  daily,
  topPaths,
  topReferrers,
  devices,
  topProperties,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(d: number) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("days", String(d));
    router.push(`/admin/analytics?${params.toString()}`);
  }

  const currentTabIndex = Math.max(
    0,
    RANGES.findIndex((r) => r.days === days)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Métricas del sitio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visitas anónimas · sin cookies · datos en vivo desde nuestra DB.
          </p>
        </div>
        <TabGroup
          index={currentTabIndex >= 0 ? currentTabIndex : 1}
          onIndexChange={(i) => setRange(RANGES[i].days)}
        >
          <TabList variant="solid">
            {RANGES.map((r) => (
              <Tab key={r.days}>{r.label}</Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>

      {/* KPIs */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-5">
        <KpiCard label="Visitantes únicos" value={overview.visitors} />
        <KpiCard label="Sesiones" value={overview.sessions} />
        <KpiCard label="Pageviews" value={overview.pageviews} />
        <KpiCard
          label="Duración promedio"
          value={`${overview.avgSessionMinutes} min`}
        />
      </Grid>

      {/* Timeline diario */}
      <Card>
        <Title>Visitantes y pageviews por día</Title>
        <Text className="mt-1">Tendencia de los últimos {days} días</Text>
        <AreaChart
          className="mt-4 h-72"
          data={daily}
          index="day"
          categories={["pageviews", "visitors"]}
          colors={["pink", "indigo"]}
          valueFormatter={(n) => Intl.NumberFormat("es-AR").format(n)}
          showLegend
          showGridLines
          curveType="monotone"
        />
      </Card>

      {/* Top paths + referrers */}
      <Grid numItemsLg={2} className="gap-5">
        <Card>
          <Title>Páginas más visitadas</Title>
          <BarList
            className="mt-4"
            data={topPaths.map((t) => ({
              name: t.key,
              value: t.count,
            }))}
            color="pink"
            valueFormatter={(n: number) => Intl.NumberFormat("es-AR").format(n)}
          />
        </Card>
        <Card>
          <Title>Cómo llegan al sitio</Title>
          <BarList
            className="mt-4"
            data={topReferrers.map((t) => ({
              name: shortReferrer(t.key),
              value: t.count,
            }))}
            color="indigo"
            valueFormatter={(n: number) => Intl.NumberFormat("es-AR").format(n)}
          />
        </Card>
      </Grid>

      {/* Device + Top propiedades */}
      <Grid numItemsLg={3} className="gap-5">
        <Card className="lg:col-span-1">
          <Title>Dispositivo</Title>
          <DonutChart
            className="mt-4 h-56"
            data={devices.map((d) => ({ name: d.key, value: d.count }))}
            category="value"
            index="name"
            colors={["pink", "indigo", "amber", "emerald"]}
            valueFormatter={(n: number) => Intl.NumberFormat("es-AR").format(n)}
          />
        </Card>
        <Card className="lg:col-span-2">
          <Title>Top propiedades vistas</Title>
          <Text className="mt-1">Vistas vs contactos generados</Text>
          {topProperties.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400 italic">
              Sin data todavía · esperá que alguien entre a alguna propiedad.
            </p>
          ) : (
            <table className="w-full mt-4 text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left py-2">Propiedad</th>
                  <th className="text-right py-2">Vistas</th>
                  <th className="text-right py-2">Contactos</th>
                  <th className="text-right py-2">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((p) => {
                  const pct = p.views > 0 ? (p.contacts / p.views) * 100 : 0;
                  return (
                    <tr key={p.property_id} className="border-t border-gray-100">
                      <td className="py-2 font-mono-price text-navy">
                        RUS{p.property_id}
                      </td>
                      <td className="text-right py-2 tabular-nums">{p.views}</td>
                      <td className="text-right py-2 tabular-nums">{p.contacts}</td>
                      <td className="text-right py-2 tabular-nums text-magenta font-semibold">
                        {pct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </Grid>

      <Card>
        <Flex>
          <div>
            <Title>Estamos en Fase 1 de 5</Title>
            <Text className="mt-1">
              Ya estamos capturando pageviews. En la próxima fase sumamos
              scroll, tiempo en página y clicks en botones clave (WhatsApp,
              llamar, email). Después: explorador de sesiones y funnels de
              conversión.
            </Text>
          </div>
        </Flex>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <Text>{label}</Text>
      <Metric>
        {typeof value === "number"
          ? Intl.NumberFormat("es-AR").format(value)
          : value}
      </Metric>
    </Card>
  );
}

function shortReferrer(raw: string): string {
  if (raw === "directo") return "Directo / app";
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return raw.length > 40 ? raw.slice(0, 37) + "…" : raw;
  }
}
