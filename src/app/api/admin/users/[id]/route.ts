import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/:id - переключить роль USER <-> ADMIN (только SUPER_ADMIN)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Нельзя изменить роль супер-администратора" }, { status: 400 });
  }

  const newRole = target.role === "ADMIN" ? "USER" : "ADMIN";

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(updated);
}
