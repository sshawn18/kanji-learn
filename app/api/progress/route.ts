import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const dueOnly = new URL(req.url).searchParams.get("dueOnly") === "true";
  const where = dueOnly ? { userId, nextReviewAt: { lte: new Date() } } : { userId };
  const progress = await prisma.userProgress.findMany({ where, orderBy: { nextReviewAt: "asc" } });
  return NextResponse.json(progress);
}
