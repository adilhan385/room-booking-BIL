"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ActiveBooking = {
  id: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
} | null;

export default function BookingForm({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking>(undefined as any);
  const [checkingActive, setCheckingActive] = useState(true);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    className: "",
    responsiblePerson: "",
    purpose: "",
  });

  // Проверяем — есть ли уже активная заявка на эту комнату
  useEffect(() => {
    fetch(`/api/rooms/${roomId}/my-booking`)
      .then((r) => r.json())
      .then((data) => setActiveBooking(data.booking ?? null))
      .finally(() => setCheckingActive(false));
  }, [roomId]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не удалось создать заявку");
        return;
      }

      setSuccess(true);
      setForm({ date: "", startTime: "", endTime: "", className: "", responsiblePerson: "", purpose: "" });
      // После отправки показываем что заявка активна
      setActiveBooking({ ...data, status: "PENDING" });
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingActive) {
    return (
      <div className="card text-sm text-ink-faint">Проверяем ваши заявки...</div>
    );
  }

  // Если уже есть APPROVED или PENDING заявка — скрываем форму
  if (activeBooking) {
    const statusLabel =
      activeBooking.status === "APPROVED"
        ? "✅ Ваша бронь одобрена"
        : "⏳ У вас уже есть заявка на рассмотрении";
    const dateStr = new Date(activeBooking.date).toLocaleDateString("ru-RU");

    return (
      <div className="card space-y-2">
        <p className="font-semibold text-ink">{statusLabel}</p>
        <p className="text-sm text-ink-soft">
          {dateStr} · {activeBooking.startTime}–{activeBooking.endTime}
        </p>
        <p className="text-xs text-ink-faint">
          Просмотрите статус в разделе «Мои заявки»
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-display text-lg font-semibold text-ink">Забронировать помещение</h3>

      {error && <div className="rounded-md bg-rust-50 px-3 py-2 text-sm text-rust-600">{error}</div>}
      {success && (
        <div className="rounded-md bg-sage-50 px-3 py-2 text-sm text-sage-600">
          Заявка отправлена и ожидает рассмотрения администратором.
        </div>
      )}

      <div>
        <label className="label">Дата</label>
        <input
          type="date"
          required
          className="input"
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Время начала</label>
          <input
            type="time"
            required
            className="input"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Время окончания</label>
          <input
            type="time"
            required
            className="input"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Класс (например: 9 «А»)</label>
        <input
          type="text"
          required
          className="input"
          value={form.className}
          onChange={(e) => update("className", e.target.value)}
          placeholder='9 "А"'
        />
      </div>

      <div>
        <label className="label">ФИО воспитателя / ответственного</label>
        <input
          type="text"
          required
          className="input"
          value={form.responsiblePerson}
          onChange={(e) => update("responsiblePerson", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Цель бронирования</label>
        <textarea
          required
          className="input"
          rows={3}
          value={form.purpose}
          onChange={(e) => update("purpose", e.target.value)}
          placeholder="Для чего нужно помещение"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  );
}
