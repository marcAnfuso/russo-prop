import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  MessageCircle,
  Mail,
  Phone,
  Smartphone,
  Monitor,
  Tablet,
  ChevronRight,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  listContactClicks,
  countContactClicks,
  getContactSummary,
  type ContactClickRow,
} from "@/lib/analytics-db";
import AdminLogin from "../../AdminLogin";

const PAGE_SIZE = 40;

export const metadata: Metadata = {
  title: "Contactos · Analytics",
  description: "Contactos por WhatsApp / mail / teléfono",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ days?: string; page?: string }>;
}

export default async function ContactosPage({ searchParams }: PageProps) {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const { days: daysParam, page: pageParam } = await searchParams;
  const days = (() => {
    const n = Number(daysParam);
    // Default 90d: la mayoría del histórico de contactos es previo al apagón
    // de analytics (>30d), así que 30d se veía casi vacío al abrir.
    return Number.isFinite(n) && n > 0 && n <= 365 ? n : 90;
  })();
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, total, summary] = await Promise.all([
    listContactClicks(days, { limit: PAGE_SIZE, offset }),
    countContactClicks(days),
    getContactSummary(days),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
              Contactos
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy">
              Contactos iniciados
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Últimos {days} días · {total} {total === 1 ? "contacto" : "contactos"}
              {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
            </p>
          </div>
          {/* Rango */}
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
            {[1, 7, 30, 90].map((d) => {
              const active = d === days;
              return (
                <Link
                  key={d}
                  href={`/admin/analytics/contactos?days=${d}`}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    active ? "bg-magenta text-white" : "text-navy hover:bg-gray-50"
                  }`}
                >
                  {d === 1 ? "24hs" : `${d}d`}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tiles por canal */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryTile label="Total" value={summary.total} icon={<BarChart3 className="h-4 w-4" />} accent />
          <SummaryTile label="WhatsApp" value={summary.wpp} icon={<MessageCircle className="h-4 w-4" />} />
          <SummaryTile label="Mail" value={summary.email} icon={<Mail className="h-4 w-4" />} />
          <SummaryTile label="Teléfono" value={summary.phone} icon={<Phone className="h-4 w-4" />} />
        </div>

        {/* Nota sobre identidad */}
        <p className="text-xs text-gray-400 leading-relaxed">
          Un click a WhatsApp/mail no registra el nombre de la persona (eso lo ves
          en tu bandeja de WhatsApp, o en <Link href="/admin/leads" className="text-magenta hover:underline">Leads</Link> si
          dejaron un formulario). Acá ves cuántos, cuándo, por qué canal y qué
          estaban mirando — para cruzarlo con tus chats.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            No hay contactos en este rango.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Cuándo</th>
                  <th className="text-left px-4 py-3 font-semibold">Canal</th>
                  <th className="text-left px-4 py-3 font-semibold">Qué miraba</th>
                  <th className="text-left px-4 py-3 font-semibold">Origen</th>
                  <th className="text-left px-4 py-3 font-semibold">Visitante</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <ContactRowItem key={`${r.session_id}-${r.ts}-${i}`} row={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => {
              const params = new URLSearchParams();
              params.set("days", String(days));
              if (p > 1) params.set("page", String(p));
              return `/admin/analytics/contactos?${params.toString()}`;
            }}
          />
        )}
      </div>
    </main>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-magenta bg-magenta-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${accent ? "text-magenta" : "text-gray-500"}`}>
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-navy tabular-nums">{value}</p>
    </div>
  );
}

function ContactRowItem({ row: r }: { row: ContactClickRow }) {
  const when = new Date(r.ts);
  const sessionHref = `/admin/analytics/sessions/${r.session_id}`;

  return (
    <tr className="border-t border-gray-100 hover:bg-magenta-50/30 transition-colors">
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <span className="text-magenta font-mono-price text-xs">{formatDate(when)}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <ChannelBadge channel={r.channel} />
      </td>
      <td className="px-4 py-3 align-middle">
        {r.property_id ? (
          <Link
            href={`/propiedad/${r.property_id}`}
            className="text-navy font-semibold hover:text-magenta transition-colors"
          >
            RUS{r.property_id}
          </Link>
        ) : (
          <span className="text-gray-600 text-xs">{prettyPath(r.path)}</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2 text-xs">
          <DeviceIcon device={r.device} />
          <span className="text-navy">
            {r.city ? r.city : r.country ? r.country : "—"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <Link
          href={sessionHref}
          className="font-mono text-gray-500 text-xs hover:text-magenta transition-colors"
        >
          {r.visitor_id.slice(0, 8)}…
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link
          href={sessionHref}
          className="text-gray-300 hover:text-magenta transition-colors"
          aria-label="Ver sesión"
        >
          <ChevronRight className="h-4 w-4 inline-block" />
        </Link>
      </td>
    </tr>
  );
}

function ChannelBadge({ channel }: { channel: string | null }) {
  if (channel === "wpp") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-bold">
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </span>
    );
  }
  if (channel === "email") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-bold">
        <Mail className="h-3 w-3" /> Mail
      </span>
    );
  }
  if (channel === "phone") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-bold">
        <Phone className="h-3 w-3" /> Teléfono
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">{channel ?? "—"}</span>;
}

function DeviceIcon({ device }: { device: string | null }) {
  const cls = "h-4 w-4 text-gray-400 flex-shrink-0";
  if (device === "mobile") return <Smartphone className={cls} />;
  if (device === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function prettyPath(path: string | null): string {
  if (!path) return "—";
  try {
    const [base, query] = path.split("?");
    if (!query) return base;
    const p = new URLSearchParams(query);
    const bits: string[] = [];
    const type = p.get("type");
    const zones = p.get("zones");
    const q = p.get("q");
    if (type) bits.push(type);
    if (zones) bits.push(zones.replace(/\+/g, " "));
    if (q) bits.push(`"${q}"`);
    return bits.length ? `${base} · ${bits.join(" · ")}` : base;
  } catch {
    return path.length > 40 ? path.slice(0, 37) + "…" : path;
  }
}

function formatDate(d: Date): string {
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const pages: (number | "…")[] = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
      pages.push(i);
    } else if (
      (i === page - window - 1 && page - window > 2) ||
      (i === page + window + 1 && page + window < totalPages - 1)
    ) {
      pages.push("…");
    }
  }
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1.5 flex-wrap">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          page === 1
            ? "bg-gray-100 text-gray-300 pointer-events-none"
            : "bg-white border border-gray-200 text-navy hover:border-magenta hover:text-magenta"
        }`}
      >
        ← Anterior
      </Link>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-gray-400 text-xs" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`inline-flex items-center justify-center min-w-[34px] rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              p === page
                ? "bg-magenta text-white shadow-sm"
                : "bg-white border border-gray-200 text-navy hover:border-magenta hover:text-magenta"
            }`}
          >
            {p}
          </Link>
        )
      )}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          page === totalPages
            ? "bg-gray-100 text-gray-300 pointer-events-none"
            : "bg-white border border-gray-200 text-navy hover:border-magenta hover:text-magenta"
        }`}
      >
        Siguiente →
      </Link>
    </nav>
  );
}
