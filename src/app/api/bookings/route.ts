export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookings
//   - USER: возвращает только его заявки
//   - ADMIN/SUPER_ADMIN: возвращает все заявки (можно фильтровать ?status=PENDING)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  const bookings = await prisma.booking.findMany({
    where: {
      ...(isAdmin ? {} : { userId: session.user.id }),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      room: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

// POST /api/bookings - создание новой заявки на бронирование
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roomId, date, startTime, endTime, className, responsiblePerson, purpose } = body;

    if (!roomId || !date || !startTime || !endTime || !className || !responsiblePerson || !purpose) {
      return NextResponse.json({ error: "Заполните все поля формы" }, { status: 400 });
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Время начала должно быть раньше времени окончания" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Проверка накладок: только против уже ОДОБРЕННЫХ броней того же дня для этой комнаты.
    const conflicting = await prisma.booking.findFirst({
      where: {
        roomId,
        status: "APPROVED",
        date: { gte: startOfDay, lte: endOfDay },
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "На выбранное время эта комната уже забронирована. Выберите другое время." },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        userId: session.user.id,
        date: bookingDate,
        startTime,
        endTime,
        className,
        responsiblePerson,
        purpose,
        status: "PENDING",
      },
      include: { room: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
