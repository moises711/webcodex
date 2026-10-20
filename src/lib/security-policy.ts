export function contentSecurityPolicy(
  nonce: string,
  development: boolean,
  storageUrl?: string,
) {
  if (!/^[a-zA-Z0-9+/=_-]{16,}$/.test(nonce))
    throw new Error("Invalid CSP nonce");
  let imageOrigin = "";
  if (storageUrl) {
    const url = new URL(storageUrl);
    if (url.protocol === "https:") imageOrigin = url.origin;
  }
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${imageOrigin}; font-src 'self'; connect-src 'self'${development ? " ws: wss:" : ""}; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'`;
}
