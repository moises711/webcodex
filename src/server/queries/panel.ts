import "server-only";
import { projectLists } from "@/lib/string-list";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/session";
import { projectScope, canEditProject } from "@/lib/permissions";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
export async function getPanelAreas() {
  const user = await requireEditor();
  return db.area.findMany({
    where: {
      isActive: true,
      ...(user.role === "SUPER_ADMIN"
        ? {}
        : { id: { in: user.areas.map((a) => a.areaId) } }),
    },
    orderBy: { order: "asc" },
  });
}
export async function getPanelProjects({
  areaId,
  status,
  q,
  type,
}: { areaId?: string; status?: string; q?: string; type?: string } = {}) {
  const user = await requireEditor();
  const where: Prisma.ProjectWhereInput = {
    AND: [
      projectScope(user),
      ...(areaId ? [{ areaId }] : []),
      ...(type === "PROJECT" || type === "SYSTEM" || type === "WEBSITE"
        ? [{ type: type as "PROJECT" | "SYSTEM" | "WEBSITE" }]
        : []),
      ...(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"].includes(status || "")
        ? [{ status: status as "DRAFT" }]
        : []),
      ...(q
        ? [
            {
              title: {
                contains: q.slice(0, 200),
              },
            },
          ]
        : []),
    ],
  };
  return db.project.findMany({
    where,
    include: { area: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}
export async function getPanelProject(id: string) {
  const user = await requireEditor();
  const project = await db.project.findUnique({
    where: { id },
    include: {
      area: true,
      media: { orderBy: { order: "asc" } },
      system: {
        include: {
          credentials: {
            select: {
              id: true,
              label: true,
              username: true,
              notes: true,
              isActive: true,
            },
          },
        },
      },
    },
  });
  if (!project || !canEditProject(user, project)) notFound();
  return projectLists(project);
}
export async function getDashboard(areaId?: string) {
  const user = await requireEditor();
  const where: Prisma.ProjectWhereInput = {
    AND: [projectScope(user), ...(areaId ? [{ areaId }] : [])],
  };
  const [counts, recent] = await Promise.all([
    db.project.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.auditLog.findMany({
      where: user.role === "SUPER_ADMIN" ? {} : { userId: user.id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  return { counts, recent };
}
