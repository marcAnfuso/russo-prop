import { Resend } from "resend";

export type ContactType = "contacto" | "tasacion" | "consulta";

export interface ContactPayload {
  name: string;
  email?: string;
  phone: string;
  message: string;
  propertyCode?: string;
  type: ContactType;
}

const FROM = process.env.RESEND_FROM ?? "Russo Propiedades <web@russopropiedades.com.ar>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@russopropiedades.com.ar";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://russopropiedades.com.ar";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const TYPE_LABEL: Record<ContactType, string> = {
  contacto: "Contacto general",
  tasacion: "Pedido de tasación",
  consulta: "Consulta sobre propiedad",
};

const TYPE_EMOJI: Record<ContactType, string> = {
  contacto: "📩",
  tasacion: "🏷️",
  consulta: "🏠",
};

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1a2251;
  line-height: 1.55;
  font-size: 15px;
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLeadHtml(p: ContactPayload): string {
  const propertyLink = p.propertyCode
    ? `<a href="${SITE_URL}/propiedad/${p.propertyCode.replace(/^RUS/, "")}" style="color:#e6007e;font-weight:600;text-decoration:none;">${escapeHtml(p.propertyCode)}</a>`
    : null;

  const rows: { label: string; value: string }[] = [
    { label: "Tipo", value: TYPE_LABEL[p.type] },
    { label: "Nombre", value: escapeHtml(p.name) },
    { label: "Teléfono", value: `<a href="tel:${escapeHtml(p.phone)}" style="color:#1a2251;">${escapeHtml(p.phone)}</a>` },
  ];
  if (p.email) {
    rows.push({
      label: "Email",
      value: `<a href="mailto:${escapeHtml(p.email)}" style="color:#1a2251;">${escapeHtml(p.email)}</a>`,
    });
  }
  if (propertyLink) rows.push({ label: "Propiedad", value: propertyLink });

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;background:#f6f7fb;width:120px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">${r.label}</td>
        <td style="padding:8px 12px;font-weight:600;">${r.value}</td>
      </tr>`
    )
    .join("");

  const message = escapeHtml(p.message).replace(/\n/g, "<br>");

  return `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:32px 16px;background:#f6f7fb;${baseStyles}">
  <table role="presentation" width="100%" style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(26,34,81,0.08);">
    <tr>
      <td style="padding:24px 32px;background:linear-gradient(135deg,#e6007e 0%,#1a2251 120%);color:white;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.8;">Russo Propiedades · Lead nuevo</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:600;">
          ${TYPE_EMOJI[p.type]} ${TYPE_LABEL[p.type]}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;${baseStyles}">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-radius:8px;overflow:hidden;">
          ${rowsHtml}
        </table>
        <div style="margin-top:20px;padding:16px 18px;background:#fdf2f8;border-left:4px solid #e6007e;border-radius:0 8px 8px 0;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9b1c5e;">Mensaje</p>
          <p style="margin:0;color:#1a2251;line-height:1.6;">${message}</p>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#6b7280;">
          Llegado desde <a href="${SITE_URL}" style="color:#e6007e;text-decoration:none;">russopropiedades.com.ar</a>
          · ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAckHtml(p: ContactPayload): string {
  const propText =
    p.type === "tasacion"
      ? "tasación"
      : p.propertyCode
      ? `consulta sobre la propiedad ${p.propertyCode}`
      : "consulta";
  return `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:32px 16px;background:#f6f7fb;${baseStyles}">
  <table role="presentation" width="100%" style="max-width:540px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(26,34,81,0.08);">
    <tr>
      <td style="padding:24px 32px;background:linear-gradient(135deg,#e6007e 0%,#1a2251 120%);color:white;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.8;">Russo Propiedades</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:600;">¡Recibimos tu mensaje!</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;${baseStyles}">
        <p style="margin:0 0 16px;">Hola${p.name ? ` <strong>${escapeHtml(p.name)}</strong>` : ""},</p>
        <p style="margin:0 0 16px;">Recibimos tu ${propText} y un asesor te va a estar contactando en horario laboral.</p>
        <p style="margin:0 0 16px;">¿Necesitás respuesta inmediata? Escribinos por WhatsApp:</p>
        <p style="margin:0 0 24px;">
          <a href="https://wa.me/5491150187340" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600;">
            💬 Chatear por WhatsApp
          </a>
        </p>
        <p style="margin:0;color:#6b7280;font-size:13px;">Más de 30 años acompañando familias en zona oeste · <a href="${SITE_URL}" style="color:#e6007e;text-decoration:none;">russopropiedades.com.ar</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Manda el lead a info@russopropiedades.com.ar (o la env CONTACT_TO_EMAIL).
 * Si hay email del usuario, también le manda un acuse de recibo.
 * Si RESEND_API_KEY no está seteada, queda en log y devuelve OK.
 */
export async function sendContactEmails(p: ContactPayload): Promise<{ ok: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.log("[contact] RESEND_API_KEY no seteada, lead loggeado:", JSON.stringify(p));
    return { ok: true };
  }

  const subject = `${TYPE_EMOJI[p.type]} ${TYPE_LABEL[p.type]} · ${p.name}${p.propertyCode ? ` · ${p.propertyCode}` : ""}`;

  try {
    // Email principal a Russo
    await client.emails.send({
      from: FROM,
      to: [TO_EMAIL],
      replyTo: p.email,
      subject,
      html: buildLeadHtml(p),
    });

    // Acuse al usuario · best-effort, no rompe el flow si falla
    if (p.email) {
      client.emails
        .send({
          from: FROM,
          to: [p.email],
          subject: "✅ Recibimos tu mensaje · Russo Propiedades",
          html: buildAckHtml(p),
        })
        .catch((err) => console.error("[contact] ack email error:", err));
    }

    return { ok: true };
  } catch (err) {
    console.error("[contact] resend error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al enviar",
    };
  }
}
