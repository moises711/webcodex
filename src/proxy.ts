import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { randomBytes } from "node:crypto";
import { allowedRequestOrigin } from "@/lib/request-security";
import { contentSecurityPolicy } from "@/lib/security-policy";
export async function proxy(request: NextRequest) {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    !allowedRequestOrigin(request)
  )
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const length = request.headers.get("content-length");
    const maximum =
      request.nextUrl.pathname === "/api/upload"
        ? 6 * 1024 * 1024
        : request.nextUrl.pathname === "/api/page-views"
          ? 1024
          : request.nextUrl.pathname === "/api/proformas"
            ? 64 * 1024
            : 256 * 1024;
    if (
      length !== null &&
      (!/^\d+$/.test(length) || !Number.isSafeInteger(Number(length)))
    )
      return NextResponse.json({ error: "Tamaño inválido" }, { status: 400 });
    if (length !== null && Number(length) > maximum)
      return NextResponse.json(
        { error: "Solicitud demasiado grande" },
        { status: 413 },
      );
  }
  if (
    request.nextUrl.pathname === "/panel" ||
    request.nextUrl.pathname.startsWith("/panel/")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: request.nextUrl.protocol === "https:",
    });
    if (!token) return NextResponse.redirect(new URL("/ingresar", request.url));
  }
  const nonce = randomBytes(18).toString("base64");
  const csp = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV !== "production",
    process.env.STORAGE_PUBLIC_URL,
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|resources/|technologies/|brand/).*)",
  ],
};
