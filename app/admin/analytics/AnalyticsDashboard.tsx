"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Metric,
  Text,
  AreaChart,
  BarChart,
  BarList,
  DonutChart,
  Title,
  Grid,
  Tab,
  TabGroup,
  TabList,
  Badge,
} from "@tremor/react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus, Users } from "lucide-react";
import type {
  OverviewStats,
  DailyPoint,
  TopItem,
  PropertyViewStat,
} from "@/lib/analytics-db";

interface OverviewWithDelta extends OverviewStats {
  delta: { visitors: number; sessions: number; pageviews: number };
}

interface Props {
  days: number;
  overview: OverviewWithDelta;
  daily: DailyPoint[];
  topPaths: TopItem[];
  topReferrers: TopItem[];
  devices: TopItem[];
  topProperties: PropertyViewStat[];
  countries: TopItem[];
  topSearches: TopItem[];
  scrollDist: { bucket: number; reach: number }[];
  contactDist: TopItem[];
  hourly: { hour: number; pageviews: number }[];
}

const RANGES: { label: string; days: number }[] = [
  { label: "24 hs", days: 1 },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

const CONTACT_LABEL: Record<string, string> = {
  wpp: "WhatsApp",
  phone: "Teléfono",
  email: "Email",
  otro: "Otro",
};

export default function AnalyticsDashboard({
  days,
  overview,
  daily,
  topPaths,
  topReferrers,
  devices,
  topProperties,
  countries,
  topSearches,
  scrollDist,
  contactDist,
  hourly,
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
      {/* Header + selector de rango */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Métricas del sitio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visitas anónimas · sin cookies · datos en vivo desde nuestra DB.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/admin/analytics/sessions?days=${days}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy text-white px-3 py-2 text-xs font-semibold hover:bg-navy-700 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            Ver sesiones
          </Link>
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
      </div>

      {/* KPIs con delta */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-5">
        <KpiCard
          label="Visitantes únicos"
          value={overview.visitors}
          delta={overview.delta.visitors}
        />
        <KpiCard
          label="Sesiones"
          value={overview.sessions}
          delta={overview.delta.sessions}
        />
        <KpiCard
          label="Pageviews"
          value={overview.pageviews}
          delta={overview.delta.pageviews}
        />
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
          valueFormatter={(n: number) => Intl.NumberFormat("es-AR").format(n)}
          showLegend
          showGridLines
          curveType="monotone"
        />
      </Card>

      {/* Hourly heatmap */}
      <Card>
        <Title>Tráfico por hora del día</Title>
        <Text className="mt-1">
          Promedio sobre el período · zona horaria Argentina
        </Text>
        <BarChart
          className="mt-4 h-56"
          data={hourly.map((h) => ({
            hora: `${String(h.hour).padStart(2, "0")}h`,
            pageviews: h.pageviews,
          }))}
          index="hora"
          categories={["pageviews"]}
          colors={["pink"]}
          valueFormatter={(n: number) => Intl.NumberFormat("es-AR").format(n)}
          showLegend={false}
          showGridLines
        />
      </Card>

      {/* Top paths + referrers */}
      <Grid numItemsLg={2} className="gap-5">
        <Card>
          <Title>Páginas más visitadas</Title>
          <BarList
            className="mt-4"
            data={topPaths.map((t) => ({ name: t.key, value: t.count }))}
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

      {/* Device + Países */}
      <Grid numItemsLg={2} className="gap-5">
        <Card>
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
        <Card>
          <Title>País</Title>
          {countries.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400 italic">
              Sin data de geolocalización todavía. La info viene de los
              headers de Vercel · sólo aparece en producción.
            </p>
          ) : (
            <BarList
              className="mt-4"
              data={countries.map((c) => ({
                name: countryName(c.key),
                value: c.count,
              }))}
              color="emerald"
              valueFormatter={(n: number) =>
                Intl.NumberFormat("es-AR").format(n)
              }
            />
          )}
        </Card>
      </Grid>

      {/* Top propiedades */}
      <Card>
        <Title>Top propiedades vistas</Title>
        <Text className="mt-1">Vistas vs contactos generados · ratio de conversión</Text>
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
                  <tr
                    key={p.property_id}
                    className="border-t border-gray-100"
                  >
                    <td className="py-2 font-mono-price text-navy">
                      <a
                        href={`/propiedad/${p.property_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-magenta"
                      >
                        RUS{p.property_id}
                      </a>
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

      {/* Búsquedas + Contact channels */}
      <Grid numItemsLg={2} className="gap-5">
        <Card>
          <Title>Búsquedas más frecuentes</Title>
          <Text className="mt-1">Lo que escriben en la barra de búsqueda</Text>
          {topSearches.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400 italic">
              Aún nadie usó el buscador.
            </p>
          ) : (
            <BarList
              className="mt-4"
              data={topSearches.map((s) => ({ name: s.key, value: s.count }))}
              color="amber"
              valueFormatter={(n: number) =>
                Intl.NumberFormat("es-AR").format(n)
              }
            />
          )}
        </Card>
        <Card>
          <Title>Por dónde contactan</Title>
          <Text className="mt-1">WhatsApp / teléfono / email</Text>
          {contactDist.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400 italic">
              Sin contactos todavía.
            </p>
          ) : (
            <DonutChart
              className="mt-4 h-44"
              data={contactDist.map((c) => ({
                name: CONTACT_LABEL[c.key] ?? c.key,
                value: c.count,
              }))}
              category="value"
              index="name"
              colors={["emerald", "indigo", "amber"]}
              valueFormatter={(n: number) =>
                Intl.NumberFormat("es-AR").format(n)
              }
            />
          )}
        </Card>
      </Grid>

      {/* Scroll depth */}
      <Card>
        <Title>Hasta dónde llegan scrolleando</Title>
        <Text className="mt-1">
          Porcentaje de visitas que llega a cada profundidad
        </Text>
        {scrollDist.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400 italic">
            Aún sin data de scroll · acumula a medida que la gente navega.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {scrollDist.map((s) => (
              <div key={s.bucket}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono-price tabular-nums text-navy font-semibold">
                    {s.bucket}%
                  </span>
                  <span className="font-mono-price tabular-nums text-gray-500">
                    {s.reach}% llega
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-magenta to-magenta-600 rounded-full transition-all"
                    style={{ width: `${s.reach}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <Title>Estamos en Fase 3 de 5</Title>
        <Text className="mt-1">
          Próxima fase: explorador de sesiones — vas a poder entrar a una
          sesión específica y ver el recorrido completo paso a paso (qué páginas,
          en qué orden, cuánto tiempo, si contactó). Después: funnels de
          conversión y exportación a CSV.
        </Text>
      </Card>
    </div>
  );
}

// ── Subcomponentes ─────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: number | string;
  delta?: number;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Text>{label}</Text>
        {delta !== undefined && <DeltaBadge value={delta} />}
      </div>
      <Metric>
        {typeof value === "number"
          ? Intl.NumberFormat("es-AR").format(value)
          : value}
      </Metric>
    </Card>
  );
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <Badge color="gray" icon={Minus} size="xs">
        igual
      </Badge>
    );
  }
  if (value > 0) {
    return (
      <Badge color="emerald" icon={ArrowUp} size="xs">
        +{value}%
      </Badge>
    );
  }
  return (
    <Badge color="rose" icon={ArrowDown} size="xs">
      {value}%
    </Badge>
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

const COUNTRY_NAMES: Record<string, string> = {
  AR: "🇦🇷 Argentina",
  US: "🇺🇸 Estados Unidos",
  ES: "🇪🇸 España",
  UY: "🇺🇾 Uruguay",
  CL: "🇨🇱 Chile",
  BR: "🇧🇷 Brasil",
  MX: "🇲🇽 México",
  PY: "🇵🇾 Paraguay",
};
function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}
