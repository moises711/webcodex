import {
  allowedRequestOrigin,
  clientAddress,
  readBodyLimited,
  RequestSecurityError,
} from "@/lib/request-security";
import { consumeRequestLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";
const schema = z.object({ visitId: z.uuid() }).strict();

export async function POST(request: Request) {
  if (!allowedRequestOrigin(request))
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    return Response.json({ error: "Formato no permitido" }, { status: 415 });
  let payload: unknown;
  try {
    payload = JSON.parse(
      (await readBodyLimited(request, 1024)).toString("utf8"),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof RequestSecurityError
            ? error.message
            : "Visita no válida.",
      },
      { status: error instanceof RequestSecurityError ? error.status : 400 },
    );
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    return Response.json({ error: "Visita no válida." }, { status: 400 });
  try {
    if (
      !(await consumeRequestLimit(
        "page-views",
        clientAddress(request.headers),
        60,
        60,
      ))
    )
      return Response.json(
        { error: "Demasiadas solicitudes." },
        {
          status: 429,
          headers: { "Retry-After": "60", "Cache-Control": "no-store" },
        },
      );
    const total = await db.$transaction(async (tx) => {
      await tx.pageVisit.createMany({
        data: [{ id: parsed.data.visitId }],
        skipDuplicates: true,
      });
      return tx.pageVisit.count();
    });
    return Response.json(
      { total },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Contador no disponible." }, { status: 503 });
  }
}
