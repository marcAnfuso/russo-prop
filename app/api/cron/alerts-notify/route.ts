import { NextRequest, NextResponse } from "next/server";
import { listActiveAlerts, recordNotification, type Alert } from "@/lib/alerts-db";
import { matchesCriterion } from "@/lib/alerts-matcher";
import { sendMatchDigestEmail, type AlertMatchedProperty } from "@/lib/alerts-email";
import { fetchAllProperties } from "@/lib/xintel";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron diario: matchea propiedades nuevas vs alertas activas y envía
 * digest. Vercel lo dispara via vercel.json `crons:`. Soporta también
 * disparo manual con header Authorization: Bearer ${CRON_SECRET}.
 */
export async function GET(req: NextRequest) {
  // Vercel pasa header `x-vercel-cron: 1` en sus crons internos. Para
  // dispararlo manualmente desde admin/scripts, requerimos CRON_SECRET.
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const validSecret = secret && auth === `Bearer ${secret}`;

  if (!isVercelCron && !validSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const summary = {
    alerts: 0,
    matched: 0,
    notified: 0,
    errors: 0,
    skipped: 0,
  };

  try {
    const [alerts, ventas, alquileres] = await Promise.all([
      listActiveAlerts(),
      fetchAllProperties("venta"),
      fetchAllProperties("alquiler"),
    ]);
    const allProps = [...ventas, ...alquileres];
    const byId = new Map(allProps.map((p) => [p.id, p]));
    summary.alerts = alerts.length;

    for (const alert of alerts) {
      try {
        const matches = await processAlert(alert, allProps);
        if (matches.length > 0) {
          summary.matched += matches.length;
          // Build digest payload
          const digestData: AlertMatchedProperty[] = matches.map((p) => ({
            id: p.id,
            code: p.code,
            title: p.title,
            address: p.address,
            locality: p.locality,
            price: p.price,
            currency: p.currency,
            operation: p.operation,
            image: p.images[0] ?? null,
          }));
          await sendMatchDigestEmail(alert, digestData);
          await recordNotification(
            alert.id,
            matches.map((m) => m.id)
          );
          summary.notified++;
        } else {
          summary.skipped++;
        }
      } catch (err) {
        summary.errors++;
        console.error(`[alerts-cron] alert ${alert.id} error:`, err);
      }
    }

    // Silenciamos el lookup de byId (sólo lo usaríamos si quisiéramos
    // enriquecer en el futuro).
    void byId;

    const tookMs = Date.now() - start;
    return NextResponse.json({ ok: true, took_ms: tookMs, ...summary });
  } catch (err) {
    console.error("[alerts-cron] fatal error:", err);
    return NextResponse.json(
      { ok: false, error: "fatal error", ...summary },
      { status: 500 }
    );
  }
}

/**
 * Para una alerta dada, devuelve las propiedades que matchean su
 * criterion Y que aún no fueron notificadas (no están en notified_ids).
 */
async function processAlert(
  alert: Alert,
  allProps: import("@/data/types").Property[]
): Promise<import("@/data/types").Property[]> {
  const alreadySent = new Set(alert.notified_ids ?? []);
  const matches = allProps.filter(
    (p) => !alreadySent.has(p.id) && matchesCriterion(p, alert.criterion)
  );
  // Si es la primera vez que la alerta corre (notified_ids vacío),
  // marcamos todas como ya notificadas SIN mandar email — la alerta
  // empieza "limpia" desde su creación. Esto evita inundar al usuario
  // recién suscripto con 200 propiedades existentes.
  if (alreadySent.size === 0 && alert.last_notified_at == null) {
    if (matches.length > 0) {
      await recordNotification(
        alert.id,
        matches.map((m) => m.id)
      );
    }
    return [];
  }
  return matches;
}
