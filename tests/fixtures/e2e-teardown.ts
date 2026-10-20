import { PrismaClient } from "@prisma/client";
import { readFile, unlink } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import path from "node:path";
export default async function teardown() {
  loadEnvFile(".env");
  const data = JSON.parse(await readFile(".local/e2e.json", "utf8"));
  const db = new PrismaClient();
  const userIds = data.users.map((u: { id: string }) => u.id);
  const areaIds = data.areas.map((a: { id: string }) => a.id);
  const projects = await db.project.findMany({
    where: { areaId: { in: areaIds } },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);
  const media = await db.media.findMany({
    where: { projectId: { in: projectIds } },
    select: { storageKey: true },
  });
  await db.auditLog.deleteMany({
    where: {
      OR: [{ userId: { in: userIds } }, { entityId: { in: projectIds } }],
    },
  });
  await db.project.deleteMany({ where: { id: { in: projectIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.area.deleteMany({ where: { id: { in: areaIds } } });
  for (const m of media)
    if (m.storageKey.startsWith("local/"))
      await unlink(path.join(".local/media", m.storageKey.slice(6))).catch(
        () => {},
      );
  await unlink(".local/e2e.json");
  await unlink(".local/e2e.png");
  await db.$disconnect();
}
