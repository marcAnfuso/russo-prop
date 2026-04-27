import { Resend } from "resend";
import type { Alert, AlertCriterion } from "./alerts-db";
import { describeCriterion } from "./alerts-db";

const FROM = process.env.RESEND_FROM ?? "Russo Propiedades <alertas@russopropiedades.com.ar>";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://russopropiedades.com.ar";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/alertas/baja?token=${encodeURIComponent(token)}`;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1a2251;
  line-height: 1.55;
  font-size: 15px;
`;

function emailShell(content: string, token: string): string {
  return `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:32px 16px;background:#f6f7fb;${baseStyles}">
  <table role="presentation" width="100%" style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(26,34,81,0.08);">
    <tr>
      <td style="padding:24px 32px;background:linear-gradient(135deg,#e6007e 0%,#1a2251 120%);color:white;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.8;">Russo Propiedades</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:600;">Alertas de propiedades</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;${baseStyles}">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#f6f7fb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
        ¿No querés recibir más alertas?
        <a href="${unsubscribeUrl(token)}" style="color:#e6007e;text-decoration:none;font-weight:600;">Darme de baja</a>
        · 30 años acompañando familias en zona oeste.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Envía email de bienvenida cuando alguien se suscribe.
 * Si no hay RESEND_API_KEY, queda en log y devuelve OK silencioso —
 * la alerta queda creada y los emails se mandarán cuando seteen la key.
 */
export async function sendWelcomeEmail(alert: Alert): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log("[alerts] RESEND_API_KEY no seteada, skipping welcome email", alert.email);
    return;
  }
  const filters = describeCriterion(alert.criterion);
  const html = emailShell(
    `
    <p style="margin:0 0 16px;">¡Hola${alert.name ? ` ${alert.name}` : ""}!</p>
    <p style="margin:0 0 16px;">Suscribiste tu correo para recibir avisos de propiedades nuevas.</p>
    <table style="width:100%;background:#fdf2f8;border-radius:8px;padding:14px 18px;margin:0 0 20px;">
      <tr><td>
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9b1c5e;">Tu búsqueda</p>
        <p style="margin:0;font-weight:600;color:#1a2251;">${escapeHtml(filters)}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 16px;">Te vamos a escribir cuando entren propiedades nuevas que coincidan. No te llenamos de mails — sólo cuando hay novedades reales.</p>
    <p style="margin:0;color:#6b7280;font-size:13px;">Mientras tanto, podés seguir buscando en <a href="${SITE_URL}" style="color:#e6007e;font-weight:600;text-decoration:none;">russopropiedades.com.ar</a>.</p>
  `,
    alert.unsubscribe_token
  );

  await client.emails.send({
    from: FROM,
    to: [alert.email],
    subject: "✅ Tu alerta está activa · Russo Propiedades",
    html,
  });
}

interface MatchedProperty {
  id: string;
  code: string;
  title: string;
  address: string;
  locality: string;
  price: number;
  currency: "USD" | "ARS";
  operation: string;
  image: string | null;
}

/**
 * Email digest con N propiedades que matchearon una alerta.
 * Lo usa la sub-fase B (cron). Lo dejamos definido ya para que esté
 * listo cuando armemos el cron.
 */
export async function sendMatchDigestEmail(
  alert: Alert,
  matches: MatchedProperty[]
): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log("[alerts] RESEND_API_KEY no seteada, skipping digest", alert.email);
    return;
  }
  const filters = describeCriterion(alert.criterion);
  const cardsHtml = matches
    .slice(0, 6)
    .map((m) => {
      const cur = m.currency === "ARS" ? "$" : "USD";
      const price = new Intl.NumberFormat("es-AR").format(m.price);
      const url = `${SITE_URL}/propiedad/${m.id}`;
      return `
        <table style="width:100%;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 12px;overflow:hidden;">
          <tr>
            ${m.image
              ? `<td style="width:130px;"><img src="${m.image}" alt="" style="display:block;width:130px;height:100px;object-fit:cover;" /></td>`
              : ""
            }
            <td style="padding:12px 14px;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:11px;color:#9ca3af;font-family:monospace;">${m.code}</p>
              <p style="margin:0 0 4px;font-weight:600;color:#1a2251;">${escapeHtml(m.address)}</p>
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">${escapeHtml(m.locality)}</p>
              <p style="margin:0 0 8px;font-weight:700;color:#1a2251;">${cur} ${price}</p>
              <a href="${url}" style="display:inline-block;background:#e6007e;color:white;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">Ver propiedad</a>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");

  const html = emailShell(
    `
    <p style="margin:0 0 8px;">¡Hola${alert.name ? ` ${alert.name}` : ""}!</p>
    <p style="margin:0 0 16px;">Encontramos ${matches.length} propiedad${matches.length === 1 ? "" : "es"} nueva${matches.length === 1 ? "" : "s"} que coincide${matches.length === 1 ? "" : "n"} con tu búsqueda:</p>
    <p style="margin:0 0 18px;font-size:12px;color:#6b7280;font-style:italic;">${escapeHtml(filters)}</p>
    ${cardsHtml}
    ${matches.length > 6 ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;">+ ${matches.length - 6} más en el sitio →</p>` : ""}
  `,
    alert.unsubscribe_token
  );

  await client.emails.send({
    from: FROM,
    to: [alert.email],
    subject: `${matches.length} propiedad${matches.length === 1 ? "" : "es"} nueva${matches.length === 1 ? "" : "s"} para vos · Russo`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Para que TS no se queje del tipo MatchedProperty siendo inutilizado afuera
export type { MatchedProperty as AlertMatchedProperty, AlertCriterion };
