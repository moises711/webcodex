import {
  allowedRequestOrigin,
  readBodyLimited,
  RequestSecurityError,
} from "@/lib/request-security";
import { consumeRequestLimit } from "@/lib/rate-limit";
import { getActor } from "@/lib/session";
import { proformaSchema } from "@/lib/proforma";
import { generateProformaPdf } from "@/server/pdf/proforma";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await getActor();
  if (!user || user.mustChangePassword || user.role !== "SUPER_ADMIN")
    return Response.json({ error: "Acceso no autorizado" }, { status: 403 });
  if (!allowedRequestOrigin(request))
    return Response.json({ error: "Origen no permitido" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Formato no permitido" }, { status: 415 });
  let payload: unknown;
  try {
    if (!(await consumeRequestLimit("pdf", user.id, 20, 300)))
      return Response.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429, headers: { "Retry-After": "300" } },
      );
    payload = JSON.parse(
      (await readBodyLimited(request, 64 * 1024)).toString("utf8"),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof RequestSecurityError
            ? error.message
            : "Datos inválidos",
      },
      { status: error instanceof RequestSecurityError ? error.status : 400 },
    );
  }
  const result = proformaSchema.safeParse(payload);
  if (!result.success)
    return Response.json(
      { error: result.error.issues[0]?.message || "Revisa los datos" },
      { status: 400 },
    );
  try {
    const pdf = await generateProformaPdf(result.data);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Proforma-${result.data.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "No se pudo generar el PDF. Intenta nuevamente." },
      { status: 500 },
    );
  }
}
