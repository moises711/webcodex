"use server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/session";
import { canManageArea, isSuperAdmin } from "@/lib/permissions";
import { refreshCatalog } from "@/lib/revalidate";
export type ActionResult = {
  message: string;
  error?: boolean;
  temporaryPassword?: string;
};
async function superAdmin() {
  const user = await requireEditor();
  if (!isSuperAdmin(user)) throw new Error("Acceso no autorizado");
  return user;
}
const imageUrl = z
  .string()
  .max(2000)
  .refine(
    (value) =>
      !value ||
      (/^\/(brand|resources|api\/media)\/[a-zA-Z0-9._/-]+$/.test(value) &&
        !value
          .split("/")
          .some((segment) => segment === "." || segment === "..")) ||
      (!!process.env.STORAGE_PUBLIC_URL &&
        value.startsWith(
          process.env.STORAGE_PUBLIC_URL.replace(/\/$/, "") + "/",
        )),
    "Usa una imagen del almacenamiento configurado",
  );
export async function saveArea(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const user = await requireEditor();
  const parsed = z
    .object({
      id: z.string().cuid().optional(),
      name: z.string().trim().min(2).max(100),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(100),
      description: z.string().max(2000),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      icon: z.enum(["Code2", "Palette", "Headphones", "ShieldCheck"]),
      coverImageUrl: imageUrl,
      seoTitle: z.string().trim().max(160).optional(),
      seoDescription: z.string().trim().max(300).optional(),
      seoKeywords: z.string().trim().max(1000).optional(),
      isActive: z.boolean(),
    })
    .safeParse({
      id: form.get("id") || undefined,
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      color: form.get("color"),
      icon: form.get("icon"),
      coverImageUrl: form.get("coverImageUrl") || "",
      seoTitle: form.get("seoTitle") ?? undefined,
      seoDescription: form.get("seoDescription") ?? undefined,
      seoKeywords: form.get("seoKeywords") ?? undefined,
      isActive: form.get("isActive") === "on",
    });
  if (!parsed.success)
    return {
      message: "Revisa los datos del área: nombre, slug, color e imagen.",
      error: true,
    };
  const { id, ...data } = parsed.data;
  if (!id)
    return {
      error: true,
      message:
        "El portal mantiene las áreas actuales. No se pueden crear áreas nuevas.",
    };
  if (id ? !canManageArea(user, id) : !isSuperAdmin(user))
    return {
      message: "No tienes permiso para gestionar esta área",
      error: true,
    };
  if (!isSuperAdmin(user) && data.coverImageUrl.startsWith("/api/media/")) {
    const [ownCover, ownMedia] = await Promise.all([
      db.area.findFirst({ where: { id, coverImageUrl: data.coverImageUrl } }),
      db.media.findFirst({
        where: { url: data.coverImageUrl, project: { areaId: id } },
      }),
    ]);
    if (!ownCover && !ownMedia)
      return { message: "La imagen no pertenece a esta área", error: true };
  }
  try {
    const area = await db.$transaction(async (tx) => {
      const value = id
        ? await tx.area.update({ where: { id }, data })
        : await tx.area.create({
            data: { ...data, order: await tx.area.count() },
          });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: id ? "AREA_UPDATED" : "AREA_CREATED",
          entity: "Area",
          entityId: value.id,
        },
      });
      return value;
    });
    refreshCatalog();
    return { message: `Área ${area.name} guardada` };
  } catch {
    return {
      message: "No se pudo guardar. El nombre y slug deben ser únicos.",
      error: true,
    };
  }
}
export async function deleteArea(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  await superAdmin();
  void form;
  return {
    error: true,
    message:
      "Las áreas actuales se conservan. Puedes actualizar su información y proyectos.",
  };
}

