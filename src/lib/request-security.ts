import { isIP } from "node:net";
export class RequestSecurityError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export function clientAddress(headers: Headers) {
  if (process.env.TRUST_PROXY !== "true") return "untrusted";
  const address = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return address && address.length <= 64 && isIP(address)
    ? address
    : "untrusted";
}
export function allowedRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin === "null" ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return false;
  try {
    if (new URL(origin).origin !== origin) return false;
  } catch {
    return false;
  }
  const allowed = new Set([new URL(request.url).origin]);
  for (const value of [process.env.APP_URL, process.env.AUTH_URL]) {
    if (value) {
      try {
        allowed.add(new URL(value).origin);
      } catch {
        /* Invalid configuration is never an allowed origin. */
      }
    }
  }
  return allowed.has(origin);
}
export async function readBodyLimited(
  request: Request,
  maximum: number,
  timeoutMs = 10000,
) {
  const length = request.headers.get("content-length");
  if (
    length !== null &&
    (!/^\d+$/.test(length) || !Number.isSafeInteger(Number(length)))
  )
    throw new RequestSecurityError(400, "Tamaño de solicitud inválido");
  if (length !== null && Number(length) > maximum)
    throw new RequestSecurityError(
      413,
      "La solicitud supera el tamaño permitido",
    );
  const reader = request.body?.getReader();
  if (!reader) throw new RequestSecurityError(400, "Datos requeridos");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(new RequestSecurityError(408, "La solicitud tardó demasiado")),
      timeoutMs,
    );
  });
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      total += value.byteLength;
      if (total > maximum)
        throw new RequestSecurityError(
          413,
          "La solicitud supera el tamaño permitido",
        );
      chunks.push(value);
    }
    return Buffer.concat(chunks, total);
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof RequestSecurityError) throw error;
    throw new RequestSecurityError(400, "No se pudo leer la solicitud");
  } finally {
    if (timer) clearTimeout(timer);
    reader.releaseLock();
  }
}
