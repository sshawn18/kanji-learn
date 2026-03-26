import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { level } = await req.json();
  if (!["N5","N4","N3","N2","N1"].includes(level)) return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { assessedLevel: level, selfReported: true } });
  return NextResponse.json({ success: true });
}
