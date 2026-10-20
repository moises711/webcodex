import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { Actor } from "../src/lib/permissions";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("../src/lib/revalidate", () => ({ refreshCatalog: () => {} }));
const state = vi.hoisted(() => ({ actor: null as Actor | null }));
vi.mock("../src/lib/session", () => ({
  requireEditor: async () => state.actor,
}));
import {
  saveProject,
  saveMedia,
  setProjectStatus,
} from "../src/server/actions/projects";
import { getShowcaseSlides, findProjects } from "../src/server/queries/public";
const db = new PrismaClient();
const prefix = `carousel-${randomUUID()}`;
let userId: string, systemsId: string, otherId: string, inactiveId: string;
let createdSystems = false;
const projectIds: string[] = [];
const input = (areaId: string) => ({
  title: `${prefix} página`,
  summary: "Imagen de referencia y enlace",
  areaId,
  type: "WEBSITE",
  workDate: "2026-10-20",
  year: 2026,
  tags: "",
  techStack: "",
  isFeatured: false,
  coverLinkUrl: "https://example.com",
  coverLinkText: "",
  content: { type: "doc", content: [] },
  systemName: "",
  systemUrl: "",
  environment: "demo",
  credentialVisibility: "INTERNAL",
  credentials: [],
});
beforeAll(async () => {
  const user = await db.user.create({
    data: {
      name: prefix,
      email: `${prefix}@test.invalid`,
      passwordHash: "unused",
      mustChangePassword: false,
    },
  });
  userId = user.id;
  let systems = await db.area.findUnique({ where: { slug: "sistemas" } });
  if (!systems) {
    systems = await db.area.create({
      data: { name: "Sistemas", slug: "sistemas" },
    });
    createdSystems = true;
  }
  systemsId = systems.id;
  otherId = (
    await db.area.create({
      data: { name: `${prefix}-otra`, slug: `${prefix}-otra` },
    })
  ).id;
  inactiveId = (
    await db.area.create({
      data: {
        name: `${prefix}-inactiva`,
        slug: `${prefix}-inactiva`,
        isActive: false,
      },
    })
  ).id;
  state.actor = {
    id: userId,
    role: "EDITOR",
    areas: [
      { areaId: systemsId, isManager: false },
      { areaId: otherId, isManager: false },
    ],
  };
});
afterAll(async () => {
  if (userId) {
    await db.auditLog.deleteMany({ where: { userId } });
    await db.project.deleteMany({ where: { createdById: userId } });
    await db.area.deleteMany({
      where: {
        id: {
          in: [
            otherId,
            inactiveId,
            ...(createdSystems ? [systemsId] : []),
          ].filter(Boolean),
        },
      },
    });
    await db.user.delete({ where: { id: userId } });
  }
  await db.$disconnect();
});
describe("Publicación y carruseles", () => {
  it("restricts systems to Sistemas and requires active credentials and a work date", async () => {
    const systemInput = {
      ...input(systemsId),
      type: "SYSTEM",
      systemName: "Gestión",
      systemUrl: "https://example.com",
      coverLinkUrl: "",
      credentials: [],
    };
    expect(
      (await saveProject(null, { ...systemInput, areaId: otherId })).error,
    ).toBeTruthy();
    const saved = await saveProject(null, { ...systemInput, workDate: "" });
    expect(saved.error).toBeUndefined();
    const id = saved.id!;
    const media = await db.media.create({
      data: {
        projectId: id,
        url: "/resources/images/codex-cusco-logo.png",
        storageKey: prefix,
        alt: "Sistema",
      },
    });
    await db.project.update({
      where: { id },
      data: { coverMediaId: media.id },
    });
    expect((await setProjectStatus(id, "PUBLISHED")).error).toContain("fecha");
    await saveProject(id, systemInput);
    expect((await setProjectStatus(id, "PUBLISHED")).error).toContain(
      "credencial activa",
    );
    await saveProject(id, {
      ...systemInput,
      credentials: [
        {
          label: "Demo",
          username: "demo@gmail.com",
          password: "test-only-password",
          notes: "",
          isActive: false,
        },
      ],
    });
    expect((await setProjectStatus(id, "PUBLISHED")).error).toContain(
      "credencial activa",
    );
    await saveProject(id, {
      ...systemInput,
      credentials: [
        {
          label: "Demo",
          username: "demo@gmail.com",
          password: "test-only-password",
          notes: "",
          isActive: true,
        },
      ],
    });
    expect((await setProjectStatus(id, "PUBLISHED")).error).toBeUndefined();
    expect(
      (await saveMedia({ projectId: id, media: [], coverId: null })).error,
    ).toBeTruthy();
    expect((await saveProject(id, systemInput)).error).toBeTruthy();
    expect(
      (await saveProject(id, { ...systemInput, workDate: "2026-02-30" })).error,
    ).toBeTruthy();
  });
  it("requires a safe website link and limits websites to Sistemas", async () => {
    expect(
      (
        await saveProject(null, {
          ...input(systemsId),
          coverLinkUrl: "javascript:alert(1)",
        })
      ).error,
    ).toBeTruthy();
    expect((await saveProject(null, input(otherId))).error).toBeTruthy();
    const saved = await saveProject(null, input(systemsId));
    expect(saved.error).toBeUndefined();
    projectIds.push(saved.id!);
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: saved.id } }))
        .coverLinkText,
    ).toBe("Visitar página web");
    expect(await db.systemInfo.count({ where: { projectId: saved.id } })).toBe(
      0,
    );
  });
  it("requires a reference image before publishing a website", async () => {
    const id = projectIds[0];
    expect((await setProjectStatus(id, "PUBLISHED")).error).toBeTruthy();
    const image = await db.media.create({
      data: {
        projectId: id,
        url: "/resources/images/codex-cusco-logo.png",
        storageKey: prefix,
        alt: "Referencia de la página",
      },
    });
    expect(
      (
        await saveMedia({
          projectId: id,
          media: [{ id: image.id, alt: image.alt }],
          coverId: image.id,
        })
      ).error,
    ).toBeUndefined();
    expect((await setProjectStatus(id, "PUBLISHED")).error).toBeUndefined();
    const found = await findProjects({
      areaId: systemsId,
      type: "WEBSITE",
      q: prefix,
    });
    expect(found.projects.map((project) => project.id)).toContain(id);
  });
  it("shows published images only from the requested active areas", async () => {
    for (const [areaId, status] of [
      [systemsId, "DRAFT"],
      [inactiveId, "PUBLISHED"],
    ] as const) {
      await db.project.create({
        data: {
          title: prefix,
          slug: `${prefix}-${status}`,
          summary: "Privado",
          areaId,
          createdById: userId,
          status,
          media: {
            create: {
              url: "/resources/images/codex-cusco-logo.png",
              storageKey: prefix,
              alt: `No mostrar ${status}`,
            },
          },
        },
      });
    }
    const slides = await getShowcaseSlides([systemsId]);
    expect(slides.some((slide) => slide.title === `${prefix} página`)).toBe(
      true,
    );
    expect(slides.some((slide) => slide.alt.startsWith("No mostrar"))).toBe(
      false,
    );
    expect(
      (await getShowcaseSlides([otherId])).some((slide) =>
        slide.title.startsWith(prefix),
      ),
    ).toBe(false);
    expect(await getShowcaseSlides([])).toEqual([]);
    expect(JSON.stringify(slides)).not.toContain("password");
  });
});
