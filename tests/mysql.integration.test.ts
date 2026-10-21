import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createHash, randomUUID } from "node:crypto";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
import { findProjects } from "../src/server/queries/public";
import { consumeLoginAttempt, resetLoginAttempts } from "../src/lib/rate-limit";
import { POST } from "../src/app/api/page-views/route";
const db = new PrismaClient();
const prefix = `mysql-${randomUUID()}`;
const email = `${prefix}@test.invalid`;
const visitId = randomUUID();
let userId: string, areaId: string, projectId: string;
beforeAll(async () => {
  const user = await db.user.create({
    data: { name: prefix, email, passwordHash: "unused" },
  });
  userId = user.id;
  const area = await db.area.create({ data: { name: prefix, slug: prefix } });
  areaId = area.id;
  const project = await db.project.create({
    data: {
      areaId,
      createdById: userId,
      title: `${prefix} Tecnología Cusco`,
      slug: prefix,
      summary: "Texto de prueba",
      status: "PUBLISHED",
      tags: [prefix, "Etiqueta"],
      techStack: ["MySQL"],
    },
  });
  projectId = project.id;
});
afterAll(async () => {
  await resetLoginAttempts(email, prefix);
  await db.pageVisit.deleteMany({ where: { id: visitId } });
  if (projectId) await db.project.delete({ where: { id: projectId } });
  if (areaId) await db.area.delete({ where: { id: areaId } });
  if (userId) await db.user.delete({ where: { id: userId } });
  await db.$disconnect();
});
describe("MySQL compatibility", () => {
  it("searches without case sensitivity and filters JSON tags", async () => {
    const result = await findProjects({
      q: prefix.toUpperCase(),
      tag: "Etiqueta",
    });
    expect(result.projects.map((p) => p.id)).toContain(projectId);
    const byTag = await findProjects({ q: "Etiqueta", areaId });
    expect(byTag.projects[0].tags).toEqual([prefix, "Etiqueta"]);
    expect(byTag.projects[0].techStack).toEqual(["MySQL"]);
    expect((await findProjects({ q: prefix, tag: "Ausente" })).total).toBe(0);
  });
  it("counts parallel login attempts atomically", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => consumeLoginAttempt(email, prefix)),
    );
    expect(results.filter(Boolean)).toHaveLength(5);
    await db.loginAttempt.updateMany({
      where: {
        key: {
          in: [`email:${email}`, `pair:${email}:${prefix}`].map((value) =>
            createHash("sha256").update(value).digest("hex"),
          ),
        },
      },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await consumeLoginAttempt(email, prefix)).toBe(true);
    await resetLoginAttempts(email, prefix);
  });
  it("deduplicates concurrent page visits", async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        POST(
          new Request("http://localhost:3000/api/page-views", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: "http://localhost:3000",
            },
            body: JSON.stringify({ visitId }),
          }),
        ),
      ),
    );
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(await db.pageVisit.count({ where: { id: visitId } })).toBe(1);
  });
});
