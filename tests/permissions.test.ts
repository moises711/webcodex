import { describe, it, expect } from "vitest";
import {
  canEditProject,
  canManageArea,
  canPublish,
  canArchive,
  canViewCredentials,
  type Actor,
} from "../src/lib/permissions";
const editor: Actor = {
  id: "e",
  role: "EDITOR",
  areas: [{ areaId: "a", isManager: false }],
};
const manager: Actor = {
  ...editor,
  id: "m",
  role: "AREA_ADMIN",
  areas: [
    { areaId: "a", isManager: true },
    { areaId: "b", isManager: false },
  ],
};
const admin: Actor = { id: "s", role: "SUPER_ADMIN", areas: [] };
const internal: Actor = {
  id: "i",
  role: "INTERNAL",
  areas: [{ areaId: "a", isManager: false }],
};
describe("area permission boundaries", () => {
  it("denies visitor and internal mutations", () => {
    for (const user of [null, internal]) {
      expect(canEditProject(user, { areaId: "a" })).toBe(false);
      expect(canPublish(user, { areaId: "a" })).toBe(false);
    }
  });
  it("prevents cross-area editing even by area managers", () => {
    expect(canEditProject(editor, { areaId: "b" })).toBe(false);
    expect(canManageArea(manager, "b")).toBe(false);
    expect(canEditProject(manager, { areaId: "c" })).toBe(false);
  });
  it("requires manager approval only when review is enabled", () => {
    expect(canPublish(editor, { areaId: "a" }, false)).toBe(true);
    expect(canPublish(editor, { areaId: "a" }, true)).toBe(false);
    expect(canPublish(manager, { areaId: "a" }, true)).toBe(true);
  });
  it("allows super admin across areas", () => {
    expect(canEditProject(admin, { areaId: "z" })).toBe(true);
    expect(canManageArea(admin, "z")).toBe(true);
  });
  it("limits editor archive to own projects", () => {
    expect(canArchive(editor, { areaId: "a", createdById: "e" })).toBe(true);
    expect(canArchive(editor, { areaId: "a", createdById: "other" })).toBe(
      false,
    );
  });
  it("keeps hidden credentials inside the authorized panel", () => {
    const hidden = { areaId: "a", credentialVisibility: "HIDDEN" as const };
    expect(canViewCredentials(editor, hidden)).toBe(false);
    expect(canViewCredentials(editor, hidden, true)).toBe(true);
    expect(canViewCredentials({ ...editor, areas: [] }, hidden, true)).toBe(
      false,
    );
    expect(canViewCredentials(internal, hidden, true)).toBe(false);
  });
  it("requires a session for internal credentials", () => {
    expect(
      canViewCredentials(null, {
        areaId: "a",
        credentialVisibility: "INTERNAL",
      }),
    ).toBe(false);
    expect(
      canViewCredentials(internal, {
        areaId: "a",
        credentialVisibility: "INTERNAL",
      }),
    ).toBe(true);
    expect(
      canViewCredentials(null, { areaId: "a", credentialVisibility: "PUBLIC" }),
    ).toBe(true);
  });
});
