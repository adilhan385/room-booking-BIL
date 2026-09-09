"use client";

import Link from "next/link";

type TodayBooking = { roomId: string; startTime: string; endTime: string };

type Room = {
  id: string;
  name: string;
  description?: string | null;
  todaysBookings: TodayBooking[];
};

// Строка реестра помещений — как табличка на стене школьного коридора:
// номер, название, статус на сегодня. Не карточка с тенью и не универсальный SaaS-грид.
export default function RoomRow({ room, index }: { room: Room; index: number }) {
  const isBusyNow = room.todaysBookings.length > 0;

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-paper-line py-4 transition hover:bg-paper-muted sm:grid-cols-[3rem_1fr_16rem]"
    >
      <span className="font-display text-xl text-ink-faint tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="font-display text-lg text-ink group-hover:text-brass-600">{room.name}</span>

      <div className="flex items-center justify-end gap-3 text-right">
        {isBusyNow ? (
          <span className="text-sm text-ink-faint">
            {room.todaysBookings.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}
          </span>
        ) : (
          <span className="text-sm text-ink-faint">Свободно весь день</span>
        )}
        <span className={`badge ${isBusyNow ? "badge-pending" : "badge-approved"}`}>
          <span className="badge-dot" />
          {isBusyNow ? "Занято частично" : "Свободно"}
        </span>
      </div>
    </Link>
  );
}
