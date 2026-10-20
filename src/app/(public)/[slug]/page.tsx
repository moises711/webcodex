import { requestNonce } from "@/lib/nonce";
import { portalAreas } from "@/lib/areas";
import { pageMetadata, jsonLd, siteUrl } from "@/lib/seo";
import { PublicHero } from "@/components/public/public-hero";
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
  if (!area || !portalAreas.some((item) => item.slug === area.slug)) notFound();
  return pageMetadata(
    area.seoTitle || `${area.name} en Cusco, Perú`,
    area.seoDescription ||
      `${area.description || area.name} Servicios de Códex Cusco para empresas en Cusco, Perú.`,
    `/${area.slug}`,
    area.seoKeywords || undefined,
  );
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
  if (!area || !portalAreas.some((item) => item.slug === area.slug)) notFound();
  const filters = await searchParams;
  const path = `/${area.slug}`;
  return (
    <div className="container section">
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Service",
            name: area.name,
            description: area.seoDescription || area.description,
            url: `${siteUrl}/${area.slug}`,
            provider: { "@id": `${siteUrl}/#organization` },
            areaServed: "Cusco, Perú",
          }),
        }}
      />
      <Link className="text-link" href="/servicios">
        Todos los servicios
      </Link>
      <PublicHero areaIds={[area.id]} label={`Imágenes de ${area.name}`}>
        <p className="eyebrow">SERVICIOS DE CÓDEX CUSCO</p>
        <h1>{area.name}</h1>
        <p className="hero-description">{area.description}</p>
      </PublicHero>

      <div className="area-toolbar">
        <p className="notice">
          Consulta los trabajos publicados y encuentra soluciones para tu
          negocio.
        </p>
        <Link className="button secondary button-small" href="/contactanos">
          Consultar este servicio
        </Link>
      </div>
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
    </div>
  );
}
