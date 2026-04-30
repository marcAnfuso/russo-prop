import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Smartphone, Monitor, Tablet, MessageCircle, ChevronRight } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listSessions, countSessions, type SessionRow } from "@/lib/analytics-db";
import AdminLogin from "../../AdminLogin";

const PAGE_SIZE = 25;

export const metadata: Metadata = {
  title: "Sesiones · Analytics",
  description: "Sesiones recientes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ days?: string; contacted?: string; page?: string }>;
}

export default async function SessionsPage({ searchParams }: PageProps) {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const { days: daysParam, contacted, page: pageParam } = await searchParams;
  const days = (() => {
    const n = Number(daysParam);
    return Number.isFinite(n) && n > 0 && n <= 365 ? n : 7;
  })();
  const onlyContacted = contacted === "1";
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [sessions, total] = await Promise.all([
    listSessions(days, { limit: PAGE_SIZE, offset, onlyContacted }),
    countSessions(days, { onlyContacted }),
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
              Sesiones
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Sesiones recientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Últimos {days} días · {total} {total === 1 ? "sesión" : "sesiones"}
            {onlyContacted ? " que contactaron" : ""}
            {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/analytics/sessions?days=${days}`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !onlyContacted
                ? "bg-magenta text-white"
                : "bg-white border border-gray-200 text-navy hover:border-magenta"
            }`}
          >
            Todas
          </Link>
          <Link
            href={`/admin/analytics/sessions?days=${days}&contacted=1`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              onlyContacted
                ? "bg-magenta text-white"
                : "bg-white border border-gray-200 text-navy hover:border-magenta"
            }`}
          >
            Sólo las que contactaron
          </Link>
          <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
            {[1, 7, 30, 90].map((d) => {
              const active = d === days;
              const params = new URLSearchParams();
              params.set("days", String(d));
              if (onlyContacted) params.set("contacted", "1");
              return (
                <Link
                  key={d}
                  href={`/admin/analytics/sessions?${params.toString()}`}
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

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            No hay sesiones en este rango
            {onlyContacted ? " con contactos" : ""}.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Cuándo</th>
                  <th className="text-left px-4 py-3 font-semibold">Visitante</th>
                  <th className="text-left px-4 py-3 font-semibold">Origen</th>
                  <th className="text-right px-4 py-3 font-semibold">Páginas</th>
                  <th className="text-right px-4 py-3 font-semibold">Eventos</th>
                  <th className="text-right px-4 py-3 font-semibold">Duración</th>
                  <th className="text-center px-4 py-3 font-semibold">Contactó</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <SessionRowItem key={s.id} session={s} />
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
              if (onlyContacted) params.set("contacted", "1");
              if (p > 1) params.set("page", String(p));
              return `/admin/analytics/sessions?${params.toString()}`;
            }}
          />
        )}
      </div>
    </main>
  );
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
  // Mostrar 5 páginas alrededor de la actual: 1 ... 4 5 [6] 7 8 ... 20
  const pages: (number | "…")[] = [];
  const window = 1;
  const add = (n: number | "…") => pages.push(n);
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      add(i);
    } else if (
      (i === page - window - 1 && page - window > 2) ||
      (i === page + window + 1 && page + window < totalPages - 1)
    ) {
      add("…");
    }
  }

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-1.5 flex-wrap"
    >
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
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-gray-400 text-xs"
            aria-hidden
          >
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

function SessionRowItem({ session: s }: { session: SessionRow }) {
  const start = new Date(s.first_seen);
  const end = new Date(s.last_seen);
  const durSec = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  const dur = formatDuration(durSec);
  const href = `/admin/analytics/sessions/${s.id}`;

  // Cell wrapper · cada celda es un Link con padding propio. Mantenemos
  // las celdas como td pero el contenido es un link para que toda la
  // fila sea efectivamente clickeable (hover + cursor-pointer + chevron
  // al final). Más prolijo que un <tr onClick> y respeta semántica.
  const cellCls =
    "block px-4 py-3 -mx-4 -my-3 group-hover:bg-magenta-50/40 transition-colors";

  return (
    <tr className="border-t border-gray-100 group cursor-pointer">
      <td className="px-4 py-3 align-middle">
        <Link href={href} className={`${cellCls} text-magenta font-mono-price text-xs group-hover:text-magenta`}>
          {formatDate(start)}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle">
        <Link href={href} className={cellCls}>
          <div className="flex items-center gap-2">
            <DeviceIcon device={s.device} />
            <div className="text-xs">
              <p className="font-mono text-gray-500 truncate max-w-[120px]">
                {s.visitor_id.slice(0, 8)}…
              </p>
              <p className="text-gray-400 text-[10px]">
                {s.browser} · {s.os}
              </p>
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 align-middle">
        <Link href={href} className={`${cellCls} text-xs`}>
          <div className="text-navy">
            {s.country ? `${s.country}${s.city ? ` · ${s.city}` : ""}` : "?"}
          </div>
          <div className="text-gray-400 truncate max-w-[200px]">
            {shortReferrer(s.referrer)}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link href={href} className={`${cellCls} text-right tabular-nums`}>
          {s.pageview_count}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link href={href} className={`${cellCls} text-right tabular-nums text-gray-500`}>
          {s.event_count}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link href={href} className={`${cellCls} text-right tabular-nums text-gray-500`}>
          {dur}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-center">
        <Link href={href} className={`${cellCls} text-center`}>
          {s.contacted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
              <MessageCircle className="h-3 w-3" />
              Sí
            </span>
          ) : (
            <span className="text-gray-300 text-[10px]">—</span>
          )}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link
          href={href}
          className={`${cellCls} text-gray-300 group-hover:text-magenta`}
          aria-label="Ver detalle"
        >
          <ChevronRight className="h-4 w-4 inline-block" />
        </Link>
      </td>
    </tr>
  );
}

function DeviceIcon({ device }: { device: string | null }) {
  const cls = "h-4 w-4 text-gray-400";
  if (device === "mobile") return <Smartphone className={cls} />;
  if (device === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function formatDate(d: Date): string {
  // Forzamos zona horaria Argentina · sino Vercel renderiza en UTC.
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function shortReferrer(raw: string | null): string {
  if (!raw) return "Directo";
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return raw.length > 30 ? raw.slice(0, 27) + "…" : raw;
  }
}
