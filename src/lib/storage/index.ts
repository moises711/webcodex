import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
export interface StorageProvider {
  download(key: string): Promise<Uint8Array>;
  upload(
    key: string,
    data: Buffer,
  ): Promise<{ url: string; storageKey: string }>;
}
class LocalStorage implements StorageProvider {
  private directory() {
    const configured = process.env.STORAGE_LOCAL_DIR;
    if (configured && !path.isAbsolute(configured))
      throw new Error("STORAGE_LOCAL_DIR debe ser una ruta absoluta privada");
    return (
      configured || path.join(process.cwd(), ".local", "resources", "images")
    );
  }
  async download(key: string) {
    if (!/^[0-9a-f-]{36}\.webp$/.test(key))
      throw new Error("Invalid media key");
    return readFile(path.join(this.directory(), key))
      .catch(() =>
        readFile(
          path.join(process.cwd(), ".local", "resources", "images", key),
        ),
      )
      .catch(() => readFile(path.join(process.cwd(), ".local", "media", key)));
  }
  async upload(key: string, data: Buffer) {
    if (!/^[0-9a-f-]{36}\.webp$/.test(key))
      throw new Error("Invalid media key");
    const directory = this.directory();
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, key), data);
    return { url: `/api/media/${key}`, storageKey: `local/${key}` };
  }
}
class S3Storage implements StorageProvider {
  private async client() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      region: process.env.STORAGE_REGION || "auto",
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
    });
  }
  async download(key: string) {
    if (!/^[0-9a-f-]{36}\.webp$/.test(key))
      throw new Error("Invalid media key");
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const object = await (
      await this.client()
    ).send(
      new GetObjectCommand({ Bucket: process.env.STORAGE_BUCKET, Key: key }),
    );
    if (!object.Body || (object.ContentLength || 0) > 20 * 1024 * 1024)
      throw new Error("Invalid media object");
    return object.Body.transformToByteArray();
  }
  async upload(key: string, data: Buffer) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await (
      await this.client()
    ).send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET,
        Key: key,
        Body: data,
        ContentType: "image/webp",
      }),
    );
    return {
      url: `/api/media/${key}`,
      storageKey: key,
    };
  }
}
export function storageProvider(): StorageProvider {
  if (process.env.STORAGE_LOCAL_DIR) {
    if (!path.isAbsolute(process.env.STORAGE_LOCAL_DIR))
      throw new Error("STORAGE_LOCAL_DIR debe ser una ruta absoluta privada");
    return new LocalStorage();
  }
  if (
    process.env.STORAGE_BUCKET &&
    process.env.STORAGE_ACCESS_KEY_ID &&
    process.env.STORAGE_SECRET_ACCESS_KEY
  )
    return new S3Storage();
  if (process.env.NODE_ENV !== "production") return new LocalStorage();
  throw new Error("Configura S3/R2 antes de subir imágenes en producción");
}

// Existing local files remain readable during a storage migration; both paths
// are reached only after the media route has verified publication or ownership.
export async function downloadStoredImage(key: string) {
  return new LocalStorage()
    .download(key)
    .catch(() => storageProvider().download(key));
}
