import Link from "next/link";
import { Breadcrumbs } from "./breadcrumbs";
import { PublicHero } from "./public-hero";
import { ProjectList, type Filters } from "./project-list";
import { RelatedServices } from "./related-services";
import { ServiceInfoCard } from "./service-info-card";
import { type ServiceLanding } from "@/lib/service-landings";
import { jsonLd, siteUrl } from "@/lib/seo";
import { requestNonce } from "@/lib/nonce";
import { getArea } from "@/server/queries/public";

export async function ServiceLandingPage({
  page,
  filters,
}: {
  page: ServiceLanding;
  filters: Filters;
}) {
  const path = `/${page.slug}`;
  const area = await getArea(page.area);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${siteUrl}${path}#service`,
        name: page.title,
        description: page.description,
        url: `${siteUrl}${path}`,
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Cusco, Perú",
      },
    ],
  };
  return (
    <div className="container section">
      <script
        nonce={await requestNonce()}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: "Servicios", href: "/servicios" },
          { name: page.name, href: path },
        ]}
      />
      <PublicHero
        areaIds={area ? [area.id] : undefined}
        label={`Proyectos de ${page.name}`}
      >
        <p className="eyebrow">CÓDEX CUSCO · {page.name.toUpperCase()}</p>
        <h1>{page.title}</h1>
        <Link href="/contactanos" className="button primary">
          Cotizar {page.name.toLowerCase()}
        </Link>
      </PublicHero>
      {page.projectType && (
        <section className="section" aria-labelledby="service-projects-title">
          <h2 id="service-projects-title">
            {page.projectType === "WEBSITE"
              ? "Páginas web publicadas"
              : "Sistemas publicados y demostraciones"}
          </h2>
          {area ? (
            <ProjectList
              filters={{ page: filters.page }}
              areaId={area.id}
              path={path}
              type={page.projectType}
            />
          ) : (
            <p className="empty-state">
              Todavía no hay trabajos publicados en esta sección.
            </p>
          )}
        </section>
      )}
      <RelatedServices current={page.slug} related={page.related} />
      <ServiceInfoCard slug={page.slug} />
    </div>
  );
}
