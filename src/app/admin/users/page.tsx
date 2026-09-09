"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  USER: "Пользователь",
  ADMIN: "Администратор",
  SUPER_ADMIN: "Супер-админ",
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(id: string) {
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Не удалось изменить роль");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Пользователи</h1>

      {error && <div className="mb-4 rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">{error}</div>}

      {loading ? (
        <p className="text-ink-faint">Загрузка...</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-paper-muted text-left text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Дата регистрации</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-ink/10 text-ink"
                          : u.role === "ADMIN"
                          ? "bg-brass-100 text-brass-600"
                          : "bg-gray-100 text-ink-soft"
                      }`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "SUPER_ADMIN" && (
                      <button onClick={() => toggleRole(u.id)} className="btn-secondary">
                        {u.role === "ADMIN" ? "Забрать права админа" : "Назначить админом"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
