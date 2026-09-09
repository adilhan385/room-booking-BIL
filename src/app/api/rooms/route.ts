import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms - список всех комнат с бронями, одобренными на сегодня
// (используется для индикатора доступности на главной странице)
export async function GET() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysApproved = await prisma.booking.findMany({
    where: {
      status: "APPROVED",
      date: { gte: startOfDay, lte: endOfDay },
    },
    select: { roomId: true, startTime: true, endTime: true },
  });

  const result = rooms.map((room) => ({
    ...room,
    todaysBookings: todaysApproved.filter((b) => b.roomId === room.id),
  }));

  return NextResponse.json(result);
}
