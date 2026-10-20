import "server-only";
import { requireEditor } from "./session";
import { notFound } from "next/navigation";
export async function requireSuperAdmin() {
  const user = await requireEditor();
  if (user.role !== "SUPER_ADMIN") notFound();
  return user;
}
