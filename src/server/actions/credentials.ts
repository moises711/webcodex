"use server";
import { headers } from "next/headers";
import { clientAddress } from "@/lib/request-security";
import { consumeRequestLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { canEditProject, canViewCredentials } from "@/lib/permissions";
import { decryptCredential } from "@/lib/crypto";
export async function revealCredentials(projectId: unknown, panel = false) {
  const id = z.string().cuid().parse(projectId);
  const user = await getActor();
  const project = await db.project.findUnique({
    where: { id },
    include: {
      area: true,
      system: { include: { credentials: { where: { isActive: true } } } },
    },
  });
  if (!project?.system) throw new Error("Sistema no disponible");
  if (panel) {
    if (!user || user.mustChangePassword || !canEditProject(user, project))
      throw new Error("Acceso no autorizado");
  } else if (project.status !== "PUBLISHED" || !project.area.isActive)
    throw new Error("Sistema no disponible");
  if (
    !canViewCredentials(
      user,
      {
        areaId: project.areaId,
        credentialVisibility: project.system.credentialVisibility,
      },
      panel,
    )
  )
    throw new Error("No tienes permiso para ver estas credenciales");
  if (
    !(await consumeRequestLimit(
      "credential-read",
      user?.id || clientAddress(await headers()),
      30,
      300,
    ))
  )
    throw new Error("Demasiadas solicitudes. Intenta más tarde.");
  await db.auditLog.create({
    data: {
      userId: user?.id,
      action: "CREDENTIALS_VIEWED",
      entity: "Project",
      entityId: id,
    },
  });
  return project.system.credentials.map((c) => ({
    id: c.id,
    label: c.label,
    username: c.username,
    password: decryptCredential(c.passwordEnc),
    notes: c.notes,
  }));
}
