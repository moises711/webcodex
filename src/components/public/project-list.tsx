import Link from "next/link";
import { ProjectCard } from "./cards";
import { findProjects } from "@/server/queries/public";
export type Filters = {
  q?: string;
  type?: string;
  year?: string;
  tag?: string;
  page?: string;
};
export async function ProjectList({
  filters,
  areaId,
  path,
  type,
  pageParam = "page",
}: {
  type?: "SYSTEM" | "WEBSITE" | "PROJECT";
  pageParam?: string;
  filters: Filters;
  areaId?: string;
  path: string;
}) {
  const data = await findProjects({
    ...filters,
    ...(type ? { type } : {}),
    areaId,
    page: Number(filters.page || 1),
  });
  function pageLink(page: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters))
      if (value && key !== "page" && key !== "type") query.set(key, value);
    if (!type && filters.type) query.set("type", filters.type);
    query.set(pageParam, String(page));
    return `${path}?${query}`;
  }
  return (
    <>
      <p className="notice">
        {data.total}{" "}
        {data.total === 1 ? "proyecto encontrado" : "proyectos encontrados"}
      </p>
      {data.projects.length ? (
        <div className="cards-grid">
          {data.projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No encontramos proyectos</h3>
          <p>
            {filters.q
              ? "Prueba con otros términos de búsqueda."
              : "Todavía no hay trabajos publicados en esta sección."}
          </p>
        </div>
      )}
      <nav className="pagination" aria-label="Paginación">
        {data.page > 1 && <Link href={pageLink(data.page - 1)}> Anterior</Link>}
        {data.pages > 0 && (
          <span>
            Página {data.page} de {data.pages}
          </span>
        )}
        {data.page < data.pages && (
          <Link href={pageLink(data.page + 1)}>Siguiente </Link>
        )}
      </nav>
    </>
  );
}
export function SearchForm({
  filters,
  path,
}: {
  filters: Filters;
  path: string;
}) {
  return (
    <form action={path} className="filters" role="search">
      <label>
        Buscar
        <input
          name="q"
          defaultValue={filters.q}
          maxLength={200}
          placeholder="Buscar trabajos y proyectos"
        />
      </label>
      <button type="submit" className="button primary">
        Buscar
      </button>
    </form>
  );
}
