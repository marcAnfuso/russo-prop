"use client";

// Tracker liviano del lado del cliente. No usa cookies — visitor_id en
// localStorage (estable), session_id en sessionStorage (se renueva al
// abrir una pestaña nueva o tras 30min de inactividad). Eventos en
// buffer y se mandan en batch con sendBeacon (sobrevive a navigations).

const VISITOR_KEY = "russo_av";   // "analytics visitor"
const SESSION_KEY = "russo_as";   // "analytics session"
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const FLUSH_INTERVAL_MS = 4000;
const BATCH_MAX = 20;
const TRACK_URL = "/api/analytics/track";

interface QueuedEvent {
  type: string;
  path?: string;
  property_id?: string;
  metadata?: Record<string, unknown>;
  ts: string;
}

interface SessionStored {
  id: string;
  expires_at: number;
}

let queue: QueuedEvent[] = [];
let flushTimer: number | null = null;
let installed = false;

function uuid(): string {
  // RFC4122 v4 — sin dependencias externas
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const s = JSON.parse(raw) as SessionStored;
      if (s.expires_at > Date.now()) {
        // Refresh expiration
        s.expires_at = Date.now() + SESSION_TIMEOUT_MS;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
        return s.id;
      }
    } catch {
      // ignore
    }
  }
  const id = uuid();
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ id, expires_at: Date.now() + SESSION_TIMEOUT_MS } as SessionStored)
  );
  return id;
}

function shouldRespectDNT(): boolean {
  if (typeof navigator === "undefined") return false;
  // @ts-expect-error legacy
  const dnt = navigator.doNotTrack || window.doNotTrack;
  return dnt === "1" || dnt === "yes";
}

function buildPayload() {
  return {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    referrer: typeof document !== "undefined" ? document.referrer : "",
    landing_url: typeof window !== "undefined" ? window.location.href : "",
    events: queue,
  };
}

function flush(syncBeacon = false): void {
  if (queue.length === 0) return;
  const payload = buildPayload();
  queue = [];

  const body = JSON.stringify(payload);
  if (syncBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(TRACK_URL, blob);
    return;
  }
  fetch(TRACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // silencioso · si falla, no jodemos al usuario
  });
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flush(false);
  }, FLUSH_INTERVAL_MS);
}

export function track(
  type: string,
  data?: { path?: string; property_id?: string; metadata?: Record<string, unknown> }
): void {
  if (typeof window === "undefined") return;
  if (shouldRespectDNT()) return;
  queue.push({
    type,
    path: data?.path ?? window.location.pathname + window.location.search,
    property_id: data?.property_id,
    metadata: data?.metadata,
    ts: new Date().toISOString(),
  });
  if (queue.length >= BATCH_MAX) {
    flush(false);
  } else {
    scheduleFlush();
  }
}

export function flushNow(): void {
  flush(true);
}

/**
 * Setup global · sólo se corre una vez. Captura page hide / unload para
 * mandar eventos pendientes via sendBeacon antes de que se cierre la
 * pestaña.
 */
export function installAnalytics(): void {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  // Flush al ocultarse la pestaña (mejor que beforeunload en mobile)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));
}
