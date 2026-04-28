import { NextRequest, NextResponse } from "next/server";
import { sendContactEmails, type ContactPayload } from "@/lib/contact-email";

export async function POST(req: NextRequest) {
  try {
    const body: ContactPayload = await req.json();

    // Validación básica
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }
    const validTypes: ContactPayload["type"][] = ["contacto", "tasacion", "consulta"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Tipo de consulta inválido" },
        { status: 400 }
      );
    }

    // Manda el email a info@ y acuse al usuario · si no hay
    // RESEND_API_KEY queda en log y devuelve OK igual.
    const result = await sendContactEmails(body);
    if (!result.ok) {
      console.error("[contact] send error:", result.error);
      // Devolvemos 200 igualmente · el lead quedó loggeado y no
      // queremos romper la UX al usuario por un fallo de mailing.
      // El admin debería revisar logs si esto pasa seguido.
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] route error:", err);
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
      { status: 500 }
    );
  }
}
