import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
vi.mock("server-only", () => ({}));
vi.mock("@aws-sdk/client-s3", () => {
  throw new Error("S3 must not load for local storage");
});
import { storageProvider } from "../src/lib/storage";
const directories: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(
    directories.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});
describe("persistent private storage", () => {
  it("uploads and reads in production without loading S3", async () => {
    const directory = await mkdtemp(
      path.join(os.tmpdir(), "codex-media-test-"),
    );
    directories.push(directory);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STORAGE_LOCAL_DIR", directory);
    const key = "550e8400-e29b-41d4-a716-446655440000.webp";
    const image = Buffer.from("image-test");
    const result = await storageProvider().upload(key, image);
    expect(result.url).toBe(`/api/media/${key}`);
    expect(await readFile(path.join(directory, key))).toEqual(image);
    expect(Buffer.from(await storageProvider().download(key))).toEqual(image);
    await expect(
      storageProvider().upload("../outside.webp", image),
    ).rejects.toThrow("Invalid media key");
  });
  it("rejects a relative production directory", () => {
    vi.stubEnv("STORAGE_LOCAL_DIR", "public/uploads");
    expect(() => storageProvider()).toThrow("ruta absoluta privada");
  });
  it("does not silently enable local production storage", () => {
    for (const key of [
      "STORAGE_LOCAL_DIR",
      "STORAGE_BUCKET",
      "STORAGE_ACCESS_KEY_ID",
      "STORAGE_SECRET_ACCESS_KEY",
    ])
      vi.stubEnv(key, "");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => storageProvider()).toThrow("Configura S3/R2");
  });
});
