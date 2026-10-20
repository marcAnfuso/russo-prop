import { Redis } from "@upstash/redis";
import {
  insertEventsBatch,
  upsertSessionsBatch,
  type AnalyticsEvent,
  type EventBatchRow,
  type SessionBatchRow,
  type SessionInfo,
} from "./analytics-db";

/**
 * Cola de analítica en Redis (Upstash) para que la base duerma.
 *
 * Medido en octubre de 2026: escribir cada evento en el momento tenía a
 * Neon despierta 13-18 h por día (se duerme a los 5 min sin uso y Russo
 * tiene ~1.700 eventos diarios repartidos de la mañana a la noche). Eso,
 * más las lecturas, agotó el plan gratuito el 20/10.
 *
 * Ahora el endpoint de ingesta deja cada pedido en la cola y vuelve; un
 * cron la vacía en la base en lote una vez por hora durante el día
 * (app/api/cron/analytics-flush). De madrugada no se vacía: lo de la noche
 * entra en el lote de las 08:00 y la base duerme.
 *
 * Si Redis no está configurado (local, o antes de crear el store en Vercel)
 * colaDisponible() da false y el endpoint escribe directo como antes.
 */

const COLA = "analytics:cola";
/** Tanda tomada por un vaciado. Si la escritura falla, queda acá para reintentar. */
const PROCESANDO = "analytics:procesando";

export interface IngestItem {
  /** Hora en que llegó el pedido: es la que va a la base, no la del vaciado. */
  received_at: string;
  session: SessionInfo;
  events: AnalyticsEvent[];
}

let cliente: Redis | null | undefined;

function redis(): Redis | null {
  if (cliente !== undefined) return cliente;
  // Vercel inyecta una u otra pareja según cómo se creó el store.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  // Serializamos nosotros: así lo que entra y lo que sale es siempre texto
  // y no depende de las heurísticas de parseo del SDK.
  cliente = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
  return cliente;
}

export function colaDisponible(): boolean {
  return redis() !== null;
}

/** Deja un pedido en la cola. Devuelve false si no pudo (el llamador escribe directo). */
export async function encolar(item: IngestItem): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  try {
    await r.rpush(COLA, JSON.stringify(item));
    return true;
  } catch (err) {
    console.error("[analytics-queue] no se pudo encolar:", err);
    return false;
  }
}

export interface ResultadoVaciado {
  pedidos: number;
  eventos: number;
  sesiones: number;
}

/**
 * Pasa a la base todo lo que haya en la cola, en lote.
 *
 * Primero reintenta una tanda vieja que haya quedado en PROCESANDO (una
 * corrida anterior que falló), después toma la cola actual. RENAME es
 * atómico: lo que llegue mientras escribimos entra en una cola nueva y lo
 * agarra la próxima corrida.
 */
export async function vaciarCola(): Promise<ResultadoVaciado> {
  const r = redis();
  const total: ResultadoVaciado = { pedidos: 0, eventos: 0, sesiones: 0 };
  if (!r) return total;

  for (const reintento of [true, false]) {
    if (!reintento) {
      if (!(await r.exists(COLA))) break;
      await r.rename(COLA, PROCESANDO);
    } else if (!(await r.exists(PROCESANDO))) {
      continue;
    }

    const crudos = (await r.lrange(PROCESANDO, 0, -1)) as string[];
    const items: IngestItem[] = [];
    for (const c of crudos) {
      try {
        items.push(JSON.parse(c) as IngestItem);
      } catch {
        // un pedido corrupto no frena al resto
      }
    }

    const res = await escribirEnLote(items);
    // Sólo se borra si la escritura salió bien; si tiró, la tanda queda
    // en PROCESANDO y la próxima corrida la reintenta.
    await r.del(PROCESANDO);
    total.pedidos += items.length;
    total.eventos += res.eventos;
    total.sesiones += res.sesiones;
  }
  return total;
}

async function escribirEnLote(items: IngestItem[]): Promise<{ eventos: number; sesiones: number }> {
  // Una fila por sesión: un INSERT ... ON CONFLICT no puede tocar dos
  // veces la misma fila en una sola sentencia.
  const sesiones = new Map<string, SessionBatchRow>();
  const eventos: EventBatchRow[] = [];

  for (const it of items) {
    const s = it.session;
    const previa = sesiones.get(s.session_id);
    if (!previa) {
      sesiones.set(s.session_id, { ...s, first_seen: it.received_at, last_seen: it.received_at });
    } else {
      if (it.received_at < previa.first_seen) previa.first_seen = it.received_at;
      if (it.received_at > previa.last_seen) previa.last_seen = it.received_at;
    }
    for (const e of it.events) {
      eventos.push({
        ...e,
        session_id: s.session_id,
        visitor_id: s.visitor_id,
        ts: e.ts ?? it.received_at,
      });
    }
  }

  // Sesiones primero: el dashboard cruza eventos con sesiones.
  await upsertSessionsBatch([...sesiones.values()]);
  await insertEventsBatch(eventos);
  return { eventos: eventos.length, sesiones: sesiones.size };
}
