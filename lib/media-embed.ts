/**
 * Helpers puros de los links de historias (Instagram, TikTok, YouTube).
 *
 * Separados de media-picks.ts porque HistoriasClient (componente de
 * cliente) usa getEmbedUrl: si lo importara de media-picks se llevaría al
 * navegador la conexión a la base y la caché del servidor, y el build falla.
 */
export type MediaPlatform = "instagram" | "tiktok" | "youtube" | "otro";

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
