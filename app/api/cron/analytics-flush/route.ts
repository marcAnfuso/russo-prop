import { NextRequest, NextResponse } from "next/server";
import { vaciarCola, colaDisponible } from "@/lib/analytics-queue";
import { invalidarLecturasDB } from "@/lib/db-cache";

/**
 * Vacía la cola de analítica en la base, en lote.
 *
 * Vercel lo llama cada hora en punto (vercel.json). De 00:00 a 07:59 hora
 * de Argentina no hace nada: la idea es que la base duerma de noche y lo
 * que se juntó entre en el lote de las 08:00.
 *
 * El de las 08:00 además refresca las lecturas cacheadas de la base (ver
 * lib/db-cache.ts): no vencen solas, así que una vez por día se tiran por
 * las dudas, en un momento en que la base ya está despierta.
 *
 * Auth igual que los otros crons: Authorization: Bearer <CRON_SECRET>.
 * A mano: ?token=<CRON_SECRET>&force=1 vacía aunque sea de madrugada.
 */
const INICIO_DIA = 8; // hora AR del primer vaciado

function horaArgentina(d = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "numeric",
      hourCycle: "h23",
    }).format(d)
  );
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET env var not set" }, { status: 500 });
  }
  const urlToken = req.nextUrl.searchParams.get("token");
  const autorizado =
    req.headers.get("authorization") === `Bearer ${secret}` || urlToken === secret;
  if (!autorizado) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const hora = horaArgentina();
  const forzado = req.nextUrl.searchParams.get("force") === "1";
  if (hora < INICIO_DIA && !forzado) {
    return NextResponse.json({ ok: true, omitido: "madrugada", hora });
  }

  if (!colaDisponible()) {
    return NextResponse.json({ ok: true, omitido: "sin cola (Redis no configurado)", hora });
  }

  try {
    const res = await vaciarCola();
    if (hora === INICIO_DIA) invalidarLecturasDB();
    return NextResponse.json({ ok: true, hora, ...res });
  } catch (err) {
    // La tanda queda en Redis y la próxima corrida la reintenta.
    console.error("[analytics-flush] error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
