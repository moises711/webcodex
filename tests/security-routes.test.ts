import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ allowed: true, queries: 0 }));
vi.mock("../src/lib/rate-limit", () => ({
  consumeRequestLimit: async () => state.allowed,
}));
vi.mock("../src/lib/db", () => ({
  db: {
    $transaction: async (fn: (tx: unknown) => unknown) => {
      state.queries++;
      return fn({
        pageVisit: {
          createMany: async () => ({ count: 1 }),
          count: async () => 1,
        },
      });
    },
    area: { findFirst: async () => null },
    media: { findFirst: async () => null },
  },
}));
vi.mock("../src/lib/revalidate", () => ({ refreshCatalog: () => {} }));
vi.mock("../src/lib/session", () => ({
  requireEditor: async () => ({
    id: "editor",
    role: "AREA_ADMIN",
    areas: [{ areaId: "c123456789012345678901234", isManager: true }],
  }),
}));
import { POST } from "../src/app/api/page-views/route";
import { saveArea } from "../src/server/actions/admin";
beforeEach(() => {
  state.allowed = true;
  state.queries = 0;
});
const url = "http://localhost:3000/api/page-views";
function request(
  body: string,
  origin: string | null = "http://localhost:3000",
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { origin } : {}),
    },
    body,
  });
}
describe("public and area security", () => {
  it("blocks origin-less and foreign writes before touching the database", async () => {
    for (const origin of [null, "https://evil.example"])
      expect((await POST(request("{}", origin))).status).toBe(403);
    expect(state.queries).toBe(0);
  });
  it("rejects oversized and malformed counter payloads", async () => {
    expect((await POST(request("x".repeat(2048)))).status).toBe(413);
    expect((await POST(request("invalid-json"))).status).toBe(400);
    expect(state.queries).toBe(0);
  });
  it("returns 429 without creating visits when the quota is exhausted", async () => {
    state.allowed = false;
    const response = await POST(
      request(
        JSON.stringify({ visitId: "550e8400-e29b-41d4-a716-446655440000" }),
      ),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(state.queries).toBe(0);
  });
  it("continues to accept a valid visitor request under quota", async () => {
    const response = await POST(
      request(
        JSON.stringify({ visitId: "550e8400-e29b-41d4-a716-446655440000" }),
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ total: 1 });
  });
  it("prevents an area manager from assigning an image belonging to another area", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      id: "c123456789012345678901234",
      name: "Área",
      slug: "marketing",
      description: "",
      color: "#216aa3",
      icon: "Palette",
      coverImageUrl: "/api/media/550e8400-e29b-41d4-a716-446655440000.webp",
      isActive: "on",
    }))
      form.set(key, value);
    const result = await saveArea({ message: "" }, form);
    expect(result.error).toBe(true);
    expect(result.message).toContain("no pertenece");
    expect(state.queries).toBe(0);
  });
});
