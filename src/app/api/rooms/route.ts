export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/rooms
export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysApproved = await prisma.booking.findMany({
    where: { status: "APPROVED", date: { gte: startOfDay, lte: endOfDay } },
    select: { roomId: true, startTime: true, endTime: true },
  });

  const result = rooms.map((room) => ({
    ...room,
    todaysBookings: todaysApproved.filter((b) => b.roomId === room.id),
  }));

  return NextResponse.json(result);
}

// POST /api/rooms — только для ADMIN и SUPER_ADMIN
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { name, description } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  try {
    const room = await prisma.room.create({
      data: { name: name.trim(), description: description?.trim() || null },
    });
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Кабинет с таким названием уже существует" }, { status: 409 });
  }
}
