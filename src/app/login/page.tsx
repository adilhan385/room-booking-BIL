"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-6 font-display text-xl font-semibold dark:text-zinc-100">
          Вход в систему
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Кнопка Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-md border border-paper-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-muted dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.4 5.6-5 7.3v6h8c4.7-4.3 7.3-10.7 7.3-17.6z" fill="#4285F4"/>
            <path d="M24 48c6.5 0 12-2.1 16-5.8l-8-6c-2.1 1.4-4.8 2.3-8 2.3-6.2 0-11.4-4.1-13.3-9.7H2.5v6.2C6.5 42.7 14.7 48 24 48z" fill="#34A853"/>
            <path d="M10.7 28.8c-.5-1.4-.8-2.9-.8-4.8s.3-3.4.8-4.8v-6.2H2.5C.9 16.2 0 19.9 0 24s.9 7.8 2.5 11z" fill="#FBBC05"/>
            <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.3 2.5 13l8.2 6.2C12.6 13.7 17.8 9.5 24 9.5z" fill="#EA4335"/>
          </svg>
          Войти через Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-paper-line dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs text-ink-faint dark:text-zinc-500">
            <span className="bg-white px-2 dark:bg-zinc-900">или</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-faint dark:text-zinc-400">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-brass-600">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
