"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  responsiblePerson: string;
  purpose: string;
  status: string;
  rejectionReason: string | null;
  room: { name: string };
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Мои заявки</h1>

      {loading ? (
        <p className="text-ink-faint">Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="card text-sm text-ink-faint">У вас пока нет заявок на бронирование.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{b.room.name}</h3>
                  <p className="text-sm text-ink-faint">
                    {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="text-sm text-ink-soft">
                <p>Класс: {b.className}</p>
                <p>Ответственный: {b.responsiblePerson}</p>
                <p>Цель: {b.purpose}</p>
              </div>
              {b.status === "REJECTED" && b.rejectionReason && (
                <div className="mt-3 rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">
                  Причина отказа: {b.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
