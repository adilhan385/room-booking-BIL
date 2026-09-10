import { prisma } from "@/lib/prisma";
import RoomRow from "@/components/RoomCard";

export const dynamic = "force-dynamic";

async function getRooms() {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysApproved = await prisma.booking.findMany({
      where: { status: "APPROVED", date: { gte: startOfDay, lte: endOfDay } },
      select: { roomId: true, startTime: true, endTime: true },
    });

    return rooms.map((room) => ({
      ...room,
      todaysBookings: todaysApproved.filter((b) => b.roomId === room.id),
    }));
  } catch (error) {
    console.error("Database connection error in getRooms:", error);
    return [];
  }
}

const today = new Date();
const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

export default async function HomePage() {
  const rooms = await getRooms();

  return (
    <div>
      <div className="mb-10 flex items-end justify-between border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Помещения</h1>
          <p className="mt-1 text-ink-faint">
            Сегодня, {WEEKDAYS[today.getDay()]} · {today.toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>

      <div>
        {rooms.map((room, i) => (
          <RoomRow key={room.id} room={room} index={i} />
        ))}
      </div>
    </div>
  );
}
