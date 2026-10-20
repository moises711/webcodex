import { requireSuperAdmin } from "@/lib/admin";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();
  return children;
}
