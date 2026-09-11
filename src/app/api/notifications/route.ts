export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — возвращает кол-во непросмотренных уведомлений
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.booking.count({
    where: {
      userId: session.user.id,
      seenByUser: false,
    },
  });

  return NextResponse.json({ count });
}

// POST /api/notifications — помечает все уведомления пользователя как просмотренные
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  await prisma.booking.updateMany({
    where: {
      userId: session.user.id,
      seenByUser: false,
    },
    data: { seenByUser: true },
  });

  return NextResponse.json({ ok: true });
}