export async function reorderAreas(input: unknown) {
  const user = await superAdmin();
  const ids = z.array(z.string().cuid()).max(100).parse(input);
  const all = await db.area.findMany({ select: { id: true } });
  if (
    ids.length !== all.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !all.some((a) => a.id === id))
  )
    return { error: "La lista cambió. Recarga antes de reordenar." };
  await db.$transaction([
    ...ids.map((id, order) =>
      db.area.update({ where: { id }, data: { order } }),
    ),
    db.auditLog.create({
      data: {
        userId: user.id,
        action: "AREAS_REORDERED",
        entity: "Area",
        entityId: "all",
      },
    }),
  ]);
  refreshCatalog();
  return { message: "Orden guardado" };
}
export async function saveUser(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const actor = await superAdmin();
  const parsed = z
    .object({
      id: z.string().cuid().optional(),
      name: z.string().trim().min(2).max(100),
      email: z
        .email()
        .max(254)
        .transform((v) => v.toLowerCase()),
      role: z.enum(["SUPER_ADMIN", "AREA_ADMIN", "EDITOR", "INTERNAL"]),
      isActive: z.boolean(),
      areaIds: z.array(z.string().cuid()).max(100),
      managerIds: z.array(z.string().cuid()).max(100),
    })
    .safeParse({
      id: form.get("id") || undefined,
      name: form.get("name"),
      email: form.get("email"),
      role: form.get("role"),
      isActive: form.get("isActive") === "on",
      areaIds: form.getAll("areaIds"),
      managerIds: form.getAll("managerIds"),
    });
  if (!parsed.success)
    return { message: "Revisa nombre, correo y rol", error: true };
  const { id, areaIds, managerIds, ...data } = parsed.data;
  if (
    data.role !== "SUPER_ADMIN" &&
    data.role !== "INTERNAL" &&
    !areaIds.length
  )
    return { message: "Asigna al menos un área", error: true };
  if (managerIds.some((areaId) => !areaIds.includes(areaId)))
    return { message: "Un responsable debe pertenecer al área", error: true };
  if (data.role === "INTERNAL" && managerIds.length)
    return { message: "Un usuario interno no administra áreas", error: true };
  if (id === actor.id && (!data.isActive || data.role !== "SUPER_ADMIN"))
    return {
      message: "No puedes quitar tu propio acceso de super administrador",
      error: true,
    };
  const existing = id ? await db.user.findUnique({ where: { id } }) : null;
  if (id && !existing) return { message: "Usuario no disponible", error: true };
  if (
    existing?.role === "SUPER_ADMIN" &&
    existing.isActive &&
    (!data.isActive || data.role !== "SUPER_ADMIN") &&
    (await db.user.count({ where: { role: "SUPER_ADMIN", isActive: true } })) <=
      1
  )
    return {
      message: "Debe conservarse al menos un super administrador activo",
      error: true,
    };
  const areas = await db.area.findMany({ where: { id: { in: areaIds } } });
  if (areas.length !== new Set(areaIds).size)
    return { message: "Área inválida", error: true };
  const password = id ? undefined : randomBytes(18).toString("base64url");
  try {
    await db.$transaction(
      async (tx) => {
        if (id) {
          const target = await tx.user.findUnique({ where: { id } });
          if (
            target?.role === "SUPER_ADMIN" &&
            target.isActive &&
            (!data.isActive || data.role !== "SUPER_ADMIN") &&
            (await tx.user.count({
              where: { role: "SUPER_ADMIN", isActive: true },
            })) <= 1
          )
            throw new Error("Debe conservarse un administrador activo");
        }
        const user = id
          ? await tx.user.update({
              where: { id },
              data: { ...data, sessionVersion: { increment: 1 } },
            })
          : await tx.user.create({
              data: {
                ...data,
                passwordHash: await hash(password!, 12),
                mustChangePassword: true,
              },
            });
        await tx.userArea.deleteMany({ where: { userId: user.id } });
        await tx.userArea.createMany({
          data: areaIds.map((areaId) => ({
            userId: user.id,
            areaId,
            isManager: managerIds.includes(areaId),
          })),
        });
        await tx.auditLog.create({
          data: {
            userId: actor.id,
            action: id ? "USER_UPDATED" : "USER_CREATED",
            entity: "User",
            entityId: user.id,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    refreshCatalog();
    return {
      message: id
        ? "Usuario actualizado. Sus sesiones anteriores se invalidaron."
        : "Usuario creado. Entrega la clave temporal de forma privada; deberá cambiarla al ingresar.",
      ...(password ? { temporaryPassword: password } : {}),
    };
  } catch {
    return {
      message: "No se pudo guardar. Verifica que el correo sea único.",
      error: true,
    };
  }
}
export async function assignEditor(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const actor = await requireEditor();
  const parsed = z
    .object({
      areaId: z.string().cuid(),
      userId: z.string().cuid(),
      enabled: z.boolean(),
    })
    .safeParse({
      areaId: form.get("areaId"),
      userId: form.get("userId"),
      enabled: form.get("enabled") === "on",
    });
  if (!parsed.success || !canManageArea(actor, parsed.data.areaId))
    return { message: "Acceso no autorizado", error: true };
  const value = parsed.data;
  const user = await db.user.findFirst({
    where: { id: value.userId, role: "EDITOR", isActive: true },
  });
  if (!user)
    return { message: "Solo se pueden asignar editores activos", error: true };
  const membership = await db.userArea.findUnique({
    where: { userId_areaId: { userId: user.id, areaId: value.areaId } },
  });
  if (membership?.isManager)
    return {
      message: "El acceso de un responsable lo gestiona el super administrador",
      error: true,
    };
  await db.$transaction(async (tx) => {
    if (value.enabled)
      await tx.userArea.upsert({
        where: { userId_areaId: { userId: user.id, areaId: value.areaId } },
        update: {},
        create: { userId: user.id, areaId: value.areaId },
      });
    else {
      if ((await tx.userArea.count({ where: { userId: user.id } })) <= 1)
        return;
      await tx.userArea.deleteMany({
        where: { userId: user.id, areaId: value.areaId },
      });
    }
    await tx.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "TEAM_UPDATED",
        entity: "Area",
        entityId: value.areaId,
      },
    });
  });
  refreshCatalog();
  return {
    message: "Equipo actualizado. Cada editor debe conservar al menos un área.",
  };
}
export async function saveSettings(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const user = await superAdmin();
  const parsed = z
    .object({
      siteName: z.string().trim().min(2).max(100),
      logoUrl: imageUrl,
      contactEmail: z.union([z.email(), z.literal("")]),
      notice: z.string().max(5000),
      requireReview: z.boolean(),
    })
    .safeParse({
      siteName: form.get("siteName"),
      logoUrl: form.get("logoUrl") || "",
      contactEmail: form.get("contactEmail") || "",
      notice: form.get("notice") || "",
      requireReview: form.get("requireReview") === "on",
    });
  if (!parsed.success)
    return { message: "Revisa los ajustes del sitio", error: true };
  await db.$transaction([
    db.siteSettings.upsert({
      where: { id: 1 },
      update: parsed.data,
      create: { id: 1, ...parsed.data },
    }),
    db.auditLog.create({
      data: {
        userId: user.id,
        action: "SETTINGS_UPDATED",
        entity: "SiteSettings",
        entityId: "1",
      },
    }),
  ]);
  refreshCatalog();
  return { message: "Ajustes guardados" };
}
