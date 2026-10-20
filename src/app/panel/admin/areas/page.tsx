import { ExpandCard } from "@/components/panel/expand-card";
import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { AreaForm } from "@/components/panel/area-form";
import { AreaOrder } from "@/components/panel/area-order";
export default async function Page() {
  await requireSuperAdmin();
  const areas = await db.area.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: true } } },
  });
  return (
    <div className="form-grid">
      <h1>Administrar áreas</h1>
      <p className="notice">
        Trabajamos con las áreas actuales. Actualiza su información y agrega
        imágenes y proyectos desde el panel.
      </p>
      <ExpandCard title="Orden de las áreas" label="Reordenar">
        <AreaOrder initial={areas.map((a) => ({ id: a.id, name: a.name }))} />
      </ExpandCard>
      {areas.map((area) => (
        <ExpandCard
          key={area.id}
          label="Ver información"
          title={
            <>
              {area.name} · {area._count.projects} proyectos ·{" "}
              {area.isActive ? "Activa" : "Inactiva"}
            </>
          }
        >
          <AreaForm area={area} />
        </ExpandCard>
      ))}
    </div>
  );
}
