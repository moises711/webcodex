import { ExpandCard } from "@/components/panel/expand-card";
import { requireEditor } from "@/lib/session";
import { canManageArea } from "@/lib/permissions";
import { db } from "@/lib/db";
import { AreaForm } from "@/components/panel/area-form";
import { notFound } from "next/navigation";
export default async function Page() {
  const user = await requireEditor();
  const areas = await db.area.findMany({ orderBy: { order: "asc" } });
  const managed = areas.filter((a) => canManageArea(user, a.id));
  if (!managed.length) notFound();
  return (
    <div className="form-grid">
      <h1>Mis áreas</h1>
      {managed.map((a) => (
        <ExpandCard
          key={a.id}
          title={<h2>{a.name}</h2>}
          label="Ver información"
        >
          <AreaForm area={a} />
        </ExpandCard>
      ))}
    </div>
  );
}
