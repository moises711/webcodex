import { afterEach, describe, expect, it } from "vitest";
import {
  allowedRequestOrigin,
  clientAddress,
  readBodyLimited,
} from "../src/lib/request-security";
import { contentSecurityPolicy } from "../src/lib/security-policy";
import { isSafeRichContent } from "../src/lib/rich-content-validation";
import { canViewCredentials } from "../src/lib/permissions";
const env = {
  APP_URL: process.env.APP_URL,
  AUTH_URL: process.env.AUTH_URL,
  TRUST_PROXY: process.env.TRUST_PROXY,
};
afterEach(() => {
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
describe("security boundaries", () => {
  it("rejects missing, null, malformed and cross-site origins", () => {
    process.env.APP_URL = "https://portal.example";
    process.env.AUTH_URL = "https://portal.example";
    for (const origin of [
      undefined,
      "null",
      "https://evil.example",
      "https://portal.example/path",
      "https://portal.example.evil.example",
    ]) {
      const headers: Record<string, string> = {};
      if (origin) headers.origin = origin;
      expect(
        allowedRequestOrigin(
          new Request("https://portal.example/api/upload", {
            method: "POST",
            headers,
          }),
        ),
      ).toBe(false);
    }
    expect(
      allowedRequestOrigin(
        new Request("https://portal.example/api/upload", {
          method: "POST",
          headers: { origin: "https://portal.example" },
        }),
      ),
    ).toBe(true);
    expect(
      allowedRequestOrigin(
        new Request("https://portal.example/api/upload", {
          method: "POST",
          headers: {
            origin: "https://portal.example",
            "sec-fetch-site": "cross-site",
          },
        }),
      ),
    ).toBe(false);
  });
  it("ignores forged forwarded IP headers unless a trusted proxy is configured", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.8, 127.0.0.1",
    });
    process.env.TRUST_PROXY = "false";
    expect(clientAddress(headers)).toBe("untrusted");
    process.env.TRUST_PROXY = "true";
    expect(clientAddress(headers)).toBe("203.0.113.8");
    expect(clientAddress(new Headers({ "x-forwarded-for": "not-an-ip" }))).toBe(
      "untrusted",
    );
  });
  it("enforces actual stream size even when Content-Length lies or is absent", async () => {
    expect(
      (
        await readBodyLimited(
          new Request("https://portal.example", { method: "POST", body: "ok" }),
          2,
        )
      ).toString(),
    ).toBe("ok");
    await expect(
      readBodyLimited(
        new Request("https://portal.example", {
          method: "POST",
          headers: { "content-length": "1" },
          body: "too large",
        }),
        2,
      ),
    ).rejects.toMatchObject({ status: 413 });
    await expect(
      readBodyLimited(
        new Request("https://portal.example", {
          method: "POST",
          headers: { "content-length": "999" },
          body: "x",
        }),
        2,
      ),
    ).rejects.toMatchObject({ status: 413 });
    await expect(
      readBodyLimited(
        new Request("https://portal.example", {
          method: "POST",
          headers: { "content-length": "bad" },
          body: "x",
        }),
        2,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("stops slow request streams instead of retaining them indefinitely", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull: () => new Promise<void>(() => {}),
    });
    const request = new Request("https://portal.example", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    await expect(readBodyLimited(request, 20, 10)).rejects.toMatchObject({
      status: 408,
    });
  });
  it("uses nonce-authorized scripts without allowing inline scripts in production", () => {
    const csp = contentSecurityPolicy("0123456789abcdef01234567", false);
    const scripts = csp
      .split(";")
      .find((part) => part.trim().startsWith("script-src"))!;
    expect(scripts).toContain("'nonce-0123456789abcdef01234567'");
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(() => contentSecurityPolicy("bad' injected", false)).toThrow();
  });
  it("rejects malformed, oversized and excessively nested saved documents", () => {
    expect(
      isSafeRichContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "<script>plain text</script>" }],
          },
        ],
      }),
    ).toBe(true);
    for (const node of [
      undefined,
      [],
      { type: "doc", content: "bad" },
      { type: "text", text: {} },
      { type: "paragraph", marks: [null] },
      { type: "text", text: "x".repeat(100001) },
    ])
      expect(isSafeRichContent(node)).toBe(false);
    let nested: unknown = { type: "text", text: "end" };
    for (let i = 0; i < 35; i++)
      nested = { type: "paragraph", content: [nested] };
    expect(isSafeRichContent(nested)).toBe(false);
    expect(
      isSafeRichContent({
        type: "doc",
        content: Array.from({ length: 1001 }, () => ({ type: "paragraph" })),
      }),
    ).toBe(false);
  });
  it("does not disclose internal credentials to sessions awaiting a password change", () => {
    const user = {
      id: "user",
      role: "EDITOR" as const,
      areas: [{ areaId: "a", isManager: false }],
      mustChangePassword: true,
    };
    expect(
      canViewCredentials(user, {
        areaId: "a",
        credentialVisibility: "INTERNAL",
      }),
    ).toBe(false);
    expect(
      canViewCredentials(
        user,
        { areaId: "a", credentialVisibility: "HIDDEN" },
        true,
      ),
    ).toBe(false);
  });
});
