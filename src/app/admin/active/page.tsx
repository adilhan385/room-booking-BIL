"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  responsiblePerson: string;
  purpose: string;
  room: { name: string };
  user: { name: string; email: string };
};

export default function ActiveBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/bookings?status=APPROVED")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: string) {
    if (!confirm("Отменить эту бронь?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Активные брони</h1>

      {loading ? (
        <p className="text-ink-faint">Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="card text-sm text-ink-faint">Активных броней нет.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">{b.room.name}</h3>
                <p className="text-sm text-ink-faint">
                  {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {b.className} · {b.responsiblePerson}
                </p>
                <p className="text-sm text-ink-soft">
                  {b.user.name} ({b.user.email})
                </p>
              </div>
              <button onClick={() => cancel(b.id)} className="btn-danger">
                Отменить бронь
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
