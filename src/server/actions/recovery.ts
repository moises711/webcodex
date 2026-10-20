"use server";
import { after } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { clientAddress } from "@/lib/request-security";
import { consumeRequestLimit, consumeLoginAttempt } from "@/lib/rate-limit";
const generic =
  "Si el correo corresponde a una cuenta activa y el envío está configurado, recibirás un enlace de recuperación.";
export async function requestPasswordReset(_previous: string, form: FormData) {
  const email = z.email().max(254).safeParse(form.get("email"));
  if (!email.success) return "Escribe un correo válido.";
  const normalized = email.data.toLowerCase();
  if (
    !(await consumeRequestLimit(
      "recovery-ip",
      clientAddress(await headers()),
      10,
      900,
    ))
  )
    return generic;
  if (!(await consumeLoginAttempt(`recovery:${normalized}`, "recovery")))
    return generic;
  after(async () => {
    try {
      const user = await db.user.findFirst({
        where: { email: normalized, isActive: true },
      });
      if (!user || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
        return;
      const token = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const base = new URL(process.env.APP_URL || "http://localhost:3000");
      const url = new URL("/restablecer", base);
      url.searchParams.set("token", token);
      const record = await db.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM,
            to: [normalized],
            subject: "Recupera tu acceso a Códex Cusco",
            html: `<p>Solicitaste recuperar tu acceso.</p><p><a href="${url.toString().replace(/&/g, "&amp;")}">Restablecer contraseña</a></p><p>El enlace vence en 30 minutos. Si no hiciste esta solicitud, puedes ignorarla.</p>`,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
          await db.passwordReset.delete({ where: { id: record.id } });
      } catch {
        await db.passwordReset.deleteMany({ where: { id: record.id } });
      }
    } catch {
      console.error("No se pudo procesar la recuperación de acceso.");
    }
  });
  return generic;
}
export async function resetPassword(_previous: string, form: FormData) {
  const parsed = z
    .object({
      token: z.string().regex(/^[a-zA-Z0-9_-]{43}$/),
      password: z
        .string()
        .min(10)
        .max(72)
        .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
      confirmation: z.string(),
    })
    .refine((value) => value.password === value.confirmation)
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return "Revisa el enlace y usa contraseñas coincidentes de al menos 10 caracteres.";
  if (
    !(await consumeRequestLimit(
      "reset-ip",
      clientAddress(await headers()),
      20,
      900,
    ))
  )
    return "Demasiados intentos. Espera 15 minutos.";
  const tokenHash = createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const record = await db.passwordReset.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date())
    return "El enlace venció o ya fue utilizado.";
  const passwordHash = await hash(parsed.data.password, 12);
  const updated = await db.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: record.userId, isActive: true },
    });
    if (!user) return false;
    const consumed = await tx.passwordReset.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) return false;
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    });
    await tx.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: user.id,
      },
    });
    return true;
  });
  return updated
    ? "Contraseña actualizada. Ya puedes ingresar con tu nueva clave."
    : "El enlace venció o no está disponible.";
}
