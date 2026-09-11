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
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => setMounted(true), []);

  // Закрываем меню при переходе на другую страницу
  useEffect(() => setMenuOpen(false), [pathname]);

  // Подгружаем счётчик уведомлений для залогиненного пользователя
  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchCount = () =>
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setNotifCount(d.count ?? 0))
        .catch(() => {});

    fetchCount();
    // Проверяем каждые 30 секунд
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [status]);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const linkClass = (href: string) =>
    `border-b-2 px-1 py-1 text-sm transition ${
      pathname === href
        ? "border-brass-500 text-ink dark:text-zinc-100"
        : "border-transparent text-ink-soft hover:border-paper-line hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-100"
    }`;

  // Мобильный стиль ссылок
  const mobileLinkClass = (href: string) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      pathname === href
        ? "bg-brass-50 text-brass-700 dark:bg-zinc-800 dark:text-zinc-100"
        : "text-ink-soft hover:bg-paper-muted hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    }`;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link href="/" className={mobile ? mobileLinkClass("/") : linkClass("/")}>
        Комнаты
      </Link>

      {status === "authenticated" && (
        <Link
          href="/dashboard"
          className={mobile ? mobileLinkClass("/dashboard") : linkClass("/dashboard")}
        >
          <span className="relative inline-flex items-center gap-1">
            Мои заявки
            {notifCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold text-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </span>
        </Link>
      )}

      {isAdmin && (
        <>
          <Link href="/admin" className={mobile ? mobileLinkClass("/admin") : linkClass("/admin")}>
            Заявки
          </Link>
          <Link href="/admin/active" className={mobile ? mobileLinkClass("/admin/active") : linkClass("/admin/active")}>
            Активные брони
          </Link>
          <Link href="/admin/rooms" className={mobile ? mobileLinkClass("/admin/rooms") : linkClass("/admin/rooms")}>
            Кабинеты
          </Link>
        </>
      )}

      {isSuperAdmin && (
        <Link href="/admin/users" className={mobile ? mobileLinkClass("/admin/users") : linkClass("/admin/users")}>
          Пользователи
        </Link>
      )}
    </>
  );

  return (
    <header className="border-b border-paper-line bg-paper dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold text-ink dark:text-zinc-100">
          Расписание помещений
        </Link>

        {/* Десктоп-навигация */}
        <div className="hidden items-center gap-5 md:flex">
          <NavLinks />

          {/* Кнопка смены темы */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-ink-soft transition hover:bg-paper-muted dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Переключить тему"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
          )}

          {status === "authenticated" ? (
            <div className="ml-2 flex items-center gap-3 border-l border-paper-line pl-5 dark:border-zinc-800">
              <span className="text-sm text-ink-faint dark:text-zinc-400">{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary">
                Выйти
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="ml-2 flex items-center gap-2 border-l border-paper-line pl-5 dark:border-zinc-800">
              <Link href="/login" className="btn-secondary">Войти</Link>
              <Link href="/register" className="btn-primary">Регистрация</Link>
            </div>
          ) : null}
        </div>

        {/* Мобильный правый угол */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Кнопка темы на мобиле */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-ink-soft transition hover:bg-paper-muted dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Переключить тему"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
          )}

          {/* Бургер-кнопка */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="relative rounded-md p-2 text-ink-soft transition hover:bg-paper-muted dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Открыть меню"
          >
            {/* Показываем точку если есть уведомления */}
            {notifCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rust-500" />
            )}
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {menuOpen && (
        <div className="border-t border-paper-line bg-paper px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <nav className="space-y-1">
            <NavLinks mobile />
          </nav>

          <div className="mt-3 border-t border-paper-line pt-3 dark:border-zinc-800">
            {status === "authenticated" ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-faint dark:text-zinc-400">{session.user?.name}</span>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-xs">
                  Выйти
                </button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="flex gap-2">
                <Link href="/login" className="btn-secondary flex-1 text-center">Войти</Link>
                <Link href="/register" className="btn-primary flex-1 text-center">Регистрация</Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
