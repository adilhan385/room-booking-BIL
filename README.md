# Room Booking System — Система бронирования помещений

Полноценное веб-приложение на **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + NextAuth.js**.

## Возможности

- Каталог из 10 фиксированных помещений с индикатором занятости на сегодня.
- Регистрация / вход (email + пароль, хеширование bcrypt).
- Роли: `USER`, `ADMIN`, `SUPER_ADMIN`.
  - `adilhananuar426@gmail.com` автоматически получает роль `SUPER_ADMIN` при регистрации или сид-инициализации базы.
- Заявки на бронирование с полями: дата, время начала/окончания, класс, ФИО ответственного, цель.
- Проверка накладок: заявка не создастся/не одобрится, если время пересекается с уже **одобренной** бронью той же комнаты.
- Статусы заявок: `PENDING → APPROVED / REJECTED`, причина отказа сохраняется и видна пользователю.
- Админ-панель: рассмотрение заявок (принять/отклонить с причиной), список активных броней с отменой в один клик.
- Панель супер-админа: список всех пользователей, переключение роли `USER ⇄ ADMIN`.

## Стек

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Prisma ORM + SQLite (по умолчанию, можно переключить на PostgreSQL)
- NextAuth.js (Credentials Provider, JWT-сессии) + bcryptjs

## Структура проекта

```
room-booking-system/
├── prisma/
│   ├── schema.prisma        # модели User, Room, Booking
│   └── seed.ts               # сидирует 10 комнат + супер-админа
├── src/
│   ├── app/
│   │   ├── page.tsx                    # главная — список комнат
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── rooms/[id]/page.tsx         # расписание комнаты + форма брони
│   │   ├── dashboard/page.tsx          # "Мои заявки" для пользователя
│   │   ├── admin/page.tsx              # заявки на рассмотрение
│   │   ├── admin/active/page.tsx       # активные брони, отмена
│   │   ├── admin/users/page.tsx        # управление ролями (SUPER_ADMIN)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── register/route.ts
│   │       ├── rooms/route.ts
│   │       ├── rooms/[id]/bookings/route.ts
│   │       ├── bookings/route.ts       # GET (список) / POST (создать)
│   │       ├── bookings/[id]/route.ts  # PATCH (одобрить/отклонить) / DELETE (отменить)
│   │       └── admin/users/route.ts, admin/users/[id]/route.ts
│   ├── components/           # Navbar, RoomCard, BookingForm, StatusBadge, Providers
│   ├── lib/                  # prisma.ts, auth.ts
│   ├── middleware.ts         # защита /dashboard и /admin по ролям
│   └── types/next-auth.d.ts
└── package.json
```

## Запуск локально

Схема по умолчанию настроена на **SQLite** — ничего устанавливать и настраивать в облаке не нужно, база — это просто файл рядом с проектом.

### 1. Установка зависимостей

```bash
cd room-booking-system
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

`DATABASE_URL` менять не нужно — там уже стоит SQLite-файл. Впишите только `NEXTAUTH_SECRET`, сгенерировав его:
```bash
openssl rand -base64 32
```

### 3. Миграция базы данных и сид

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

Это создаст файл `prisma/dev.db`, добавит 10 помещений и учётку супер-администратора:

- **Email:** `adilhananuar426@gmail.com`
- **Пароль по умолчанию:** `ChangeMe123!` (обязательно смените после первого входа — эндпоинта смены пароля в этой версии нет, обновите вручную через Prisma Studio или зарегистрируйте нового пользователя с этим email, если он ещё не существует, — тогда пароль зададите сами при регистрации).

> Если вы хотите задать пароль супер-админа сразу через обычную регистрацию — просто удалите строку с `existing` из `prisma/seed.ts` перед первым запуском сида, либо зарегистрируйтесь через `/register`, указав `adilhananuar426@gmail.com`: роль `SUPER_ADMIN` присвоится автоматически.

### 4. Запуск dev-сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### 5. Просмотр базы данных (опционально)

```bash
npx prisma studio
```

## Деплой на Vercel

### Шаг 1. Создайте бесплатную PostgreSQL-базу

Проще всего прямо из Vercel:
1. Зайдите в проект на [vercel.com](https://vercel.com) → вкладка **Storage** → **Create Database** → **Postgres** (это Neon под капотом).
   Альтернатива — создать базу напрямую на [neon.tech](https://neon.tech) или [supabase.com](https://supabase.com), бесплатный тариф есть у обоих.
2. Скопируйте строку подключения (`DATABASE_URL`), она обычно выглядит так:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

### Шаг 2. Выложите код на GitHub

```bash
git init
git add .
git commit -m "Room booking system"
git branch -M main
git remote add origin https://github.com/ВАШ_АККАУНТ/room-booking-system.git
git push -u origin main
```

### Шаг 3. Импортируйте проект в Vercel

1. На [vercel.com](https://vercel.com) → **Add New** → **Project** → выберите репозиторий из GitHub.
2. Framework Preset определится автоматически как **Next.js** — ничего менять не нужно.
3. В разделе **Environment Variables** добавьте:

   | Переменная | Значение |
   |---|---|
   | `DATABASE_URL` | строка подключения из Шага 1 |
   | `NEXTAUTH_SECRET` | сгенерируйте: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | адрес вашего деплоя, например `https://room-booking-system.vercel.app` (можно проставить после первого деплоя и передеплоить) |
   | `SUPER_ADMIN_EMAIL` | `adilhananuar426@gmail.com` |

