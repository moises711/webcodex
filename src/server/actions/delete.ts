"use server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/session";
import { canArchive, isSuperAdmin } from "@/lib/permissions";
import { refreshCatalog } from "@/lib/revalidate";
import type { ActionResult } from "./admin";

export async function deleteRecord(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const actor = await requireEditor();
  const parsed = z
    .object({
      id: z.string().cuid(),
      entity: z.enum(["Project", "Area", "User", "AuditLog"]),
      confirmation: z.literal("ELIMINAR"),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: true, message: "Escribe ELIMINAR para confirmar." };
  const { id, entity } = parsed.data;
  if (entity === "Area")
    return {
      error: true,
      message: "Las áreas actuales se conservan y no se pueden eliminar.",
    };
  if (entity !== "Project" && !isSuperAdmin(actor))
    return { error: true, message: "Acceso no autorizado." };
  try {
    await db.$transaction(
      async (tx) => {
        if (entity === "Project") {
          const project = await tx.project.findUnique({ where: { id } });
          if (!project || !canArchive(actor, project))
            throw new Error("No tienes permiso para eliminar este proyecto.");
          await tx.project.delete({ where: { id } });
        } else if (entity === "User") {
          if (id === actor.id)
            throw new Error("No puedes eliminar tu propia cuenta.");
          const user = await tx.user.findUniqueOrThrow({ where: { id } });
          if (
            user.role === "SUPER_ADMIN" &&
            user.isActive &&
            (await tx.user.count({
              where: { role: "SUPER_ADMIN", isActive: true },
            })) <= 1
          )
            throw new Error("Debe conservarse un super administrador activo.");
          await tx.project.updateMany({
            where: { createdById: id },
            data: { createdById: actor.id },
          });
          await tx.project.updateMany({
            where: { updatedById: id },
            data: { updatedById: null },
          });
          await tx.auditLog.updateMany({
            where: { userId: id },
            data: { userId: null },
          });
          await tx.passwordReset.deleteMany({ where: { userId: id } });
          await tx.user.delete({ where: { id } });
        } else {
          await tx.auditLog.delete({ where: { id } });
        }
        await tx.auditLog.create({
          data: {
            userId: actor.id,
            action: entity.toUpperCase() + "_DELETED",
            entity,
            entityId: id,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    refreshCatalog();
    return { message: "Registro eliminado." };
  } catch (error) {
    return {
      error: true,
      message:
        error instanceof Prisma.PrismaClientKnownRequestError
          ? "No se pudo eliminar. Recarga y vuelve a intentarlo."
          : error instanceof Error
            ? error.message
            : "No se pudo eliminar.",
    };
  }
}
