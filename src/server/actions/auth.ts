"use server";
import { AuthError } from "next-auth";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { consumeRequestLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { requireActor } from "@/lib/session";
export async function login(_previous: string, form: FormData) {
  const parsed = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(128) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return "Revisa tu correo y contraseña.";
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/panel" });
  } catch (error) {
    if (error instanceof AuthError)
      return "No se pudo ingresar. Revisa tus datos o espera 15 minutos si agotaste los intentos.";
    throw error;
  }
  return "";
}
export async function logout() {
  await signOut({ redirectTo: "/" });
}
export async function changePassword(_previous: string, form: FormData) {
  const user = await requireActor();
  const parsed = z
    .object({
      current: z.string().min(1).max(128),
      password: z
        .string()
        .min(10)
        .max(72)
        .refine(
          (v) => Buffer.byteLength(v, "utf8") <= 72,
          "La contraseña supera 72 bytes",
        ),
      confirmation: z.string(),
    })
    .refine((x) => x.password === x.confirmation, {
      message: "Las contraseñas no coinciden",
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return parsed.error.issues[0].message;
  if (!(await consumeRequestLimit("password-change", user.id, 5, 900)))
    return "Demasiados intentos. Espera 15 minutos.";
  const stored = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await compare(parsed.data.current, stored.passwordHash)))
    return "La contraseña actual no es válida.";
  await db.$transaction([
    db.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(parsed.data.password, 12),
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    }),
    db.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGED",
        entity: "User",
        entityId: user.id,
      },
    }),
  ]);
  await signOut({ redirectTo: "/ingresar" });
  return "";
}
