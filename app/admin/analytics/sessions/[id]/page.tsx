import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  ScrollText,
  Clock,
  MousePointerClick,
  MessageCircle,
  Send,
  Search as SearchIcon,
  Heart,
  Bot,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getSession, getSessionEvents } from "@/lib/analytics-db";
import AdminLogin from "../../../AdminLogin";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Sesión · Analytics",
  description: "Detalle de sesión",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EVENT_LABEL: Record<string, string> = {
  pageview: "Visitó página",
  property_view: "Vio propiedad",
  scroll_depth: "Scroll",
  time_on_page: "Tiempo en página",
  contact_click: "Clickeó contacto",
  form_submit: "Envió formulario",
  search: "Hizo búsqueda",
  filter_change: "Cambió filtros",
  russia_chat_open: "Abrió chat Russia",
  image_navigate: "Navegó imágenes",
  quickview_open: "Abrió quick view",
  favorite_toggle: "Marcó favorito",
};

function eventIcon(type: string) {
  const cls = "h-4 w-4";
  switch (type) {
    case "pageview":
      return <Eye className={cls} />;
    case "property_view":
      return <Eye className={`${cls} text-magenta`} />;
    case "scroll_depth":
      return <ScrollText className={cls} />;
    case "time_on_page":
      return <Clock className={cls} />;
    case "contact_click":
      return <MessageCircle className={`${cls} text-emerald-600`} />;
    case "form_submit":
      return <Send className={`${cls} text-emerald-600`} />;
    case "search":
      return <SearchIcon className={cls} />;
    case "filter_change":
      return <Filter className={cls} />;
    case "russia_chat_open":
      return <Bot className={`${cls} text-magenta`} />;
    case "image_navigate":
      return <ImageIcon className={cls} />;
    case "favorite_toggle":
      return <Heart className={cls} />;
    default:
      return <MousePointerClick className={cls} />;
  }
}

export default async function SessionDetailPage({ params }: PageProps) {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  const { id } = await params;
  const [session, events] = await Promise.all([
    getSession(id),
    getSessionEvents(id),
  ]);

  if (!session) notFound();

  const start = new Date(session.first_seen);
  const end = new Date(session.last_seen);
  const durSec = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link
            href="/admin/analytics/sessions"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Sesiones
          </Link>
          <div className="flex items-center gap-2 text-magenta">
            <BarChart3 className="h-4 w-4" />
            <p className="text-[11px] uppercase tracking-widest font-semibold">
              Detalle de sesión
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Resumen de la sesión */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Sesión {session.id.slice(0, 8)}…
              </p>
              <h1 className="font-display text-2xl font-semibold text-navy">
                Visitante {session.visitor_id.slice(0, 8)}…
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {start.toLocaleString("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · duración {formatDuration(durSec)}
              </p>
            </div>
            {session.contacted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-md">
                <MessageCircle className="h-3.5 w-3.5" />
                Contactó
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <KvCard label="Dispositivo" value={
              <span className="inline-flex items-center gap-1.5">
                <DeviceIcon device={session.device} />
                <span className="capitalize">{session.device ?? "?"}</span>
              </span>
            } />
            <KvCard label="Navegador" value={`${session.browser} · ${session.os}`} />
            <KvCard
              label="Ubicación"
              value={
                session.country
                  ? `${session.country}${session.city ? ` · ${session.city}` : ""}`
                  : "?"
              }
            />
            <KvCard label="Origen" value={shortReferrer(session.referrer)} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-4">
            <Stat label="Páginas vistas" value={session.pageview_count} />
            <Stat label="Eventos totales" value={session.event_count} />
            <Stat label="Duración" value={formatDuration(durSec)} />
          </div>
        </div>

        {/* Timeline de eventos */}
        <div>
          <h2 className="font-display text-xl font-semibold text-navy mb-4">
            Línea de tiempo
          </h2>
          <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4">
            {events.map((e, i) => {
              const ts = new Date(e.ts);
              const elapsed = Math.round((ts.getTime() - start.getTime()) / 1000);
              const isImportant =
                e.type === "contact_click" ||
                e.type === "form_submit" ||
                e.type === "russia_chat_open";
              return (
                <li key={e.id} className="pl-6 relative">
                  <span
                    className={`absolute left-0 top-1 -translate-x-1/2 h-3 w-3 rounded-full ring-4 ring-gray-50 ${
                      isImportant ? "bg-emerald-500" : "bg-magenta"
                    }`}
                  />
                  <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-md bg-gray-50 flex items-center justify-center text-navy">
                      {eventIcon(e.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-navy">
                          {EVENT_LABEL[e.type] ?? e.type}
                        </p>
                        <span className="text-[10px] font-mono-price text-gray-400 tabular-nums">
                          +{formatDuration(elapsed)} · paso {i + 1}/{events.length}
                        </span>
                      </div>
                      {e.path && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {e.path}
                        </p>
                      )}
                      {e.property_id && (
                        <Link
                          href={`/propiedad/${e.property_id}`}
                          target="_blank"
                          className="text-xs text-magenta hover:underline font-mono-price"
                        >
                          RUS{e.property_id} ↗
                        </Link>
                      )}
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <pre className="mt-1.5 text-[10px] text-gray-500 bg-gray-50 rounded px-2 py-1 font-mono whitespace-pre-wrap break-all">
                          {JSON.stringify(e.metadata, null, 0)}
                        </pre>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </main>
  );
}

function KvCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <div className="text-navy font-medium">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-navy font-bold text-lg tabular-nums">{value}</p>
    </div>
  );
}

function DeviceIcon({ device }: { device: string | null }) {
  const cls = "h-4 w-4";
  if (device === "mobile") return <Smartphone className={cls} />;
  if (device === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function formatDuration(sec: number): string {
  if (sec === 0) return "—";
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
