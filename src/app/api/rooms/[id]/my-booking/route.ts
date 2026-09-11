export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/:id/my-booking — проверить есть ли активная заявка у текущего пользователя
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ booking: null });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const booking = await prisma.booking.findFirst({
    where: {
      userId: session.user.id,
      roomId: params.id,
      status: { in: ["PENDING", "APPROVED"] },
      date: { gte: today },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ booking });
}
