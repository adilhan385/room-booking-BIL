import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROOMS = [
  "Спортзал",
  "Уличное поле",
  "Ложман мужской",
  "Ложман женский",
  "Шахматный клуб / кабинет",
  "Кухня мужская",
  "Кухня женская",
  "Бассейн",
  "Кабинет информатики №1",
  "Кабинет информатики №2",
];

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "adilhananuar426@gmail.com";

async function main() {
  console.log("Сидирование комнат...");
  for (const name of ROOMS) {
    await prisma.room.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const existing = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });
  if (!existing) {
    const hashed = await bcrypt.hash("ChangeMe123!", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: SUPER_ADMIN_EMAIL,
        password: hashed,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Создан супер-админ: ${SUPER_ADMIN_EMAIL} / пароль по умолчанию: ChangeMe123!`);
  } else if (existing.role !== "SUPER_ADMIN") {
    await prisma.user.update({
      where: { email: SUPER_ADMIN_EMAIL },
      data: { role: "SUPER_ADMIN" },
    });
    console.log(`Пользователь ${SUPER_ADMIN_EMAIL} повышен до SUPER_ADMIN`);
  } else {
    console.log("Супер-админ уже существует.");
  }

  console.log("Сид завершён.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
