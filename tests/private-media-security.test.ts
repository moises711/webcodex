import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  actor: null as null | {
    id: string;
    role: "EDITOR";
    mustChangePassword: boolean;
    areas: { areaId: string; isManager: boolean }[];
  },
  published: false,
  reads: 0,
}));
vi.mock("../src/lib/session", () => ({ getActor: async () => state.actor }));
vi.mock("../src/lib/storage", () => ({
  downloadStoredImage: async () => {
    state.reads++;
    return new Uint8Array([82, 73, 70, 70]);
  },
}));
vi.mock("../src/lib/db", () => ({
  db: {
    media: {
      findMany: async () => [
        {
          project: {
            areaId: "private-area",
            status: state.published ? "PUBLISHED" : "DRAFT",
            area: { isActive: true },
          },
        },
      ],
    },
    area: { findMany: async () => [] },
  },
}));
import { GET } from "../src/app/api/media/[key]/route";
const params = {
  params: Promise.resolve({ key: "550e8400-e29b-41d4-a716-446655440000.webp" }),
};
const request = new Request("https://portal.example/api/media/image.webp");
beforeEach(() => {
  state.actor = null;
  state.published = false;
  state.reads = 0;
});
describe("media privacy", () => {
  it("denies anonymous and cross-area access before reading private files", async () => {
    expect((await GET(request, params)).status).toBe(404);
    state.actor = {
      id: "other",
      role: "EDITOR",
      mustChangePassword: false,
      areas: [{ areaId: "another-area", isManager: false }],
    };
    expect((await GET(request, params)).status).toBe(404);
    expect(state.reads).toBe(0);
  });
  it("denies pending-password sessions even when they belong to the area", async () => {
    state.actor = {
      id: "owner",
      role: "EDITOR",
      mustChangePassword: true,
      areas: [{ areaId: "private-area", isManager: false }],
    };
    expect((await GET(request, params)).status).toBe(404);
    expect(state.reads).toBe(0);
  });
  it("serves private images to their authorized editor without shared caching", async () => {
    state.actor = {
      id: "owner",
      role: "EDITOR",
      mustChangePassword: false,
      areas: [{ areaId: "private-area", isManager: false }],
    };
    const response = await GET(request, params);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-type")).toBe("image/webp");
  });
  it("keeps published images visible to visitors", async () => {
    state.published = true;
    expect((await GET(request, params)).status).toBe(200);
  });
});
