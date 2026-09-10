export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/:id/bookings - расписание занятости комнаты (только одобренные брони,
// плюс собственные заявки пользователя не нужны здесь - только публичное расписание)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const bookings = await prisma.booking.findMany({
    where: {
      roomId: params.id,
      status: "APPROVED",
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      className: true,
      purpose: true,
    },
  });

  return NextResponse.json(bookings);
}