4. Нажмите **Deploy**.

### Шаг 4. Накатите миграции и сид на боевую базу

Vercel сам выполнит `prisma generate` (через `postinstall`), но таблицы нужно создать отдельно — сделайте это один раз со своего компьютера, указав тот же `DATABASE_URL`, что и на Vercel:

```bash
# в .env локально должен быть тот же DATABASE_URL, что вы вписали в Vercel
npx prisma migrate deploy
npm run prisma:seed
```

После этого откройте ваш `https://ваш-проект.vercel.app` — приложение готово к работе, супер-админ уже создан.

### Обновления в будущем

При новых миграциях (`prisma/migrations`) перед следующим деплоем достаточно один раз выполнить `npx prisma migrate deploy` с боевым `DATABASE_URL` — сам код на Vercel обновится автоматически при `git push`.

## Локальная разработка на SQLite (без облачной базы)

Если не хотите поднимать PostgreSQL для локальной разработки:

1. В `prisma/schema.prisma` смените:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. В `.env`: `DATABASE_URL="file:./dev.db"`
3. `npx prisma migrate dev --name init && npm run prisma:seed`

⚠️ Перед деплоем на Vercel не забудьте вернуть `provider = "postgresql"` и пересоздать миграции (`npx prisma migrate dev --name init`) уже под Postgres — миграции SQLite и PostgreSQL не взаимозаменяемы.

## Роли и права доступа

| Действие                                   | USER | ADMIN | SUPER_ADMIN |
|---------------------------------------------|:----:|:-----:|:-----------:|
| Просмотр комнат и расписания                | ✅   | ✅    | ✅           |
| Создание заявки на бронь                    | ✅   | ✅    | ✅           |
| Просмотр статуса своих заявок                | ✅   | ✅    | ✅           |
| Просмотр всех заявок                         | ❌   | ✅    | ✅           |
| Одобрение / отклонение заявок                | ❌   | ✅    | ✅           |
| Отмена активной брони                        | ❌   | ✅    | ✅           |
| Просмотр списка пользователей                | ❌   | ❌    | ✅           |
| Назначение / снятие роли ADMIN               | ❌   | ❌    | ✅           |

**Изменение роли применяется без перелогина.** Когда супер-админ назначает пользователя администратором (или снимает права), новая роль подтягивается из базы автоматически — в течение минуты (фоновое обновление сессии) или сразу при переключении вкладки/фокусе окна у этого пользователя. Если нужно применить изменение мгновенно, пользователю достаточно обновить страницу (F5).

## Логика предотвращения накладок

1. При **создании** заявки система ищет пересечения по времени только среди заявок в статусе `APPROVED` для той же комнаты и даты. Если пересечение найдено — заявка отклоняется на уровне API с ошибкой 409.
2. Заявка в статусе `PENDING` **не блокирует** слот — несколько пользователей могут подать заявки на одно и то же время.
3. При **одобрении** заявки повторно проверяются пересечения (на случай, если админ одновременно одобрил две заявки на одно время) — вторая попытка будет отклонена с ошибкой.
4. После одобрения слот считается занятым и отображается в расписании комнаты и на главной странице.

## Примечания по production

- Смените `SUPER_ADMIN_EMAIL` в `.env`, если нужен другой email супер-администратора.
- Обязательно задайте надёжный `NEXTAUTH_SECRET` и корректный `NEXTAUTH_URL` в проде.
- Для production рекомендуется PostgreSQL вместо SQLite.
