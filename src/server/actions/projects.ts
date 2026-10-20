"use server";
import { hasContentMedia } from "@/lib/content-rules";
import { stringList } from "@/lib/string-list";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/session";
import { canEditProject, canPublish, canArchive } from "@/lib/permissions";
import { projectSchema, parseList } from "@/lib/validators/project";
import { encryptCredential } from "@/lib/crypto";
import { refreshCatalog } from "@/lib/revalidate";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { randomBytes } from "node:crypto";
const idSchema = z.string().cuid();
async function uniqueSlug(title: string) {
  const base =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "proyecto";
  let slug = base,
    n = 1;
  while (
    await db.project.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${base}-${++n}`;
  }
  return slug;
}
export async function saveProject(id: unknown, input: unknown) {
  const user = await requireEditor();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const value = parsed.data;
  const projectId = id ? idSchema.parse(id) : null;
  const existing = projectId
    ? await db.project.findUnique({
        where: { id: projectId },
        include: { system: { include: { credentials: true } }, media: true },
      })
    : null;
  if (projectId && (!existing || !canEditProject(user, existing)))
    return { error: "No tienes permiso para editar este proyecto" };
  if (!canEditProject(user, { areaId: value.areaId }))
    return { error: "No puedes guardar en esta área" };
  const area = await db.area.findFirst({
    where: { id: value.areaId, isActive: true },
  });
  if (!area) return { error: "Área no disponible" };
  if (
    (value.type === "WEBSITE" || value.type === "SYSTEM") &&
    area.slug !== "sistemas"
  )
    return {
      error:
        "Las páginas web y los sistemas administrativos son exclusivos del área Sistemas",
    };
  if (
    existing &&
    value.areaId !== existing.areaId &&
    user.role !== "SUPER_ADMIN"
  )
    return { error: "No puedes cambiar el área del proyecto" };
  for (const credential of value.credentials) {
    if (
      credential.id &&
      !existing?.system?.credentials.some((c) => c.id === credential.id)
    )
      return { error: "Credencial no válida" };
    if (!credential.id && !credential.password)
      return { error: "Las credenciales nuevas requieren contraseña" };
  }
  const reviewSettings = await db.siteSettings.findUnique({ where: { id: 1 } });
  const needsReview =
    existing?.status === "PUBLISHED" &&
    reviewSettings?.requireReview &&
    !canPublish(user, existing, true);
  if (existing?.status === "PUBLISHED" && !needsReview) {
    if (
      !value.workDate ||
      !hasContentMedia(area.slug, existing.coverMediaId, value.coverLinkUrl)
    )
      return {
        error:
          "Agrega la fecha del trabajo y una foto de portada para mantenerlo publicado",
      };
    if (
      value.type === "SYSTEM" &&
      !value.credentials.some(
        (c) =>
          c.isActive &&
          (c.password ||
            existing.system?.credentials.some(
              (saved) => saved.id === c.id && saved.passwordEnc,
            )),
      )
    )
      return {
        error:
          "Agrega al menos una credencial activa para mantener el sistema publicado",
      };
  }
  const data = {
    ...(needsReview ? { status: "IN_REVIEW" as const } : {}),
    coverLinkUrl: value.coverLinkUrl || null,
    coverLinkText:
      value.type === "WEBSITE"
        ? "Visitar página web"
        : value.coverLinkText || null,
    title: value.title,
    summary: value.summary,
    areaId: value.areaId,
    type: value.type,
    workDate: value.workDate
      ? new Date(`${value.workDate}T00:00:00.000Z`)
      : null,
    year: value.workDate ? Number(value.workDate.slice(0, 4)) : value.year,
    tags: parseList(value.tags),
    techStack: parseList(value.techStack),
    isFeatured: value.isFeatured,
    content: value.content as Prisma.InputJsonValue,
    updatedById: user.id,
  };
  const slug = existing?.slug || (await uniqueSlug(value.title));
  const saved = await db.$transaction(async (tx) => {
    const p = existing
      ? await tx.project.update({ where: { id: existing.id }, data })
      : await tx.project.create({
          data: { ...data, slug, createdById: user.id },
        });
    if (value.type === "SYSTEM") {
      const system = await tx.systemInfo.upsert({
        where: { projectId: p.id },
        update: {
          systemName: value.systemName,
          url: value.systemUrl,
          environment: value.environment,
          credentialVisibility: value.credentialVisibility,
        },
        create: {
          projectId: p.id,
          systemName: value.systemName,
          url: value.systemUrl,
          environment: value.environment,
          credentialVisibility: value.credentialVisibility,
        },
      });
      const keep = value.credentials.flatMap((c) => (c.id ? [c.id] : []));
      await tx.demoCredential.deleteMany({
        where: { systemInfoId: system.id, id: { notIn: keep } },
      });
      for (const c of value.credentials) {
        const credentialData = {
          label: c.label,
          username: c.username,
          notes: c.notes,
          isActive: c.isActive,
          ...(c.password ? { passwordEnc: encryptCredential(c.password) } : {}),
        };
        if (c.id)
          await tx.demoCredential.update({
            where: { id: c.id },
            data: credentialData,
          });
        else
          await tx.demoCredential.create({
            data: {
              ...credentialData,
              passwordEnc: encryptCredential(c.password),
              systemInfoId: system.id,
            },
          });
      }
    } else if (existing?.system)
      await tx.systemInfo.delete({ where: { id: existing.system.id } });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: existing ? "PROJECT_UPDATED" : "PROJECT_CREATED",
        entity: "Project",
        entityId: p.id,
      },
    });
    return p;
  });
  refreshCatalog();
  return { id: saved.id, message: "Proyecto guardado" };
}
export async function setProjectStatus(id: unknown, status: unknown) {
  const user = await requireEditor();
  const parsed = z
    .object({
      id: idSchema,
      status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
    })
    .parse({ id, status });
  const project = await db.project.findUnique({
    where: { id: parsed.id },
    include: {
      media: true,
      system: { include: { credentials: true } },
      area: true,
    },
  });
  if (!project || !canEditProject(user, project))
    return { error: "Acceso no autorizado" };
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (parsed.status === "ARCHIVED" && !canArchive(user, project))
    return { error: "Solo puedes archivar tus propios proyectos" };
  if (parsed.status === "PUBLISHED") {
    if (!canPublish(user, project, settings?.requireReview))
      return { error: "Debes enviar el proyecto a revisión" };
    if (
      !project.area.isActive ||
      !project.title ||
      !project.summary ||
      (project.coverMediaId !== null &&
        !project.media.some((m) => m.id === project.coverMediaId))
    )
      return {
        error:
          "Completa título y resumen y revisa la portada antes de publicar",
      };
    if (
      !project.workDate ||
      !hasContentMedia(
        project.area.slug,
        project.coverMediaId,
        project.coverLinkUrl,
      )
    )
      return {
        error: "Agrega la fecha y una foto de portada antes de publicar",
      };
    if (
      (project.type === "SYSTEM" || project.type === "WEBSITE") &&
      project.area.slug !== "sistemas"
    )
      return {
        error:
          "Las páginas web y los sistemas administrativos son exclusivos del área Sistemas",
      };
    if (
      project.type === "SYSTEM" &&
      !project.system?.credentials.some(
        (c) => c.isActive && c.username.trim() && c.passwordEnc,
      )
    )
      return {
        error:
          "Agrega al menos una credencial activa con usuario y contraseña antes de publicar",
      };
    if (
      project.type === "WEBSITE" &&
      (project.area.slug !== "sistemas" ||
        !project.coverLinkUrl ||
        !/^https?:\/\//.test(project.coverLinkUrl) ||
        !URL.canParse(project.coverLinkUrl) ||
        !project.coverMediaId)
    )
      return {
        error:
          "Agrega el enlace y una imagen de referencia antes de publicar la página web",
      };
    if (
      project.type === "SYSTEM" &&
      (!project.system?.systemName ||
        !project.system.url.startsWith("https://"))
    )
      return { error: "Completa los datos del sistema antes de publicar" };
  }
  await db.$transaction([
    db.project.update({
      where: { id: project.id },
      data: {
        status: parsed.status,
        publishedAt:
          parsed.status === "PUBLISHED"
            ? new Date()
            : parsed.status === "DRAFT"
              ? null
              : project.publishedAt,
        updatedById: user.id,
      },
    }),
    db.auditLog.create({
      data: {
        userId: user.id,
        action: `PROJECT_${parsed.status}`,
        entity: "Project",
        entityId: project.id,
      },
    }),
  ]);
  refreshCatalog();
  return { message: "Estado actualizado" };
}
export async function duplicateProject(id: unknown) {
  const user = await requireEditor();
  const project = await db.project.findUnique({
    where: { id: idSchema.parse(id) },
    include: { media: true, system: { include: { credentials: true } } },
  });
  if (!project || !canEditProject(user, project))
    return { error: "Acceso no autorizado" };
  const title = `${project.title} (copia)`.slice(0, 160);
  const slug = await uniqueSlug(title);
  const copy = await db.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        title,
        slug,
        coverLinkUrl: project.coverLinkUrl,
        coverLinkText: project.coverLinkText,
        summary: project.summary,
        areaId: project.areaId,
        content: project.content as Prisma.InputJsonValue,
        type: project.type,
        workDate: project.workDate,
        year: project.year,
        tags: stringList(project.tags),
        techStack: stringList(project.techStack),
        createdById: user.id,
        media: {
          create: project.media.map((m) => ({
            url: m.url,
            storageKey: m.storageKey,
            alt: m.alt,
            width: m.width,
            height: m.height,
            order: m.order,
          })),
        },
        ...(project.system
          ? {
              system: {
                create: {
                  systemName: project.system.systemName,
                  url: project.system.url,
                  environment: project.system.environment,
                  credentialVisibility: project.system.credentialVisibility,
                  credentials: {
                    create: project.system.credentials.map((c) => ({
                      label: c.label,
                      username: c.username,
                      passwordEnc: c.passwordEnc,
                      notes: c.notes,
                      isActive: c.isActive,
                    })),
                  },
                },
              },
            }
          : {}),
      },
    });
    const cover = await tx.media.findFirst({
      where: { projectId: p.id },
      orderBy: { order: "asc" },
    });
    if (cover)
      await tx.project.update({
        where: { id: p.id },
        data: { coverMediaId: cover.id },
      });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "PROJECT_DUPLICATED",
        entity: "Project",
        entityId: p.id,
      },
    });
    return p;
  });
  refreshCatalog();
  return { id: copy.id };
}
export async function saveMedia(input: unknown) {
  const user = await requireEditor();
  const value = z
    .object({
      projectId: idSchema,
      media: z
        .array(
          z.object({ id: idSchema, alt: z.string().trim().min(1).max(300) }),
        )
        .max(12),
      coverId: idSchema.nullable(),
    })
    .parse(input);
  const project = await db.project.findUnique({
    where: { id: value.projectId },
    include: { media: true, area: true },
  });
  if (!project || !canEditProject(user, project))
    return { error: "Acceso no autorizado" };
  const owned = new Set(project.media.map((m) => m.id));
  if (
    value.media.some((m) => !owned.has(m.id)) ||
    new Set(value.media.map((m) => m.id)).size !== value.media.length ||
    (value.coverId !== null && !value.media.some((m) => m.id === value.coverId))
  )
    return { error: "Las imágenes o portada no son válidas" };
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  const needsReview =
    project.status === "PUBLISHED" &&
    settings?.requireReview &&
    !canPublish(user, project, true);
  if (
    project.status === "PUBLISHED" &&
    !needsReview &&
    !hasContentMedia(project.area.slug, value.coverId, project.coverLinkUrl)
  )
    return {
      error: "El trabajo publicado debe conservar una foto de portada",
    };
  await db.$transaction([
    ...value.media.map((m, order) =>
      db.media.update({ where: { id: m.id }, data: { alt: m.alt, order } }),
    ),
    db.project.update({
      where: { id: project.id },
      data: {
        coverMediaId: value.coverId,
        ...(needsReview ? { status: "IN_REVIEW" as const } : {}),
      },
    }),
    db.media.deleteMany({
      where: {
        projectId: project.id,
        id: { notIn: value.media.map((m) => m.id) },
      },
    }),
    db.auditLog.create({
      data: {
        userId: user.id,
        action: "MEDIA_UPDATED",
        entity: "Project",
        entityId: project.id,
      },
    }),
  ]);
  refreshCatalog();
  return { message: "Imágenes y portada guardadas" };
}
export async function previewProject(id: unknown) {
  const user = await requireEditor();
  const p = await db.project.findUnique({
    where: { id: idSchema.parse(id) },
    select: { id: true, areaId: true },
  });
  if (!p || !canEditProject(user, p)) throw new Error("Acceso no autorizado");
  return {
    url: `/panel/proyectos/${p.id}/vista-previa`,
    nonce: randomBytes(4).toString("hex"),
  };
}
