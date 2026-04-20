import { sql } from "./db";

export type MediaCategory = "campana" | "tour" | "otro";
export type MediaPlatform = "instagram" | "tiktok" | "youtube" | "otro";

export interface MediaPick {
  id: string;
  url: string;
  platform: MediaPlatform;
  category: MediaCategory;
  title: string | null;
  position: number;
  added_at: string;
}

export async function ensureMediaSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS media_picks (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      platform TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_media_position
      ON media_picks (position ASC, added_at DESC)
  `;
}

/** Auto-detect platform from a raw URL. */
export function detectPlatform(url: string): MediaPlatform {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
    if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com"))
      return "youtube";
  } catch {
    // fall through
  }
  return "otro";
}

/**
 * Turn a public Reel/Tiktok/YouTube URL into an embeddable iframe URL.
 * Returns null if we can't parse it — in which case the caller should
 * just link out instead of embedding.
 */
export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // Instagram: /reel/{id}/ or /p/{id}/ or /tv/{id}/
    if (host === "instagram.com" || host.endsWith(".instagram.com")) {
      const m = u.pathname.match(/^\/(reel|p|tv)\/([^/]+)/);
      if (m) return `https://www.instagram.com/${m[1]}/${m[2]}/embed`;
    }

    // TikTok: /@user/video/{id}  or  /v/{id}
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
      const m = u.pathname.match(/\/video\/(\d+)/) ?? u.pathname.match(/\/v\/(\d+)/);
      if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`;
    }

    // YouTube Shorts / watch
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const short = u.pathname.match(/^\/(shorts|embed)\/([^/]+)/);
      if (short) return `https://www.youtube.com/embed/${short[2]}`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split(/[/?#]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    // fall through
  }
  return null;
}

/** Normalize an Instagram / TikTok / YouTube URL to something embed-ready. */
export function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    // Strip tracking params
    ["igshid", "utm_source", "utm_medium", "utm_campaign", "_t", "_r"].forEach(
      (p) => u.searchParams.delete(p)
    );
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export async function listMediaPicks(): Promise<MediaPick[]> {
  await ensureMediaSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, url, platform, category, title, position, added_at
    FROM media_picks
    ORDER BY position ASC, added_at DESC
  `) as unknown as MediaPick[];
  return rows;
}

export async function addMediaPick(params: {
  id: string;
  url: string;
  category: MediaCategory;
  title?: string;
}): Promise<void> {
  await ensureMediaSchema();
  const db = sql();
  const platform = detectPlatform(params.url);
  const url = canonicalizeUrl(params.url);
  await db`
    INSERT INTO media_picks (id, url, platform, category, title)
    VALUES (${params.id}, ${url}, ${platform}, ${params.category}, ${params.title ?? null})
  `;
}

export async function removeMediaPick(id: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM media_picks WHERE id = ${id}`;
}

export async function reorderMediaPicks(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = sql();
  for (let i = 0; i < ids.length; i++) {
    await db`UPDATE media_picks SET position = ${i} WHERE id = ${ids[i]}`;
  }
}
