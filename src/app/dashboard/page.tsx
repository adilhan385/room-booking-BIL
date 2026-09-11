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
  seenByUser: boolean;
  rejectionReason: string | null;
  room: { name: string };
};

type Toast = {
  id: string;
  message: string;
  type: "approved" | "rejected";
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data: Booking[]) => {
        if (!Array.isArray(data)) return;
        setBookings(data);

        // Показываем тосты для непросмотренных уведомлений
        const unseen = data.filter((b) => !b.seenByUser);
        const newToasts: Toast[] = unseen.map((b) => ({
          id: b.id,
          message:
            b.status === "APPROVED"
              ? `✅ Ваша заявка на «${b.room.name}» одобрена!`
              : `❌ Ваша заявка на «${b.room.name}» отклонена`,
          type: b.status === "APPROVED" ? "approved" : "rejected",
        }));
        if (newToasts.length > 0) setToasts(newToasts);

        // Помечаем все как просмотренные
        if (unseen.length > 0) {
          fetch("/api/notifications", { method: "POST" });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Автоматически скрываем тосты через 5 секунд
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts([]), 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink dark:text-zinc-100">
        Мои заявки
      </h1>

      {/* Тосты уведомлений */}
      {toasts.length > 0 && (
        <div className="mb-6 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium shadow-md ${
                t.type === "approved"
                  ? "bg-sage-50 text-sage-700 dark:bg-[#14281c] dark:text-[#d8e3d6]"
                  : "bg-rust-50 text-rust-700 dark:bg-[#2e1410] dark:text-[#efcfc3]"
              }`}
            >
              <span>{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-4 text-current opacity-60 hover:opacity-100"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-ink-faint dark:text-zinc-500">Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="card text-sm text-ink-faint dark:text-zinc-400">
          У вас пока нет заявок на бронирование.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink dark:text-zinc-100">{b.room.name}</h3>
                  <p className="text-sm text-ink-faint dark:text-zinc-400">
                    {new Date(b.date).toLocaleDateString("ru-RU")} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="text-sm text-ink-soft dark:text-zinc-400">
                <p>Класс: {b.className}</p>
                <p>Ответственный: {b.responsiblePerson}</p>
                <p>Цель: {b.purpose}</p>
              </div>
              {b.status === "REJECTED" && b.rejectionReason && (
                <div className="mt-3 rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600 dark:bg-[#2e1410] dark:text-[#efcfc3]">
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
