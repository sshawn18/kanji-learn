import { NextRequest, NextResponse } from "next/server";
import { getKanjiByLevel, getKanjiSet } from "@/lib/kanji-data";
import type { JLPTLevel } from "@/lib/kanji-data/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level") as JLPTLevel;
  const setStr = searchParams.get("set");
  if (!level || !["N5","N4","N3","N2","N1"].includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  const kanji = setStr !== null ? getKanjiSet(level, parseInt(setStr)) : getKanjiByLevel(level);
  return NextResponse.json(kanji);
}
