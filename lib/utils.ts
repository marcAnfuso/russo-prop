export function formatPrice(price: number): string {
  return price.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

/**
 * Convert a YouTube/Vimeo "watch" URL into its embeddable iframe URL.
 * Returns the original URL if we can't recognize the format (caller
 * decides whether to embed it anyway).
 */
export function toEmbedUrl(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube: watch?v=ID  →  /embed/ID
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      // /shorts/ID and /live/ID
      const short = u.pathname.match(/^\/(shorts|live)\/([^/]+)/);
      if (short) return `https://www.youtube.com/embed/${short[2]}`;
      // Already /embed/ID
      if (u.pathname.startsWith("/embed/")) return url;
    }

    // youtu.be/ID → /embed/ID
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split(/[/?#]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo: vimeo.com/ID → player.vimeo.com/video/ID
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // not a valid URL; fall through
  }
  return url;
}
