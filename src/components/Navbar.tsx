"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Нужно для next-themes: избегаем mismatch при SSR
  useEffect(() => setMounted(true), []);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const linkClass = (href: string) =>
    `border-b-2 px-1 py-1 text-sm transition ${
      pathname === href
        ? "border-brass-500 text-ink dark:text-[#e2ede6]"
        : "border-transparent text-ink-soft hover:border-paper-line hover:text-ink dark:text-[#a8bfad] dark:hover:text-[#e2ede6]"
    }`;

  return (
    <header className="border-b border-paper-line bg-paper dark:border-white/10 dark:bg-[#161c18]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink dark:text-[#e2ede6]">
          Расписание помещений
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/" className={linkClass("/")}>
            Комнаты
          </Link>

          {status === "authenticated" && (
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Мои заявки
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/admin" className={linkClass("/admin")}>
                Заявки
              </Link>
              <Link href="/admin/active" className={linkClass("/admin/active")}>
                Активные брони
              </Link>
              <Link href="/admin/rooms" className={linkClass("/admin/rooms")}>
                Кабинеты
              </Link>
            </>
          )}

          {isSuperAdmin && (
            <Link href="/admin/users" className={linkClass("/admin/users")}>
              Пользователи
            </Link>
          )}

          {/* Кнопка смены темы */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-ink-soft transition hover:bg-paper-muted dark:text-[#a8bfad] dark:hover:bg-white/10"
              aria-label="Переключить тему"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? (
                /* Sun icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                /* Moon icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
          )}

          {status === "authenticated" ? (
            <div className="ml-2 flex items-center gap-3 border-l border-paper-line pl-5 dark:border-white/10">
              <span className="text-sm text-ink-faint dark:text-white/40">{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary">
                Выйти
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="ml-2 flex items-center gap-2 border-l border-paper-line pl-5 dark:border-white/10">
              <Link href="/login" className="btn-secondary">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Регистрация
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
