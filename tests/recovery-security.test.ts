import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
const state = vi.hoisted(() => ({
  callbacks: [] as (() => Promise<void>)[],
  allowed: true,
  lookup: vi.fn(async () => null),
  invalidate: vi.fn(async () => ({ count: 1 })),
  change: vi.fn(async () => ({})),
  signOut: vi.fn(async () => {}),
}));
vi.mock("next/server", () => ({
  after: (fn: () => Promise<void>) => state.callbacks.push(fn),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("../src/lib/rate-limit", () => ({
  consumeRequestLimit: async () => state.allowed,
  consumeLoginAttempt: async () => state.allowed,
}));
vi.mock("../src/lib/db", () => ({
  db: {
    user: {
      findFirst: state.lookup,
      findUniqueOrThrow: async () => ({ passwordHash: "hash" }),
      update: state.change,
    },
    passwordReset: { updateMany: state.invalidate },
    auditLog: { create: async () => ({}) },
    $transaction: async (actions: Promise<unknown>[]) => Promise.all(actions),
  },
}));
vi.mock("../src/lib/auth", () => ({
  signIn: async () => {},
  signOut: state.signOut,
}));
vi.mock("../src/lib/session", () => ({
  requireActor: async () => ({ id: "existing-user" }),
}));
vi.mock("bcryptjs", () => ({
  compare: async () => true,
  hash: async () => "new-password-hash",
}));
import { requestPasswordReset } from "../src/server/actions/recovery";
import { changePassword } from "../src/server/actions/auth";
beforeEach(() => {
  state.callbacks = [];
  state.allowed = true;
  vi.clearAllMocks();
});
describe("account recovery security", () => {
  it("returns the same reply before performing account lookup or email delivery", async () => {
    const messages = [];
    for (const email of ["owner@example.com", "unknown@example.com"]) {
      const form = new FormData();
      form.set("email", email);
      messages.push(await requestPasswordReset("", form));
    }
    expect(messages[0]).toBe(messages[1]);
    expect(state.lookup).not.toHaveBeenCalled();
    expect(state.callbacks).toHaveLength(2);
    for (const work of state.callbacks) await work();
    expect(state.lookup).toHaveBeenCalledTimes(2);
  });
  it("does not schedule recovery work after a rate-limit denial", async () => {
    state.allowed = false;
    const form = new FormData();
    form.set("email", "owner@example.com");
    expect(await requestPasswordReset("", form)).toContain("Si el correo");
    expect(state.callbacks).toHaveLength(0);
    expect(state.lookup).not.toHaveBeenCalled();
  });
  it("invalidates unused reset links when the owner changes a password", async () => {
    const form = new FormData();
    form.set("current", "old-password");
    form.set("password", "new-secure-password");
    form.set("confirmation", "new-secure-password");
    await changePassword("", form);
    expect(state.invalidate).toHaveBeenCalledWith({
      where: { userId: "existing-user", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(state.change).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sessionVersion: { increment: 1 } }),
      }),
    );
  });
});
