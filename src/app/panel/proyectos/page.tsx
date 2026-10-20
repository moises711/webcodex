import Link from "next/link";
import { getPanelProjects, getPanelAreas } from "@/server/queries/panel";
import { DeleteRecord } from "@/components/panel/delete-record";
import { requireEditor } from "@/lib/session";
import { canArchive } from "@/lib/permissions";
const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    areaId?: string;
    type?: string;
  }>;
}) {
  const actor = await requireEditor();
  const filters = await searchParams;
  const [projects, areas] = await Promise.all([
    getPanelProjects(filters),
    getPanelAreas(),
  ]);
  return (
    <>
      <div className="section-heading">
        <h1>Trabajos y publicaciones</h1>
        <Link className="button primary" href="/panel/contenido">
          Crear contenido +
        </Link>
      </div>
      <form className="filters">
        <label>
          Buscar
          <input name="q" maxLength={200} defaultValue={filters.q} />
        </label>
        <label>
          Estado
          <select name="status" defaultValue={filters.status || ""}>
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Área
          <select name="areaId" defaultValue={filters.areaId || ""}>
            <option value="">Todas mis áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select name="type" defaultValue={filters.type || ""}>
            <option value="">Todos</option>
            <option value="PROJECT">Trabajo con fotos</option>
            <option value="SYSTEM">Sistemas web</option>
            <option value="WEBSITE">Páginas web</option>
          </select>
        </label>
        <button className="button secondary">Filtrar</button>
      </form>
      {projects.length ? (
        <div className="panel-project-grid">
          {projects.map((project) => (
            <article className="panel-card panel-project-card" key={project.id}>
              <Link
                className="panel-project-open"
                href={`/panel/proyectos/${project.id}`}
                aria-label={`Abrir proyecto: ${project.title}`}
              >
                <div className="panel-project-meta">
                  <span className="badge">{statusLabels[project.status]}</span>
                  <span>
                    {project.type === "SYSTEM"
                      ? "Sistema web"
                      : project.type === "WEBSITE"
                        ? "Página web"
                        : "Proyecto"}
                  </span>
                </div>
                <h2>{project.title}</h2>
                <p className="panel-project-summary">{project.summary}</p>
                <p className="notice">
                  {project.area.name}
                  {project.year ? ` · ${project.year}` : ""}
                </p>
              </Link>
              <div className="panel-project-actions">
                <Link
                  className="button primary button-small project-open-button"
                  href={`/panel/proyectos/${project.id}`}
                >
                  Abrir proyecto
                </Link>
                <Link
                  className="button secondary button-small"
                  href={`/panel/proyectos/${project.id}/vista-previa`}
                >
                  Vista previa
                </Link>
                {canArchive(actor, project) && (
                  <DeleteRecord
                    id={project.id}
                    entity="Project"
                    name={project.title}
                    warning="También se eliminarán las imágenes y credenciales asociadas."
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel-card empty-state">
          <h3>No hay contenido en esta vista</h3>
          <p>
            Crea contenido real seleccionando un área, o cambia los filtros.
          </p>
        </div>
      )}
      {projects.length > 0 && (
        <p className="notice">Se muestran hasta 100 publicaciones.</p>
      )}
    </>
  );
}
