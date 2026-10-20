import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Actor } from "../src/lib/permissions";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const state = vi.hoisted(() => ({
  actor: null as (Actor & { mustChangePassword: boolean }) | null,
}));
vi.mock("../src/lib/session", () => ({
  getActor: async () => state.actor,
  requireEditor: async () => {
    if (
      !state.actor ||
      state.actor.role === "INTERNAL" ||
      state.actor.mustChangePassword
    )
      throw new Error("Unauthorized");
    return state.actor;
  },
}));
vi.mock("../src/lib/revalidate", () => ({ refreshCatalog: () => {} }));
vi.mock("next/cache", () => ({ revalidateTag: () => {} }));
import {
  saveProject,
  setProjectStatus,
  saveMedia,
  duplicateProject,
} from "../src/server/actions/projects";
import { revealCredentials } from "../src/server/actions/credentials";
import { consumeLoginAttempt, resetLoginAttempts } from "../src/lib/rate-limit";
import { POST as upload } from "../src/app/api/upload/route";
import { GET as mediaGet } from "../src/app/api/media/[key]/route";
const db = new PrismaClient();
const prefix = `test-${randomUUID()}`;
let areaA: string,
  areaB: string,
  userA: Actor & { mustChangePassword: boolean },
  userB: Actor & { mustChangePassword: boolean };
