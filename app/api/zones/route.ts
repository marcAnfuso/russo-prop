import { NextResponse } from "next/server";
import { fetchAvailableLocalities, REVALIDATE } from "@/lib/xintel";

export const revalidate = REVALIDATE;

export async function GET() {
  const localities = await fetchAvailableLocalities();
  return NextResponse.json({ localities });
}
