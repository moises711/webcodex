import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "node:crypto";
import { encryptCredential, decryptCredential } from "../src/lib/crypto";
beforeEach(() => {
  process.env.CREDENTIALS_ENC_KEY = randomBytes(32).toString("base64");
});
describe("AES-256-GCM", () => {
  it("roundtrips unicode without plaintext and uses random IVs", () => {
    const value = "Prueba-ñ-🔑";
    const a = encryptCredential(value);
    expect(a).not.toContain(value);
    expect(a).not.toBe(encryptCredential(value));
    expect(decryptCredential(a)).toBe(value);
  });
  it("rejects tampered ciphertext", () => {
    const parts = encryptCredential("demo").split(":");
    const bytes = Buffer.from(parts[2], "base64");
    bytes[0] ^= 1;
    parts[2] = bytes.toString("base64");
    expect(() => decryptCredential(parts.join(":"))).toThrow();
  });
  it("rejects wrong keys and malformed input", () => {
    const encrypted = encryptCredential("demo");
    process.env.CREDENTIALS_ENC_KEY = randomBytes(32).toString("base64");
    expect(() => decryptCredential(encrypted)).toThrow();
    expect(() => decryptCredential("bad")).toThrow();
    process.env.CREDENTIALS_ENC_KEY = "wrong";
    expect(() => encryptCredential("demo")).toThrow();
  });
});
