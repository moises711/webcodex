export type Actor = {
  id: string;
  role: "SUPER_ADMIN" | "AREA_ADMIN" | "EDITOR" | "INTERNAL";
  areas: { areaId: string; isManager: boolean }[];
  mustChangePassword?: boolean;
};
type ProjectScope = { areaId: string; createdById?: string };
export const isSuperAdmin = (user: Actor | null) =>
  user?.role === "SUPER_ADMIN";
export function canEditProject(user: Actor | null, project: ProjectScope) {
  return (
    !!user &&
    (isSuperAdmin(user) ||
      (user.role !== "INTERNAL" &&
        user.areas.some((a) => a.areaId === project.areaId)))
  );
}
export function canManageArea(user: Actor | null, areaId: string) {
  return (
    !!user &&
    (isSuperAdmin(user) ||
      (user.role !== "INTERNAL" &&
        user.areas.some((a) => a.areaId === areaId && a.isManager)))
  );
}
export function canPublish(
  user: Actor | null,
  project: ProjectScope,
  requireReview = false,
) {
  return (
    canEditProject(user, project) &&
    (!requireReview || canManageArea(user, project.areaId))
  );
}
export function canArchive(user: Actor | null, project: ProjectScope) {
  return (
    canManageArea(user, project.areaId) ||
    (canEditProject(user, project) && project.createdById === user?.id)
  );
}
export function canViewCredentials(
  user: Actor | null,
  system: {
    areaId: string;
    credentialVisibility: "PUBLIC" | "INTERNAL" | "HIDDEN";
  },
  inPanel = false,
) {
  if (user?.mustChangePassword) user = null;
  if (system.credentialVisibility === "PUBLIC") return true;
  if (system.credentialVisibility === "INTERNAL") return !!user;
  return inPanel && canEditProject(user, system);
}
export function projectScope(user: Actor) {
  return isSuperAdmin(user)
    ? {}
    : {
        areaId: {
          in: user.role === "INTERNAL" ? [] : user.areas.map((a) => a.areaId),
        },
      };
}