let projectId: string, mediaId: string, mediaKey: string;
let originalReview = false;
const projectIds: string[] = [];
const input = () => ({
  title: `${prefix} proyecto`,
  summary: "Contenido de prueba",
  areaId: areaA,
  type: "PROJECT",
  workDate: "2026-10-20",
  year: 2026,
  tags: "Prueba",
  techStack: "",
  isFeatured: false,
  content: { type: "doc", content: [{ type: "paragraph" }] },
  systemName: "",
  systemUrl: "",
  environment: "demo",
  credentialVisibility: "INTERNAL",
  credentials: [],
});
beforeAll(async () => {
  const [a, b] = await Promise.all([
    db.area.create({ data: { name: `${prefix} A`, slug: `${prefix}-a` } }),
    db.area.create({ data: { name: `${prefix} B`, slug: `${prefix}-b` } }),
  ]);
  areaA = a.id;
  areaB = b.id;
  const [ua, ub] = await Promise.all([
    db.user.create({
      data: {
        name: "Test A",
        email: `${prefix}-a@test.invalid`,
        passwordHash: "not-a-login-hash",
        mustChangePassword: false,
      },
    }),
    db.user.create({
      data: {
        name: "Test B",
        email: `${prefix}-b@test.invalid`,
        passwordHash: "not-a-login-hash",
        mustChangePassword: false,
      },
    }),
  ]);
  userA = {
    id: ua.id,
    role: "EDITOR",
    areas: [{ areaId: areaA, isManager: false }],
    mustChangePassword: false,
  };
  userB = {
    id: ub.id,
    role: "EDITOR",
    areas: [{ areaId: areaB, isManager: false }],
    mustChangePassword: false,
  };
  originalReview =
    (await db.siteSettings.findUnique({ where: { id: 1 } }))?.requireReview ||
    false;
  await db.siteSettings.update({
    where: { id: 1 },
    data: { requireReview: false },
  });
});
afterAll(async () => {
  await resetLoginAttempts(`${prefix}@test.invalid`, "test");
  await resetLoginAttempts(`${prefix}@test.invalid`, "other-ip");
  if (!userA || !userB) {
    await db.$disconnect();
    return;
  }
  state.actor = null;
  await db.auditLog.deleteMany({
    where: {
      OR: [
        { userId: { in: [userA.id, userB.id] } },
        { entityId: { in: projectIds } },
      ],
    },
  });
  await db.project.deleteMany({ where: { id: { in: projectIds } } });
  await db.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  await db.area.deleteMany({ where: { id: { in: [areaA, areaB] } } });
  await db.siteSettings.update({
    where: { id: 1 },
    data: { requireReview: originalReview },
  });
  await resetLoginAttempts(`${prefix}@test.invalid`, "test");
  if (mediaKey)
    await unlink(path.join(process.cwd(), ".local/media", mediaKey)).catch(
      () => {},
    );
  await db.$disconnect();
});
describe("server actions with isolated PostgreSQL fixtures", () => {
  it("rejects forged area IDs before creating a project", async () => {
    state.actor = userA;
    const result = await saveProject(null, { ...input(), areaId: areaB });
    expect(result.error).toBeDefined();
    expect(await db.project.count({ where: { areaId: areaB } })).toBe(0);
  });
  it("creates a draft but rejects publication without a cover", async () => {
    state.actor = userA;
    const result = await saveProject(null, input());
    expect(result.id).toBeDefined();
    projectId = result.id!;
    projectIds.push(projectId);
    expect(
      (await setProjectStatus(projectId, "PUBLISHED")).error,
    ).toBeDefined();
    await setProjectStatus(projectId, "DRAFT");
  });
  it("blocks cross-area edits and publication at the action boundary", async () => {
    state.actor = userB;
    expect(
      (
        await saveProject(projectId, {
          ...input(),
          title: "Forged edit",
          areaId: areaB,
        })
      ).error,
    ).toBeDefined();
    expect(
      (await setProjectStatus(projectId, "PUBLISHED")).error,
    ).toBeDefined();
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: projectId } })).title,
    ).toContain(prefix);
  });
  it("rejects unsupported and oversized uploads", async () => {
    state.actor = userA;
    for (const file of [
      new File(["bad"], "bad.txt", { type: "text/plain" }),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
        type: "image/png",
      }),
    ]) {
      const form = new FormData();
      form.set("projectId", projectId);
      form.set("alt", "Test image");
      form.set("file", file);
      const response = await upload(
        new Request("http://localhost:3001/api/upload", {
          method: "POST",
          headers: { origin: "http://localhost:3001" },
          body: form,
        }),
      );
      expect(response.status).toBe(400);
    }
  });
  it("optimizes a real image, stores its metadata and protects drafts", async () => {
    state.actor = userA;
    const png = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: { r: 50, g: 130, b: 180 },
      },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.set("projectId", projectId);
    form.set("alt", "Test image");
    form.set("file", new File([png], "test.png", { type: "image/png" }));
    const response = await upload(
      new Request("http://localhost:3001/api/upload", {
        method: "POST",
        headers: { origin: "http://localhost:3001" },
        body: form,
      }),
    );
    expect(response.status).toBe(200);
    const media = await response.json();
    mediaId = media.id;
    mediaKey = media.url.split("/").pop();
    state.actor = userB;
    expect(
      (
        await mediaGet(new Request("http://localhost:3001"), {
          params: Promise.resolve({ key: mediaKey }),
        })
      ).status,
    ).toBe(404);
    state.actor = userA;
    expect(
      (
        await mediaGet(new Request("http://localhost:3001"), {
          params: Promise.resolve({ key: mediaKey }),
        })
      ).status,
    ).toBe(200);
  });
  it("rejects foreign covers, publishes valid projects and duplicates as draft", async () => {
    state.actor = userA;
    expect(
      (
        await saveMedia({
          projectId,
          media: [{ id: areaB, alt: "Invalid" }],
          coverId: areaB,
        })
      ).error,
    ).toBeDefined();
    expect(
      (
        await saveMedia({
          projectId,
          media: [{ id: mediaId, alt: "Valid" }],
          coverId: mediaId,
        })
      ).message,
    ).toBeDefined();
    expect(
      (await setProjectStatus(projectId, "PUBLISHED")).message,
    ).toBeDefined();
    const copy = await duplicateProject(projectId);
    expect(copy.id).toBeDefined();
    projectIds.push(copy.id!);
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: copy.id } })).status,
    ).toBe("DRAFT");
  });
  it("does not bypass review through publish or edit", async () => {
    await db.siteSettings.update({
      where: { id: 1 },
      data: { requireReview: true },
    });
    state.actor = userA;
    expect(
      (await setProjectStatus(projectId, "PUBLISHED")).error,
    ).toBeDefined();
    await saveProject(projectId, input());
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: projectId } })).status,
    ).toBe("IN_REVIEW");
    await db.siteSettings.update({
      where: { id: 1 },
      data: { requireReview: false },
    });
  });
  it("encrypts credentials and keeps INTERNAL and HIDDEN inaccessible to visitors", async () => {
    state.actor = userA;
    const systems = await db.area.findUniqueOrThrow({
      where: { slug: "sistemas" },
    });
    userA.areas.push({ areaId: systems.id, isManager: false });
    state.actor = { ...userA, role: "SUPER_ADMIN" };
    const saved = await saveProject(projectId, {
      ...input(),
      areaId: systems.id,
      type: "SYSTEM",
      systemName: "Test system",
      systemUrl: "https://example.com",
      credentials: [
        {
          label: "Demo",
          username: "demo@gmail.com",
          password: "TEST-ONLY-SECRET",
          notes: "",
          isActive: true,
        },
      ],
    });
    expect(saved.error).toBeUndefined();
    state.actor = userA;
    await setProjectStatus(projectId, "PUBLISHED");
    const system = await db.systemInfo.findUniqueOrThrow({
      where: { projectId },
      include: { credentials: true },
    });
    expect(system.credentials[0].passwordEnc).not.toContain("TEST-ONLY-SECRET");
    state.actor = null;
    await expect(revealCredentials(projectId)).rejects.toThrow();
    state.actor = userA;
    expect((await revealCredentials(projectId))[0].password).toBe(
      "TEST-ONLY-SECRET",
    );
    await db.systemInfo.update({
      where: { id: system.id },
      data: { credentialVisibility: "HIDDEN" },
    });
    await expect(revealCredentials(projectId)).rejects.toThrow();
    state.actor = userB;
    await expect(revealCredentials(projectId, true)).rejects.toThrow();
    state.actor = userA;
    expect((await revealCredentials(projectId, true)).length).toBe(1);
    await db.systemInfo.update({
      where: { id: system.id },
      data: { credentialVisibility: "PUBLIC" },
    });
    state.actor = null;
    expect((await revealCredentials(projectId)).length).toBe(1);
    expect(
      await db.auditLog.count({
        where: { entityId: projectId, action: "CREDENTIALS_VIEWED" },
      }),
    ).toBe(3);
  });
  it("blocks the sixth attempt and resets after successful authentication", async () => {
    const email = `${prefix}@test.invalid`;
    for (let i = 0; i < 5; i++)
      expect(await consumeLoginAttempt(email, "test")).toBe(true);
    expect(await consumeLoginAttempt(email, "other-ip")).toBe(false);
    await resetLoginAttempts(email, "test");
    expect(await consumeLoginAttempt(email, "test")).toBe(true);
  });
});

