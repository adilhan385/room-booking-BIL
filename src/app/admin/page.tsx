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
  status: string;
  room: { name: string };
  user: { name: string; email: string };
};

export default function AdminRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/bookings?status=PENDING")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setError("");
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Не удалось одобрить заявку");
      return;
    }
    load();
  }

  async function reject(id: string) {
    setError("");
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REJECT", rejectionReason: reason }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Не удалось отклонить заявку");
      return;
    }
    setRejectingId(null);
    setReason("");
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Заявки на бронь</h1>

      {error && <div className="mb-4 rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">{error}</div>}

      {loading ? (
        <p className="text-ink-faint">Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="card text-sm text-ink-faint">Нет заявок, ожидающих рассмотрения.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-ink">{b.room.name}</h3>
                  <p className="text-sm text-ink-faint">
                    {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(b.id)} className="btn-primary">
                    Принять
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === b.id ? null : b.id)}
                    className="btn-danger"
                  >
                    Отклонить
                  </button>
                </div>
              </div>

              <div className="text-sm text-ink-soft">
                <p>Класс: {b.className}</p>
                <p>Ответственный: {b.responsiblePerson}</p>
                <p>Цель: {b.purpose}</p>
                <p>
                  Заявитель: {b.user.name} ({b.user.email})
                </p>
              </div>

              {rejectingId === b.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    className="input"
                    placeholder="Причина отказа (необязательно)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <button onClick={() => reject(b.id)} className="btn-danger whitespace-nowrap">
                    Подтвердить отказ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
