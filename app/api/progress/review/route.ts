import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeNextSM2 } from "@/lib/srs";
import type { ReviewRating } from "@/lib/srs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { kanjiId, rating, deckId } = await req.json();
  if (kanjiId === undefined || rating === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.userProgress.findUnique({ where: { userId_kanjiId: { userId, kanjiId } } });
  const card = existing
    ? { easeFactor: existing.easeFactor, interval: existing.interval, repetitions: existing.repetitions, nextReviewAt: existing.nextReviewAt }
    : { easeFactor: 2.5, interval: 0, repetitions: 0, nextReviewAt: new Date() };

  const next = computeNextSM2(card, rating as ReviewRating);
  const isCorrect = rating >= 2;

  const updated = await prisma.userProgress.upsert({
    where: { userId_kanjiId: { userId, kanjiId } },
    update: {
      easeFactor: next.easeFactor, interval: next.interval, repetitions: next.repetitions,
      nextReviewAt: next.nextReviewAt, lastReviewedAt: new Date(),
      totalReviews: { increment: 1 }, correctReviews: isCorrect ? { increment: 1 } : undefined,
      deckId: deckId || undefined,
    },
    create: {
      userId, kanjiId, easeFactor: next.easeFactor, interval: next.interval,
      repetitions: next.repetitions, nextReviewAt: next.nextReviewAt,
      lastReviewedAt: new Date(), totalReviews: 1, correctReviews: isCorrect ? 1 : 0,
      deckId: deckId || null,
    },
  });

  // Update streak
  await updateStreak(userId);

  return NextResponse.json(updated);
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true, lastStudyDate: true } });
  if (!user) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const last = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
  if (last) last.setHours(0,0,0,0);
  const isNewDay = !last || last.getTime() < today.getTime();
  if (isNewDay) {
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = last && last.getTime() === yesterday.getTime();
    await prisma.user.update({ where: { id: userId }, data: { streak: isConsecutive ? { increment: 1 } : 1, lastStudyDate: new Date() } });
  }
}
