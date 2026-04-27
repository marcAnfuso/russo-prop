import type { NextRequest } from "next/server";

// ── User-agent classifier liviano (sin lib externa) ─────────────────────
const BOT_PATTERNS = [
  /bot/i, /spider/i, /crawler/i, /preview/i, /scrape/i, /lighthouse/i,
  /headless/i, /phantom/i, /puppeteer/i, /selenium/i, /facebookexternalhit/i,
  /telegrambot/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i, /slackbot/i,
  /pingdom/i, /uptimerobot/i, /datadog/i,
];

export interface UAInfo {
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  is_bot: boolean;
}

export function parseUserAgent(ua: string | null | undefined): UAInfo {
  const s = ua ?? "";
  const is_bot = BOT_PATTERNS.some((re) => re.test(s));

  // Device
  let device: UAInfo["device"] = "desktop";
  if (/tablet|iPad|Nexus 7|Nexus 10/i.test(s)) device = "tablet";
  else if (/Mobi|Android.*Mobile|iPhone|iPod|BlackBerry|Windows Phone/i.test(s)) device = "mobile";

  // Browser
  let browser = "otro";
  if (/Edg\//.test(s)) browser = "Edge";
  else if (/OPR\//.test(s) || /Opera/.test(s)) browser = "Opera";
  else if (/Chrome\//.test(s)) browser = "Chrome";
  else if (/Firefox\//.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s)) browser = "Safari";

  // OS
  let os = "otro";
  if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Linux/i.test(s)) os = "Linux";

  return { device, browser, os, is_bot };
}

// ── Geolocalización vía headers de Vercel ───────────────────────────────
export interface GeoInfo {
  country?: string;
  city?: string;
}

export function readGeoFromRequest(req: NextRequest): GeoInfo {
  const country = req.headers.get("x-vercel-ip-country") ?? undefined;
  const city = req.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(req.headers.get("x-vercel-ip-city")!)
    : undefined;
  return { country, city };
}

// ── UTM parsing ─────────────────────────────────────────────────────────
export interface UTMInfo {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export function parseUtm(url: string | null | undefined): UTMInfo {
  if (!url) return {};
  try {
    const u = new URL(url);
    return {
      utm_source: u.searchParams.get("utm_source") ?? undefined,
      utm_medium: u.searchParams.get("utm_medium") ?? undefined,
      utm_campaign: u.searchParams.get("utm_campaign") ?? undefined,
    };
  } catch {
    return {};
  }
}
