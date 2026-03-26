import { NextRequest, NextResponse } from "next/server";
import { getAllKanji } from "@/lib/kanji-data";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase() ?? "";
  if (!q) return NextResponse.json([]);
  const results = getAllKanji().filter(k =>
    k.character.includes(q) ||
    k.meanings.some(m => m.toLowerCase().includes(q)) ||
    k.onyomi.some(r => r.toLowerCase().includes(q)) ||
    k.kunyomi.some(r => r.toLowerCase().includes(q))
  ).slice(0, 40);
  return NextResponse.json(results);
}
