import { PublicHero } from "@/components/public/public-hero";
import {
  TechnologyShowcase,
  TechnologyCatalog,
} from "@/components/public/technology-showcase";
import { matchesService, services } from "@/lib/services";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArea } from "@/server/queries/public";
import { ProjectList, type Filters } from "@/components/public/project-list";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const area = await getArea((await params).slug);
  return {
    title: area?.name || "Área no encontrada",
    description: area?.description || "Proyectos por área",
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<
    Filters & { systemsPage?: string; websitesPage?: string }
  >;
}) {
  const area = await getArea((await params).slug);
  if (!area) notFound();
  const filters = await searchParams;
  const path = `/${area.slug}`;
  return (
    <div className="container section">
      <Link className="text-link" href="/servicios">
        Todas las áreas
      </Link>
      <PublicHero areaIds={[area.id]} label={`Imágenes de ${area.name}`}>
        <p className="eyebrow">ÁREA DE TRABAJO</p>
        <h1>{area.name}</h1>
        <p className="hero-description">{area.description}</p>
      </PublicHero>

      <div className="area-toolbar">
        <p className="notice">
          Explora los trabajos publicados por este equipo.
        </p>
        <Link className="button secondary button-small" href="/panel/mi-area">
          Gestionar mi área
        </Link>
      </div>
      {matchesService(area.slug, area.name, services[0].matches) && (
        <TechnologyShowcase />
      )}
      <section aria-labelledby="area-projects-title">
        <div className="section-heading">
          <h2 id="area-projects-title">Explora nuestro trabajo</h2>
        </div>
        {area.slug === "sistemas" ? (
          <div className="project-sections">
            <nav className="stack" aria-label="Secciones de Sistemas">
              <Link className="button secondary" href="#sistemas-web">
                Sistemas web
              </Link>
              <Link className="button secondary" href="#paginas-web">
                Páginas web
              </Link>
            </nav>
            <section
              id="sistemas-web"
              className="project-section"
              aria-labelledby="systems-title"
            >
              <h2 id="systems-title">Sistemas web</h2>
              <p className="notice">
                Conoce los sistemas y consulta sus accesos de demostración.
              </p>
              <ProjectList
                filters={{ ...filters, page: filters.systemsPage }}
                areaId={area.id}
                path={path}
                type="SYSTEM"
                pageParam="systemsPage"
              />
            </section>
            <section
              id="paginas-web"
              className="project-section"
              aria-labelledby="websites-title"
            >
              <h2 id="websites-title">Páginas web</h2>
              <p className="notice">
                Imágenes de referencia y enlaces para visitar cada página.
              </p>
              <ProjectList
                filters={{ ...filters, page: filters.websitesPage }}
                areaId={area.id}
                path={path}
                type="WEBSITE"
                pageParam="websitesPage"
              />
            </section>
            <details>
              <summary>Otros proyectos existentes</summary>
              <ProjectList
                filters={filters}
                areaId={area.id}
                path={path}
                type="PROJECT"
              />
            </details>
          </div>
        ) : (
          <ProjectList filters={filters} areaId={area.id} path={path} />
        )}
      </section>
      {matchesService(area.slug, area.name, services[0].matches) && (
        <TechnologyCatalog />
      )}
    </div>
  );
}
