import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { currentSessionIsAdmin } from "@/lib/admin-auth";
import {
  addMediaPick,
  listMediaPicks,
  removeMediaPick,
  reorderMediaPicks,
  type MediaCategory,
} from "@/lib/media-picks";

const VALID_CATEGORIES: MediaCategory[] = ["campana", "tour", "otro"];

async function requireAdmin() {
  if (!(await currentSessionIsAdmin())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const block = await requireAdmin();
  if (block) return block;
  const items = await listMediaPicks();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const body = await req.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json(
      { ok: false, error: "URL inválida" },
      { status: 400 }
    );
  }
  if (!VALID_CATEGORIES.includes(category as MediaCategory)) {
    return NextResponse.json(
      { ok: false, error: "Categoría inválida" },
      { status: 400 }
    );
  }

  const id = randomUUID();
  await addMediaPick({
    id,
    url,
    category: category as MediaCategory,
    title: title || undefined,
  });
  revalidatePath("/historias");
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "missing id" },
      { status: 400 }
    );
  }
  await removeMediaPick(id);
  revalidatePath("/historias");
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const block = await requireAdmin();
  if (block) return block;

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : null;
  if (!ids) {
    return NextResponse.json(
      { ok: false, error: "missing ids array" },
      { status: 400 }
    );
  }
  await reorderMediaPicks(ids);
  revalidatePath("/historias");
  return NextResponse.json({ ok: true });
}
