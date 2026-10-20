import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { createHash } from "node:crypto";

const db = new PrismaClient();
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 8)
    throw new Error(
      "Configura SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD (mínimo 8 caracteres).",
    );
  const passwordHash = await hash(password, 12);
  const keys = ["email:" + email, "pair:" + email + ":local"].map((key) =>
    createHash("sha256").update(key).digest("hex"),
  );
  await db.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { email },
      create: {
        name: "Administrador Códex",
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
        mustChangePassword: false,
      },
      update: {
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    });
    await tx.loginAttempt.deleteMany({ where: { key: { in: keys } } });
  });
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  if (
    !user.isActive ||
    user.role !== "SUPER_ADMIN" ||
    !(await compare(password, user.passwordHash))
  )
    throw new Error("No se pudo verificar la cuenta de administrador.");
  console.log("Cuenta de administrador habilitada y contraseña verificada.");
}
main()
  .catch(() => {
    console.error(
      "No se pudo completar el seeder de administrador. Revisa la configuración y la conexión a la base de datos.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
