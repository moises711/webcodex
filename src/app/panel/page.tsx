import { auditLabel } from "@/lib/audit-labels";
import Link from "next/link";
import { getDashboard, getPanelAreas } from "@/server/queries/panel";
import { AreaSelector } from "@/components/panel/area-selector";
const labels = {
  DRAFT: "Borradores",
  IN_REVIEW: "En revisión",
  PUBLISHED: "Publicados",
  ARCHIVED: "Archivados",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ areaId?: string }>;
}) {
  const { areaId } = await searchParams;
  const [data, areas] = await Promise.all([
    getDashboard(areaId),
    getPanelAreas(),
  ]);
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">ESPACIO DE TRABAJO</p>
          <h1>Resumen</h1>
        </div>
        <Link className="button primary" href="/panel/contenido">
          Crear contenido +
        </Link>
      </div>
      <AreaSelector areas={areas} value={areaId} path="/panel" />
      <div className="cards-grid dashboard-stats">
        {Object.entries(labels).map(([key, label]) => (
          <section className="panel-card" key={key}>
            <p className="notice">{label}</p>
            <h2>
              {data.counts.find((c) => c.status === key)?._count._all || 0}
            </h2>
          </section>
        ))}
      </div>
      <section className="panel-card dashboard-activity">
        <h2>Actividad reciente</h2>
        {data.recent.length ? (
          <ul>
            {data.recent.map((log) => (
              <li key={log.id} className="credential">
                <strong>{log.user?.name || "Visitante"}</strong> ·{" "}
                {auditLabel(log.action)}
                <p className="notice">
                  {log.createdAt.toLocaleString("es-PE", {
                    timeZone: "America/Lima",
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="notice">Todavía no hay actividad registrada.</p>
        )}
      </section>
    </>
  );
}
