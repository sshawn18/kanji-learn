import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const decks = await prisma.deck.findMany({
    where: { userId },
    include: { _count: { select: { kanjiItems: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const deck = await prisma.deck.create({ data: { userId, name: name.trim(), description: description?.trim() || null } });
  return NextResponse.json(deck, { status: 201 });
}
