import { requireEditor } from "@/lib/session";
import { canManageArea } from "@/lib/permissions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/panel/action-form";
import { assignEditor } from "@/server/actions/admin";
export default async function Page() {
  const actor = await requireEditor();
  const areas = (
    await db.area.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })
  ).filter((a) => canManageArea(actor, a.id));
  if (!areas.length) notFound();
  const editors = await db.user.findMany({
    where: { role: "EDITOR", isActive: true },
    select: {
      id: true,
      name: true,
      areas: { select: { areaId: true, isManager: true } },
    },
    orderBy: { name: "asc" },
  });
  return (
    <div className="form-grid">
      <h1>Equipo del área</h1>
      {areas.map((area) => (
        <section className="panel-card" key={area.id}>
          <h2>{area.name}</h2>
          {editors.map((editor) => (
            <div className="credential" key={editor.id}>
              <ActionForm action={assignEditor} label="Actualizar acceso">
                <input type="hidden" name="areaId" value={area.id} />
                <input type="hidden" name="userId" value={editor.id} />
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={editor.areas.some(
                      (a) => a.areaId === area.id,
                    )}
                  />
                  {editor.name}
                </label>
              </ActionForm>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
