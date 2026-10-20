import "server-only";
import { auth } from "./auth";
import { db } from "./db";
import { redirect } from "next/navigation";
export async function getActor() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      sessionVersion: true,
      areas: {
        select: {
          areaId: true,
          isManager: true,
          area: { select: { name: true, isActive: true } },
        },
      },
    },
  });
  if (!user?.isActive || user.sessionVersion !== session.user.sessionVersion)
    return null;
  return { ...user, areas: user.areas.filter((a) => a.area.isActive) };
}
export async function requireActor() {
  const user = await getActor();
  if (!user) redirect("/ingresar");
  return user;
}
export async function requireEditor() {
  const user = await requireActor();
  if (user.mustChangePassword) redirect("/cambiar-clave");
  if (user.role === "INTERNAL") redirect("/");
  return user;
}
