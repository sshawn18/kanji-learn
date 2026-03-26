import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { deckId } = await params;
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { kanjiId } = await req.json();
  const count = await prisma.deckKanji.count({ where: { deckId } });
  await prisma.deckKanji.upsert({
    where: { deckId_kanjiId: { deckId, kanjiId } },
    update: {},
    create: { deckId, kanjiId, position: count },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { deckId } = await params;
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { kanjiId } = await req.json();
  await prisma.deckKanji.deleteMany({ where: { deckId, kanjiId } });
  return NextResponse.json({ success: true });
}
