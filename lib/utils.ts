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

/**
 * Texto plano a partir del HTML que manda Xintel en las descripciones.
 * Lo usa el JSON-LD: schema.org espera texto, no markup.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sentinel de "precio oculto". Lo usa el equipo en Xintel para las
 * reservadas, y lo usamos nosotros para las que tienen "Anular precio en
 * Internet" tildado (ver Property.priceOnRequest). Nunca es un precio real.
 */
export const PRECIO_OCULTO = 9999999;

type ConPrecio = { price: number; currency: "USD" | "ARS"; priceOnRequest?: boolean };

/** Reservada de verdad: precio oculto y NO por "a consultar". */
export function isReservada(p: ConPrecio): boolean {
  return p.price === PRECIO_OCULTO && !p.priceOnRequest;
}

/**
 * Lo que se le muestra al visitante en lugar del precio: "Reservado",
 * "Consultar", o el precio formateado. Única fuente de verdad · antes cada
 * componente decidía por su cuenta y varios mostraban "USD 9.999.999".
 */
export function priceLabel(p: ConPrecio): string {
  if (p.price === PRECIO_OCULTO) return p.priceOnRequest ? "Consultar" : "Reservado";
  return `${p.currency === "ARS" ? "$" : "USD"} ${formatPrice(p.price)}`;
}

/**
 * El precio como se lo pasamos a Russia (Gemini). Antes le llegaba el
 * número crudo y con una reservada veía literalmente "9999999"; con una "a
 * consultar" le hubiéramos regalado el precio que el equipo pidió ocultar.
 */
export function priceForModel(p: ConPrecio): string | number {
  if (p.price === PRECIO_OCULTO) {
    return p.priceOnRequest
      ? "a consultar (el equipo no publica el precio; no lo inventes, invitá a consultar por WhatsApp)"
      : "reservada";
  }
  return p.price;
}
