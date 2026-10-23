import { serviceLandings } from "@/lib/service-landings";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { PublicHero } from "@/components/public/public-hero";
import { getAreas } from "@/server/queries/public";
import { AreaCard } from "@/components/public/cards";
import Link from "next/link";
import { services } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Servicios tecnológicos en Cusco",
  "Software y páginas web, marketing y diseño gráfico, ciberseguridad y soporte técnico para empresas en Cusco, Perú.",
  "/servicios",
);
export const revalidate = 60;
export default async function Page() {
  const areas = await getAreas();
  return (
    <div className="container section">
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: "Servicios", href: "/servicios" },
        ]}
      />
      <PublicHero>
        <p className="eyebrow">NUESTROS EQUIPOS</p>
        <h1>Servicios tecnológicos en Cusco</h1>
        <p className="hero-description">
          Diseño de páginas web, software a medida, tiendas virtuales,
          marketing, diseño gráfico, ciberseguridad y soporte para tu negocio en
          Cusco.
        </p>
      </PublicHero>

      <section className="section" aria-labelledby="dedicated-services-title">
        <h2 id="dedicated-services-title">
          Encuentra el servicio que necesita tu negocio
        </h2>
        <div className="cards-grid specialties-grid">
          {serviceLandings.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="panel-card service-feature"
            >
              <h3>{page.title}</h3>
              <p className="notice">{page.description}</p>
              <span className="text-link">Conocer el servicio</span>
            </Link>
          ))}
        </div>
      </section>
      <h2>Más servicios y equipos</h2>
      <div className="cards-grid specialties-grid">
        {services.map((service, index) => (
          <Link
            className="panel-card service-feature"
            key={service.slug}
            href={`/${service.slug === "sistemas-software-web" ? "sistemas" : service.slug === "marketing-diseno" ? "marketing" : service.slug}`}
          >
            <p className="eyebrow">
              0{index + 1} · {service.short}
            </p>
            <h2>{service.name}</h2>
            <p className="notice">{service.description}</p>
            <span className="text-link">Conocer capacidades </span>
          </Link>
        ))}
      </div>
      <div className="section-heading">
        <h2>Equipos del portal</h2>
        <Link className="text-link" href="/buscar">
          Todos los proyectos
        </Link>
      </div>
      {areas.length ? (
        <div className="cards-grid">
          {areas.map((a) => (
            <AreaCard key={a.id} area={a} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No hay áreas disponibles.</p>
      )}
    </div>
  );
}
