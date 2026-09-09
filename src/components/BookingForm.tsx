"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingForm({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    className: "",
    responsiblePerson: "",
    purpose: "",
  });

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
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
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
        <label className="label">Класс (например: 9 "А")</label>
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
