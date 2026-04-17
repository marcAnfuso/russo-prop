import { NextRequest, NextResponse } from "next/server";
import { currentSessionIsAdmin } from "@/lib/admin-auth";
import { addPick, listPicks, removePick, type PickList } from "@/lib/picks";

const VALID_LISTS: PickList[] = ["featured", "new"];

function parseList(raw: string | null): PickList | null {
  return raw && (VALID_LISTS as string[]).includes(raw) ? (raw as PickList) : null;
}

async function requireAdmin() {
  if (!(await currentSessionIsAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const list = parseList(req.nextUrl.searchParams.get("list"));
  if (!list) {
    const [featured, fresh] = await Promise.all([
      listPicks("featured"),
      listPicks("new"),
    ]);
    return NextResponse.json({ featured, new: fresh });
  }
  const ids = await listPicks(list);
  return NextResponse.json({ list, ids });
}

export async function POST(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const body = await req.json().catch(() => ({}));
  const propertyId = typeof body.property_id === "string" ? body.property_id.trim() : "";
  const list = parseList(typeof body.list === "string" ? body.list : null);
  if (!propertyId || !list) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }
  // For "new" listings, auto-expire after 30 days so the page doesn't go
  // stale if Russo forgets to untoggle.
  let expiresAt: string | null = null;
  if (list === "new") {
    const ttlDays =
      typeof body.ttl_days === "number" && body.ttl_days > 0
        ? body.ttl_days
        : 30;
    expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  }
  await addPick(propertyId, list, expiresAt);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const propertyId = req.nextUrl.searchParams.get("property_id") ?? "";
  const list = parseList(req.nextUrl.searchParams.get("list"));
  if (!propertyId || !list) {
    return NextResponse.json({ ok: false, error: "invalid params" }, { status: 400 });
  }
  await removePick(propertyId, list);
  return NextResponse.json({ ok: true });
}
