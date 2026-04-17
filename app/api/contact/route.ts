import { NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email?: string;
  phone: string;
  message: string;
  propertyCode?: string;
  type: "contacto" | "tasacion" | "consulta";
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactPayload = await req.json();

    // Validate required fields
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    // For now, log the contact request server-side
    // In production, this would send an email via Resend/SendGrid or hit WhatsApp Business API
    console.log("[Contact]", JSON.stringify(body, null, 2));

    // TODO: Integrate with email service (Resend, SendGrid, etc.)

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
      { status: 500 }
    );
  }
}
