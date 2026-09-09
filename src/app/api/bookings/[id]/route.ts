import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/bookings/:id - одобрить/отклонить заявку (только ADMIN/SUPER_ADMIN)
// Тело: { action: "APPROVE" | "REJECT", rejectionReason?: string }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const body = await req.json();
  const { action, rejectionReason } = body;

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (action === "APPROVE") {
    // Повторная проверка накладок на случай гонки заявок
    const startOfDay = new Date(booking.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(booking.date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicting = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        roomId: booking.roomId,
        status: "APPROVED",
        date: { gte: startOfDay, lte: endOfDay },
        AND: [{ startTime: { lt: booking.endTime } }, { endTime: { gt: booking.startTime } }],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "На это время уже есть другая одобренная бронь этой комнаты" },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "APPROVED", rejectionReason: null },
    });
    return NextResponse.json(updated);
  }

  if (action === "REJECT") {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "REJECTED", rejectionReason: rejectionReason || null },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}

// DELETE /api/bookings/:id - отменить/удалить активную бронь (ADMIN/SUPER_ADMIN)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
