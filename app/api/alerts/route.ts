import { NextRequest, NextResponse } from "next/server";
import {
  createAlert,
  type AlertCriterion,
  type OperationFilter,
} from "@/lib/alerts-db";
import { sendWelcomeEmail } from "@/lib/alerts-email";

const VALID_OPERATIONS: OperationFilter[] = ["venta", "alquiler"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter((x): x is string => typeof x === "string" && !!x.trim());
  return arr.length > 0 ? arr : undefined;
}

function asNumberArray(v: unknown): number[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v
    .map((x) => Number(x))
    .filter((n): n is number => Number.isFinite(n) && n > 0);
  return arr.length > 0 ? arr : undefined;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Email inválido" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : undefined;
  const criterionInput =
    typeof body.criterion === "object" && body.criterion !== null
      ? (body.criterion as Record<string, unknown>)
      : {};

  const criterion: AlertCriterion = {};
  if (
    typeof criterionInput.operation === "string" &&
    VALID_OPERATIONS.includes(criterionInput.operation as OperationFilter)
  ) {
    criterion.operation = criterionInput.operation as OperationFilter;
  }
  const zones = asStringArray(criterionInput.zones);
  if (zones) criterion.zones = zones.slice(0, 20);
  const types = asStringArray(criterionInput.types);
  if (types) criterion.types = types.slice(0, 20);
  const rooms = asNumberArray(criterionInput.rooms);
  if (rooms) criterion.rooms = rooms.slice(0, 10);
  if (
    typeof criterionInput.priceMax === "number" &&
    criterionInput.priceMax > 0
  ) {
    criterion.priceMax = Math.round(criterionInput.priceMax);
    criterion.priceCurrency =
      criterionInput.priceCurrency === "ARS" ? "ARS" : "USD";
  }

  try {
    const alert = await createAlert({ email, name, criterion });

    // Welcome email · sin bloquear la respuesta. Si Resend falla,
    // queda en log pero la alerta ya está guardada.
    sendWelcomeEmail(alert).catch((err) => {
      console.error("[alerts] welcome email error:", err);
    });

    return NextResponse.json({ ok: true, id: alert.id });
  } catch (err) {
    console.error("[alerts] create error:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo crear la alerta" },
      { status: 500 }
    );
  }
}
