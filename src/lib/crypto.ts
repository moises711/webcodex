import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function key() {
  const raw = process.env.CREDENTIALS_ENC_KEY;
  if (!raw) throw new Error("Falta CREDENTIALS_ENC_KEY");
  const value = Buffer.from(raw, "base64");
  if (value.length !== 32)
    throw new Error("CREDENTIALS_ENC_KEY debe contener 32 bytes");
  return value;
}
export function encryptCredential(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((x) => x.toString("base64"))
    .join(":");
}
export function decryptCredential(value: string) {
  const parts = value.split(":");
  if (parts.length !== 3) throw new Error("Formato de credencial inválido");
  const [iv, tag, encrypted] = parts.map((x) => Buffer.from(x, "base64"));
  if (iv.length !== 12 || tag.length !== 16)
    throw new Error("Formato de credencial inválido");
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}
