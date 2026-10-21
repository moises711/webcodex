import { RelatedServices } from "@/components/public/related-services";
import { ServiceContent } from "@/components/public/service-content";
import { getServiceSeo } from "@/lib/service-seo";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
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
  const seo = getServiceSeo(area.slug);
  return pageMetadata(
    area.seoTitle || seo?.title || `${area.name} en Cusco, Perú`,
    area.seoDescription ||
      seo?.description ||
      `${area.description || area.name} Servicios de Códex Cusco en Cusco, Perú.`,
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
  const seo = getServiceSeo(area.slug);
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
            name: seo?.title || area.name,
            description:
              area.seoDescription || seo?.description || area.description,
            url: `${siteUrl}/${area.slug}`,
            provider: { "@id": `${siteUrl}/#organization` },
            areaServed: "Cusco, Perú",
          }),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: "Servicios", href: "/servicios" },
          { name: area.name, href: path },
        ]}
      />
      <PublicHero areaIds={[area.id]} label={`Imágenes de ${area.name}`}>
        <p className="eyebrow">SERVICIOS DE CÓDEX CUSCO</p>
        <h1>{seo?.title || area.name}</h1>
        <p className="hero-description">
          {seo?.description || area.description}
        </p>
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
      <RelatedServices current={area.slug} />
      <ServiceContent slug={area.slug} />
    </div>
  );
}
