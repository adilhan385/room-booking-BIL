"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const linkClass = (href: string) =>
    `border-b-2 px-1 py-1 text-sm transition ${
      pathname === href
        ? "border-brass-500 text-ink"
        : "border-transparent text-ink-soft hover:border-paper-line hover:text-ink"
    }`;

  return (
    <header className="border-b border-paper-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
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
            </>
          )}

          {isSuperAdmin && (
            <Link href="/admin/users" className={linkClass("/admin/users")}>
              Пользователи
            </Link>
          )}

          {status === "authenticated" ? (
            <div className="ml-2 flex items-center gap-3 border-l border-paper-line pl-5">
              <span className="text-sm text-ink-faint">{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary">
                Выйти
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="ml-2 flex items-center gap-2 border-l border-paper-line pl-5">
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
