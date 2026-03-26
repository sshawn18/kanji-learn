import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ASSESSMENT_QUESTIONS } from "@/lib/assessment-questions";
import type { JLPTLevel } from "@/lib/kanji-data/types";

export async function POST(req: NextRequest) {
  const { answers } = await req.json(); // { [questionId]: selectedIndex }
  const levels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
  const scoreByLevel: Record<string, { correct: number; total: number }> = {};
  levels.forEach(l => scoreByLevel[l] = { correct: 0, total: 0 });

  ASSESSMENT_QUESTIONS.forEach(q => {
    scoreByLevel[q.level].total++;
    if (answers[q.id] === q.correctIndex) scoreByLevel[q.level].correct++;
  });

  // Find recommended level: start from N5, go up while passing (>=60%)
  let recommended: JLPTLevel = "N5";
  for (const level of levels) {
    const { correct, total } = scoreByLevel[level];
    if (total === 0) continue;
    const threshold = Math.ceil(total * 0.6);
    if (correct >= threshold) recommended = level;
    else break;
  }

  // Save if logged in
  const session = await auth();
  if (session?.user) {
    const userId = (session.user as any).id;
    await prisma.user.update({ where: { id: userId }, data: { assessedLevel: recommended, selfReported: false } });
  }

  return NextResponse.json({ recommended, scoreByLevel });
}
