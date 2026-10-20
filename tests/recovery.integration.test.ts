import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomBytes, createHash, randomUUID } from "node:crypto";
import { hash, compare } from "bcryptjs";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: () => {} }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
import {
  resetPassword,
  requestPasswordReset,
} from "../src/server/actions/recovery";
const db = new PrismaClient();
const prefix = `reset-test-${randomUUID()}`;
let userId: string;
let token: string;
beforeAll(async () => {
  const user = await db.user.create({
    data: {
      name: "Reset test",
      email: `${prefix}@test.invalid`,
      passwordHash: await hash("Old-fixture-only", 12),
      mustChangePassword: true,
    },
  });
  userId = user.id;
  token = randomBytes(32).toString("base64url");
  await db.passwordReset.create({
    data: {
      userId,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60000),
    },
  });
});
afterAll(async () => {
  if (!userId) {
    await db.$disconnect();
    return;
  }
  await db.auditLog.deleteMany({ where: { userId } });
  await db.passwordReset.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } });
  await db.$disconnect();
});
it("changes the password, invalidates sessions and consumes the reset token once", async () => {
  const form = new FormData();
  form.set("token", token);
  form.set("password", "New-fixture-only-2026");
  form.set("confirmation", "New-fixture-only-2026");
  expect(await resetPassword("", form)).toContain("Contraseña actualizada");
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  expect(await compare("New-fixture-only-2026", user.passwordHash)).toBe(true);
  expect(user.sessionVersion).toBe(1);
  expect(user.mustChangePassword).toBe(false);
  expect(await resetPassword("", form)).toContain("ya fue utilizado");
});
it("rejects malformed reset tokens and avoids account enumeration", async () => {
  const invalid = new FormData();
  invalid.set("token", "malformed");
  invalid.set("password", "something-long");
  invalid.set("confirmation", "something-long");
  expect(await resetPassword("", invalid)).toContain("Revisa");
  const email = new FormData();
  email.set("email", `${prefix}@missing.invalid`);
  expect(await requestPasswordReset("", email)).toContain(
    "Si el correo corresponde",
  );
});
