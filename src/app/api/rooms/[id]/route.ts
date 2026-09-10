export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

// PATCH /api/rooms/[id] — редактировать кабинет
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !isAdmin(role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { name, description } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  try {
    const room = await prisma.room.update({
      where: { id: params.id },
      data: { name: name.trim(), description: description?.trim() || null },
    });
    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: "Кабинет не найден или название занято" }, { status: 409 });
  }
}

// DELETE /api/rooms/[id] — удалить кабинет
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !isAdmin(role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  await prisma.room.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
