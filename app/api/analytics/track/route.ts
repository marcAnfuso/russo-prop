import { NextRequest, NextResponse } from "next/server";
import {
  insertEvents,
  upsertSession,
  type AnalyticsEvent,
  type EventType,
} from "@/lib/analytics-db";
import {
  parseUserAgent,
  readGeoFromRequest,
  parseUtm,
} from "@/lib/analytics-server";

const VALID_TYPES = new Set<EventType>([
  "pageview",
  "scroll_depth",
  "time_on_page",
  "property_view",
  "image_navigate",
  "quickview_open",
  "contact_click",
  "form_submit",
  "search",
  "filter_change",
  "russia_chat_open",
  "favorite_toggle",
]);

interface IngestPayload {
  visitor_id?: string;
  session_id?: string;
  referrer?: string;
  landing_url?: string;
  events?: unknown[];
}

/**
 * Endpoint de ingesta. No bloquea — devuelve 204 al toque y procesa
 * el insert async. Si algo falla, lo silenciamos para no impactar
 * al cliente.
 */
export async function POST(req: NextRequest) {
  let body: IngestPayload;
  try {
    body = (await req.json()) as IngestPayload;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const visitor_id = typeof body.visitor_id === "string" ? body.visitor_id : "";
  const session_id = typeof body.session_id === "string" ? body.session_id : "";
  if (!visitor_id || !session_id) {
    return new NextResponse(null, { status: 204 });
  }

  // Validar/sanitizar eventos
  const events: AnalyticsEvent[] = Array.isArray(body.events)
    ? body.events
        .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
        .map((e): AnalyticsEvent | null => {
          const type = e.type;
          if (typeof type !== "string" || !VALID_TYPES.has(type as EventType)) return null;
          return {
            type: type as EventType,
            path: typeof e.path === "string" ? e.path.slice(0, 500) : undefined,
            property_id:
              typeof e.property_id === "string"
                ? e.property_id.slice(0, 64)
                : undefined,
            metadata: typeof e.metadata === "object" && e.metadata !== null
              ? (e.metadata as Record<string, unknown>)
              : undefined,
            ts: typeof e.ts === "string" ? e.ts : undefined,
          };
        })
        .filter((e): e is AnalyticsEvent => e !== null)
    : [];

  // Datos de sesión: UA, geo, utm. Sólo se vuelcan si la sesión es nueva
  // (upsertSession sólo pisa los campos faltantes en update).
  const ua = req.headers.get("user-agent");
  const uaInfo = parseUserAgent(ua);
  const geo = readGeoFromRequest(req);
  const utm = parseUtm(body.landing_url);

  // Fire-and-forget: no esperamos a que terminen los inserts antes de
  // devolver 204. Si hay un error, queda en el log de Vercel.
  const ingest = async () => {
    try {
      await upsertSession({
        session_id,
        visitor_id,
        device: uaInfo.device,
        browser: uaInfo.browser,
        os: uaInfo.os,
        country: geo.country,
        city: geo.city,
        referrer: body.referrer || undefined,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        user_agent: ua ?? undefined,
        is_bot: uaInfo.is_bot,
      });
      if (events.length > 0) {
        await insertEvents(visitor_id, session_id, events);
      }
    } catch (err) {
      console.error("[analytics] ingest error:", err);
    }
  };

  // En Vercel runtime, podemos usar waitUntil si está disponible vía
  // `experimental_after`. Por ahora awaiteamos pero el impacto es mínimo
  // (1-2 inserts pequeños) y Neon es rápido.
  await ingest();
  return new NextResponse(null, { status: 204 });
}
