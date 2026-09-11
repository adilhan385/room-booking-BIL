import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const room = await prisma.room.findUnique({ where: { id: params.id } });
  if (!room) notFound();

  const upcoming = await prisma.booking.findMany({
    where: {
      roomId: params.id,
      status: "APPROVED",
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 20,
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Форма — на мобиле идёт первой */}
      <div className="lg:order-2">
        {session ? (
          <BookingForm roomId={room.id} />
        ) : (
          <div className="card text-sm text-ink-soft">
            Чтобы забронировать помещение,{" "}
            <Link href="/login" className="font-medium text-brass-600">
              войдите
            </Link>{" "}
            или{" "}
            <Link href="/register" className="font-medium text-brass-600">
              зарегистрируйтесь
            </Link>
            .
          </div>
        )}
      </div>

      <div className="lg:order-1 lg:col-span-2">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">{room.name}</h1>
        <p className="mb-6 text-ink-faint">Ближайшие одобренные брони</p>

        {upcoming.length === 0 ? (
          <div className="card text-sm text-ink-faint">Пока нет одобренных броней — помещение свободно.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink">
                    {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime}
                  </div>
                  <div className="text-sm text-ink-faint">{b.className} · {b.purpose}</div>
                </div>
                <span className="badge badge-rejected">
                  <span className="badge-dot" />
                  Занято
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
