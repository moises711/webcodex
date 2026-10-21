import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { requestNonce } from "@/lib/nonce";
import { portalAreas } from "@/lib/areas";
import { pageMetadata, jsonLd, siteUrl } from "@/lib/seo";
import { PublicHero } from "@/components/public/public-hero";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArea } from "@/server/queries/public";
import { ProjectList, type Filters } from "@/components/public/project-list";
const systemsTitle = "Diseño de páginas web y software en Cusco";
const systemsDescription =
  "Diseño y desarrollo de páginas web y sistemas a medida para negocios en Cusco, Perú. Conoce nuestros proyectos y consulta con Códex Cusco.";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const area = await getArea((await params).slug);
  if (!area || !portalAreas.some((item) => item.slug === area.slug)) notFound();
  return pageMetadata(
    area.seoTitle ||
      (area.slug === "sistemas" ? systemsTitle : `${area.name} en Cusco, Perú`),
    area.seoDescription ||
      (area.slug === "sistemas"
        ? systemsDescription
        : `${area.description || area.name} Servicios de Códex Cusco para empresas en Cusco, Perú.`),
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
            name: area.slug === "sistemas" ? systemsTitle : area.name,
            description:
              area.seoDescription ||
              (area.slug === "sistemas"
                ? systemsDescription
                : area.description),
            url: `${siteUrl}/${area.slug}`,
            provider: { "@id": `${siteUrl}/#organization` },
            areaServed: "Cusco, Perú",
          }),
        }}
      />
      <Breadcrumbs items={[{name: "Inicio", href: "/"}, {name: "Servicios", href: "/servicios"}, {name: area.name, href: path}]} />
      <PublicHero areaIds={[area.id]} label={`Imágenes de ${area.name}`}>
        <p className="eyebrow">SERVICIOS DE CÓDEX CUSCO</p>
        <h1>{area.slug === "sistemas" ? systemsTitle : area.name}</h1>
        <p className="hero-description">
          {area.slug === "sistemas" ? systemsDescription : area.description}
        </p>
      </PublicHero>

      {area.slug === "sistemas" && (
        <section aria-labelledby="web-development-title" className="stack">
          <h2 id="web-development-title">
            Diseño y desarrollo de páginas web en Cusco
          </h2>
          <p>
            Creamos páginas web para presentar tu empresa, mostrar tus servicios
            y facilitar que tus clientes se pongan en contacto contigo.
            Adaptamos el diseño a tu marca y a la navegación desde celulares y
            computadoras.
          </p>
          <h3>Software y sistemas a medida</h3>
          <p>
            Desarrollamos sistemas de gestión y aplicaciones web según los
            procesos de tu negocio. Revisa nuestros proyectos publicados y
            conversemos sobre las funciones que necesitas, el alcance y el
            mantenimiento de tu solución.
          </p>
          <Link className="text-link" href="/contactanos">
            Consultar por una página web o un sistema
          </Link>
        </section>
      )}

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
