import {
  allowedRequestOrigin,
  readBodyLimited,
  RequestSecurityError,
} from "@/lib/request-security";
import { consumeRequestLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { getActor } from "@/lib/session";
import { canEditProject, canPublish, canManageArea } from "@/lib/permissions";
import { db } from "@/lib/db";
import { storageProvider } from "@/lib/storage";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { revalidateTag } from "next/cache";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await getActor();
  if (!user || user.role === "INTERNAL" || user.mustChangePassword)
    return NextResponse.json(
      { error: "Acceso no autorizado" },
      { status: 401 },
    );
  if (!allowedRequestOrigin(request))
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    return NextResponse.json(
      { error: "Formato no permitido" },
      { status: 415 },
    );
  const limit = 6 * 1024 * 1024;
  try {
    if (!(await consumeRequestLimit("upload", user.id, 60, 600)))
      return NextResponse.json(
        { error: "Demasiadas imágenes. Intenta más tarde." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const body = await readBodyLimited(request, limit);
    const form = await new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    }).formData();
    const parsed = z
      .object({
        projectId: z.string().cuid().optional(),
        areaId: z.string().cuid().optional(),
        alt: z.string().trim().min(1).max(300),
      })
      .refine((v) => !!v.projectId !== !!v.areaId)
      .safeParse({
        projectId: form.get("projectId") || undefined,
        areaId: form.get("areaId") || undefined,
        alt: form.get("alt"),
      });
    if (!parsed.success)
      return NextResponse.json(
        { error: "Proyecto y texto alternativo son obligatorios" },
        { status: 400 },
      );
    const area = parsed.data.areaId
      ? await db.area.findUnique({ where: { id: parsed.data.areaId } })
      : null;
    const project = parsed.data.projectId
      ? await db.project.findUnique({ where: { id: parsed.data.projectId } })
      : null;
    if (
      parsed.data.areaId
        ? !area || !canManageArea(user, area.id)
        : !project || !canEditProject(user, project)
    )
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 },
      );
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "Usa JPG, PNG o WebP de hasta 5 MB" },
        { status: 400 },
      );
    const original = Buffer.from(await file.arrayBuffer());
    const image = sharp(original, {
      limitInputPixels: 40000000,
    });
    const metadata = await image.metadata().catch(() => null);
    if (
      !metadata ||
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages && metadata.pages > 1)
    )
      return NextResponse.json(
        { error: "Formato de imagen no permitido" },
        { status: 400 },
      );
    const { data, info } = await image
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    const assetId = randomUUID();
    const key = `${assetId}.webp`;
    if (!process.env.STORAGE_BUCKET && process.env.NODE_ENV !== "production") {
      const directory = path.join(
        process.cwd(),
        ".local",
        "resources",
        "originals",
      );
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(
          directory,
          `${assetId}.${metadata.format === "jpeg" ? "jpg" : metadata.format}`,
        ),
        original,
      );
    }
    if (area) {
      const stored = await storageProvider().upload(key, data);
      try {
        await db.$transaction([
          db.area.update({
            where: { id: area.id },
            data: { coverImageUrl: stored.url },
          }),
          db.auditLog.create({
            data: {
              userId: user.id,
              action: "AREA_COVER_UPLOADED",
              entity: "Area",
              entityId: area.id,
            },
          }),
        ]);
        revalidateTag("catalog", "max");
        return NextResponse.json({ url: stored.url });
      } catch {
        throw new Error("AREA_UPLOAD_FAILED");
      }
    }
    if (!project)
      return NextResponse.json(
        { error: "Proyecto no disponible" },
        { status: 404 },
      );
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Project WHERE id = ${project.id} FOR UPDATE`;
      const count = await tx.media.count({ where: { projectId: project.id } });
      if (count >= 12) throw new Error("IMAGE_LIMIT");
      const stored = await storageProvider().upload(key, data);
      const media = await tx.media.create({
        data: {
          projectId: project.id,
          ...stored,
          alt: parsed.data.alt,
          width: info.width,
          height: info.height,
          order: count,
        },
      });
      const settings = await tx.siteSettings.findUnique({ where: { id: 1 } });
      const needsReview =
        project.status === "PUBLISHED" &&
        settings?.requireReview &&
        !canPublish(user, project, true);
      if (!project.coverMediaId || needsReview)
        await tx.project.update({
          where: { id: project.id },
          data: {
            ...(!project.coverMediaId ? { coverMediaId: media.id } : {}),
            ...(needsReview ? { status: "IN_REVIEW" as const } : {}),
          },
        });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "IMAGE_UPLOADED",
          entity: "Project",
          entityId: project.id,
        },
      });
      return { id: media.id, url: media.url, alt: media.alt };
    });
    revalidateTag("catalog", "max");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestSecurityError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "IMAGE_LIMIT"
            ? "Máximo 12 imágenes por proyecto"
            : "No se pudo procesar la imagen. Verifica el archivo y la configuración de almacenamiento.",
      },
      { status: 400 },
    );
  }
}