it("saves a cover link, rejects unsafe URLs and removes the last image", async () => {
  state.actor = userA;
  const saved = await saveProject(null, {
    ...input(),
    coverLinkUrl: "https://example.com/citas",
    coverLinkText: "Reservar cita",
  });
  expect(saved.id).toBeDefined();
  projectIds.push(saved.id!);
  const project = await db.project.findUniqueOrThrow({
    where: { id: saved.id },
  });
  expect(project.coverLinkText).toBe("Reservar cita");
  expect(
    (
      await saveProject(saved.id, {
        ...input(),
        coverLinkUrl: "javascript:alert(1)",
        coverLinkText: "Abrir",
      })
    ).error,
  ).toBeDefined();
  const media = await db.media.create({
    data: {
      projectId: project.id,
      url: "/brand/codex-cusco.jpeg",
      storageKey: "test-cover",
      alt: "Test",
    },
  });
  await db.project.update({
    where: { id: project.id },
    data: { coverMediaId: media.id },
  });
  expect(
    (await saveMedia({ projectId: project.id, media: [], coverId: null }))
      .message,
  ).toBeDefined();
  expect(
    (await db.project.findUniqueOrThrow({ where: { id: project.id } }))
      .coverMediaId,
  ).toBeNull();
  expect(await db.media.count({ where: { projectId: project.id } })).toBe(0);
});
