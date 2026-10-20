import { PrismaClient } from "@prisma/client";
import { portalAreas } from "../src/lib/areas";
const db = new PrismaClient();
async function main() {
  try {
    await db.$transaction(async (tx) => {
      const targets = new Map<string, string>();
      for (const [order, area] of portalAreas.entries()) {
        const saved = await tx.area.upsert({
          where: { slug: area.slug },
          update: { name: area.name, icon: area.icon, order, isActive: true },
          create: { ...area, order },
        });
        targets.set(area.slug, saved.id);
      }
      for (const [oldSlug, targetSlug] of [
        ["ingenieria", "sistemas"],
        ["operaciones", "soporte-tecnico"],
      ]) {
        const source = await tx.area.findUnique({
          where: { slug: oldSlug },
          include: { users: true },
        });
        if (!source) continue;
        const areaId = targets.get(targetSlug)!;
        await tx.project.updateMany({
          where: { areaId: source.id },
          data: { areaId },
        });
        for (const member of source.users) {
          const existing = await tx.userArea.findUnique({
            where: { userId_areaId: { userId: member.userId, areaId } },
          });
          await tx.userArea.upsert({
            where: { userId_areaId: { userId: member.userId, areaId } },
            update: {
              isManager: Boolean(existing?.isManager || member.isManager),
            },
            create: {
              userId: member.userId,
              areaId,
              isManager: member.isManager,
            },
          });
          await tx.user.update({
            where: { id: member.userId },
            data: { sessionVersion: { increment: 1 } },
          });
        }
        if (source.coverImageUrl) {
          const target = await tx.area.findUniqueOrThrow({
            where: { id: areaId },
          });
          if (!target.coverImageUrl)
            await tx.area.update({
              where: { id: areaId },
              data: { coverImageUrl: source.coverImageUrl },
            });
        }
        await tx.area.delete({ where: { id: source.id } });
        console.log("Contenido trasladado:", oldSlug, "→", targetSlug);
      }
    });
    console.log(
      "Áreas actuales:",
      (
        await db.area.findMany({
          orderBy: { order: "asc" },
          select: { name: true },
        })
      ).map((area) => area.name),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error("No se completó la reorganización de áreas.");
  process.exitCode = 1;
});
