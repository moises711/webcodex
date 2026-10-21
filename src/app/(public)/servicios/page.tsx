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
      <Breadcrumbs items={[{name: "Inicio", href: "/"}, {name: "Servicios", href: "/servicios"}]} />
      <PublicHero>
        <p className="eyebrow">NUESTROS EQUIPOS</p>
        <h1>Servicios de Códex Cusco</h1>
        <p className="hero-description">
          Explora las soluciones y proyectos de cada equipo.
        </p>
      </PublicHero>

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
