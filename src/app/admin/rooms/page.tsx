"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Room = { id: string; name: string; description: string | null };

export default function AdminRoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Форма добавления
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  // Редактирование
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !isAdmin) router.push("/");
  }, [status, isAdmin, router]);

  function load() {
    setLoading(true);
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    setAdding(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Ошибка");
      return;
    }
    setNewName("");
    setNewDesc("");
    load();
  }

  function startEdit(room: Room) {
    setEditId(room.id);
    setEditName(room.name);
    setEditDesc(room.description ?? "");
    setError("");
  }

  async function handleSave(id: string) {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/rooms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Ошибка");
      return;
    }
    setEditId(null);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить кабинет «${name}»? Все брони этого кабинета тоже будут удалены.`)) return;
    setError("");
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Ошибка при удалении");
      return;
    }
    load();
  }

  if (status === "loading" || loading) {
    return <p className="text-ink-faint dark:text-white/40">Загрузка...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink dark:text-[#e2ede6]">
        Управление кабинетами
      </h1>

      {error && (
        <div className="rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600 dark:bg-rust-600/20 dark:text-rust-100">
          {error}
        </div>
      )}

      {/* Форма добавления */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-ink dark:text-[#e2ede6]">
          Добавить кабинет
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Название *</label>
            <input
              className="input"
              placeholder="Например: Кабинет 201"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="label">Описание</label>
            <input
              className="input"
              placeholder="Необязательно"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary shrink-0">
            {adding ? "Добавляем..." : "Добавить"}
          </button>
        </form>
      </div>

      {/* Список кабинетов */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-paper-muted text-left text-ink-faint dark:bg-white/5 dark:text-white/40">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Описание</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line dark:divide-white/10">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-faint dark:text-white/30">
                  Нет кабинетов
                </td>
              </tr>
            ) : (
              rooms.map((room) =>
                editId === room.id ? (
                  <tr key={room.id} className="bg-brass-50/50 dark:bg-brass-600/10">
                    <td className="px-4 py-2">
                      <input
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="input"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(room.id)}
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? "..." : "Сохранить"}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="btn-secondary"
                        >
                          Отмена
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={room.id} className="text-ink dark:text-[#e2ede6]">
                    <td className="px-4 py-3 font-medium">{room.name}</td>
                    <td className="px-4 py-3 text-ink-soft dark:text-white/50">
                      {room.description || <span className="italic text-ink-faint dark:text-white/30">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(room)} className="btn-secondary">
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(room.id, room.name)}
                          className="btn-danger"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
