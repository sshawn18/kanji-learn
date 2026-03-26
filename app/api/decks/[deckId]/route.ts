import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKanjiById } from "@/lib/kanji-data";

export async function GET(_: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { deckId } = await params;
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId }, include: { kanjiItems: { orderBy: { position: "asc" } } } });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const kanjiItems = deck.kanjiItems.map(item => ({ ...item, kanji: getKanjiById(item.kanjiId) }));
  return NextResponse.json({ ...deck, kanjiItems });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { deckId } = await params;
  const { name, description } = await req.json();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.deck.update({ where: { id: deckId }, data: { name: name ?? deck.name, description: description ?? deck.description } });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { deckId } = await params;
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.deck.delete({ where: { id: deckId } });
  return NextResponse.json({ success: true });
}
