import { downloadStoredImage } from "@/lib/storage";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { canEditProject, canManageArea } from "@/lib/permissions";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!/^[0-9a-f-]{36}\.webp$/.test(key))
    return new Response(null, { status: 404 });
  const candidates = await db.media.findMany({
    where: { storageKey: { in: [`local/${key}`, key] } },
    include: { project: { include: { area: true } } },
  });
  const areas = await db.area.findMany({
    where: { coverImageUrl: `/api/media/${key}` },
  });
  if (!candidates.length && !areas.length)
    return new Response(null, { status: 404 });
  const published =
    areas.some((a) => a.isActive) ||
    candidates.some(
      (m) => m.project.status === "PUBLISHED" && m.project.area.isActive,
    );
  if (!published) {
    const user = await getActor();
    if (
      !user ||
      user.mustChangePassword ||
      !(
        candidates.some((m) => canEditProject(user, m.project)) ||
        areas.some((a) => canManageArea(user, a.id))
      )
    )
      return new Response(null, { status: 404 });
  }
  try {
    const data = await downloadStoredImage(key);
    return new Response(Buffer.from(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
