import { ExpandCard } from "@/components/panel/expand-card";
import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { UserForm } from "@/components/panel/user-form";
import { DeleteRecord } from "@/components/panel/delete-record";
export default async function Page() {
  const actor = await requireSuperAdmin();
  const [users, areas] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        areas: { select: { areaId: true, isManager: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.area.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return (
    <div className="form-grid">
      <h1>Usuarios del portal</h1>
      <ExpandCard title="Crear usuario" label="Crear">
        <UserForm areas={areas} />
      </ExpandCard>
      {users.map((user) => (
        <ExpandCard
          key={user.id}
          title={
            <>
              {user.name} · {user.email} ·{" "}
              {user.isActive ? "Activo" : "Inactivo"}
            </>
          }
        >
          <UserForm user={user} areas={areas} />
          {user.id !== actor.id && (
            <DeleteRecord
              id={user.id}
              entity="User"
              name={user.email}
              warning="Sus proyectos se conservarán y quedarán a tu nombre."
            />
          )}
        </ExpandCard>
      ))}
    </div>
  );
}
