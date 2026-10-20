import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { Actor } from "../src/lib/permissions";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ actor: null as Actor | null }));
vi.mock("../src/lib/session", () => ({
  requireEditor: async () => {
    if (!state.actor) throw new Error("Unauthorized");
    return state.actor;
  },
}));
vi.mock("../src/lib/revalidate", () => ({ refreshCatalog: () => {} }));
import {
  saveArea,
  saveUser,
  assignEditor,
  saveSettings,
  reorderAreas,
  deleteArea,
} from "../src/server/actions/admin";
const db = new PrismaClient();
const prefix = `admin-test-${randomUUID()}`;
let areaA: string, areaB: string, createdUser: string;
let manager: Actor, editor: Actor, admin: Actor;
function form(values: Record<string, string | string[]>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values))
    for (const item of Array.isArray(value) ? value : [value])
      result.append(key, item);
  return result;
}
const areaData = (id: string) => ({
  id,
  name: `${prefix}-updated`,
  slug: `${prefix}-a`,
  description: "Test area",
  color: "#216AA3",
  icon: "Code2",
  coverImageUrl: "/brand/codex-cusco.jpeg",
  isActive: "on",
});
beforeAll(async () => {
  const a = await db.area.create({
    data: { name: `${prefix}-a`, slug: `${prefix}-a` },
  });
  const b = await db.area.create({
    data: { name: `${prefix}-b`, slug: `${prefix}-b` },
  });
  areaA = a.id;
  areaB = b.id;
  const users = [];
  for (const [index, role] of ["AREA_ADMIN", "EDITOR", "SUPER_ADMIN"].entries())
    users.push(
      await db.user.create({
        data: {
          name: `Test ${index}`,
          email: `${prefix}-${index}@test.invalid`,
          passwordHash: "not-a-login-hash",
          role: role as "EDITOR",
          mustChangePassword: false,
        },
      }),
    );
  await db.userArea.createMany({
    data: [
      { userId: users[0].id, areaId: areaA, isManager: true },
      { userId: users[1].id, areaId: areaB, isManager: false },
    ],
  });
  manager = {
    id: users[0].id,
    role: "AREA_ADMIN",
    areas: [{ areaId: areaA, isManager: true }],
  };
  editor = {
    id: users[1].id,
    role: "EDITOR",
    areas: [{ areaId: areaB, isManager: false }],
  };
  admin = { id: users[2].id, role: "SUPER_ADMIN", areas: [] };
});
afterAll(async () => {
  const users = await db.user.findMany({
    where: { email: { startsWith: prefix } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  await db.auditLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.area.deleteMany({ where: { slug: { startsWith: prefix } } });
  await db.$disconnect();
});
it("allows managers to edit their own area and rejects cross-area changes", async () => {
  state.actor = manager;
  expect(
    (await saveArea({ message: "" }, form(areaData(areaA)))).error,
  ).toBeUndefined();
  expect(
    (
      await saveArea(
        { message: "" },
        form({ ...areaData(areaB), slug: `${prefix}-b` }),
      )
    ).error,
  ).toBe(true);
  state.actor = editor;
  expect((await saveArea({ message: "" }, form(areaData(areaA)))).error).toBe(
    true,
  );
});
it("requires super admin for user creation and generates a hashed temporary password", async () => {
  state.actor = manager;
  await expect(saveUser({ message: "" }, form({}))).rejects.toThrow();
  state.actor = admin;
  const result = await saveUser(
    { message: "" },
    form({
      name: "New test editor",
      email: `${prefix}-new@test.invalid`,
      role: "EDITOR",
      isActive: "on",
      areaIds: [areaA],
      managerIds: [],
    }),
  );
  expect(result.error).toBeUndefined();
  expect(result.temporaryPassword?.length).toBeGreaterThan(10);
  const user = await db.user.findUniqueOrThrow({
    where: { email: `${prefix}-new@test.invalid` },
  });
  createdUser = user.id;
  expect(user.passwordHash).not.toBe(result.temporaryPassword);
  expect(user.mustChangePassword).toBe(true);
  expect(user.passwordHash).toMatch(/^\$2/);
});
it("lets an area manager assign only editors and invalidates their sessions", async () => {
  state.actor = manager;
  const before = await db.user.findUniqueOrThrow({
    where: { id: createdUser },
  });
  expect(
    (
      await assignEditor(
        { message: "" },
        form({ areaId: areaA, userId: createdUser, enabled: "on" }),
      )
    ).error,
  ).toBeUndefined();
  expect(
    (await db.user.findUniqueOrThrow({ where: { id: createdUser } }))
      .sessionVersion,
  ).toBe(before.sessionVersion + 1);
  expect(
    (
      await assignEditor(
        { message: "" },
        form({ areaId: areaB, userId: createdUser, enabled: "on" }),
      )
    ).error,
  ).toBe(true);
  expect(
    (
      await assignEditor(
        { message: "" },
        form({ areaId: areaA, userId: admin.id, enabled: "on" }),
      )
    ).error,
  ).toBe(true);
});
it("protects settings, order and the super admin's own access", async () => {
  state.actor = editor;
  await expect(saveSettings({ message: "" }, form({}))).rejects.toThrow();
  await expect(reorderAreas([])).rejects.toThrow();
  state.actor = admin;
  expect(
    (
      await saveUser(
        { message: "" },
        form({
          id: admin.id,
          name: "Test admin",
          email: `${prefix}-2@test.invalid`,
          role: "INTERNAL",
          areaIds: [],
          managerIds: [],
        }),
      )
    ).error,
  ).toBe(true);
});
it("keeps the current areas even for a super administrator", async () => {
  state.actor = admin;
  const data = { ...areaData(""), name: `${prefix}-c`, slug: `${prefix}-c` };
  delete (data as { id?: string }).id;
  expect((await saveArea({ message: "" }, form(data))).error).toBe(true);
  expect(
    await db.area.findUnique({ where: { slug: `${prefix}-c` } }),
  ).toBeNull();
  const area = await db.area.findUniqueOrThrow({ where: { id: areaA } });
  expect(
    (
      await deleteArea(
        { message: "" },
        form({ id: areaA, confirmation: area.name }),
      )
    ).error,
  ).toBe(true);
  expect(await db.area.findUnique({ where: { id: areaA } })).not.toBeNull();
});

it("deletes projects with confirmation and preserves areas and the administrator", async () => {
  const { deleteRecord } = await import("../src/server/actions/delete");
  const area = await db.area.create({
    data: { name: `${prefix}-delete`, slug: `${prefix}-delete` },
  });
  const project = await db.project.create({
    data: {
      title: "Delete fixture",
      slug: `${prefix}-delete-project`,
      summary: "Test",
      areaId: area.id,
      createdById: admin.id,
      media: {
        create: {
          url: "/brand/codex-cusco.jpeg",
          storageKey: "test",
          alt: "Test",
        },
      },
      system: {
        create: {
          systemName: "Test",
          url: "https://example.com",
          credentials: {
            create: { label: "Test", username: "test", passwordEnc: "fixture" },
          },
        },
      },
    },
  });
  try {
    state.actor = editor;
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: project.id, entity: "Project", confirmation: "ELIMINAR" }),
        )
      ).error,
    ).toBe(true);
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: area.id, entity: "Area", confirmation: "ELIMINAR" }),
        )
      ).error,
    ).toBe(true);
    state.actor = admin;
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: admin.id, entity: "User", confirmation: "ELIMINAR" }),
        )
      ).error,
    ).toBe(true);
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: area.id, entity: "Area", confirmation: "wrong" }),
        )
      ).error,
    ).toBe(true);
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: area.id, entity: "Area", confirmation: "ELIMINAR" }),
        )
      ).error,
    ).toBe(true);
    expect(
      await db.project.findUnique({ where: { id: project.id } }),
    ).not.toBeNull();
    expect(
      (
        await deleteRecord(
          { message: "" },
          form({ id: project.id, entity: "Project", confirmation: "ELIMINAR" }),
        )
      ).error,
    ).toBeUndefined();
    expect(
      await db.project.findUnique({ where: { id: project.id } }),
    ).toBeNull();
    expect(await db.media.count({ where: { projectId: project.id } })).toBe(0);
    expect(
      await db.systemInfo.count({ where: { projectId: project.id } }),
    ).toBe(0);
  } finally {
    await db.project.deleteMany({ where: { id: project.id } });
    await db.area.deleteMany({ where: { id: area.id } });
  }
});
