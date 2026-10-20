import { PublicHero } from "@/components/public/public-hero";
import {
  TechnologyShowcase,
  TechnologyCatalog,
} from "@/components/public/technology-showcase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { services, matchesService } from "@/lib/services";
import { getAreas } from "@/server/queries/public";
import { Reveal } from "@/components/motion/reveal";
import { AreaCard } from "@/components/public/cards";
export const revalidate = 60;
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const item = services.find((s) => s.slug === slug);
  return {
    title: item?.name || "Especialidad no encontrada",
    description: item?.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const item = services.find((s) => s.slug === slug);
  if (!item) notFound();
  const areas = (await getAreas()).filter((area) =>
    matchesService(area.slug, area.name, item.matches),
  );
  return (
    <div className="container section">
      <Link className="text-link" href="/servicios">
        Todas las áreas
      </Link>
      <PublicHero
        areaIds={areas.map((area) => area.id)}
        label={`Imágenes de ${item.name}`}
      >
        <p className="eyebrow">ESPECIALIDAD · {item.short}</p>
        <h1>{item.name}</h1>
        <p className="hero-description">{item.description}</p>
        <Link className="button primary" href="#equipos">
          Explorar proyectos
        </Link>
      </PublicHero>
      <aside className="panel-card">
        <p className="eyebrow">CAPACIDADES DEL ÁREA</p>
        <ul className="service-capabilities">
          {item.features.map((feature) => (
            <li key={feature}>
              <Check size={20} />
              {feature}
            </li>
          ))}
        </ul>
      </aside>
      <Reveal>
        <div className="section-heading">
          <div>
            <p className="eyebrow">CÓMO TRABAJAMOS</p>
            <h2>Un proceso claro, de principio a fin</h2>
          </div>
        </div>
        <div className="cards-grid">
          {[
            {
              title: "Entendemos",
              text: "Definimos la necesidad, el alcance y los objetivos del proyecto.",
            },
            {
              title: "Construimos",
              text: "Desarrollamos la solución con seguimiento y revisión del equipo.",
            },
            {
              title: "Acompañamos",
              text: "Presentamos los resultados y organizamos las siguientes mejoras.",
            },
          ].map((step, index) => (
            <article className="panel-card service-feature" key={step.title}>
              <p className="eyebrow">0{index + 1}</p>
              <h3>{step.title}</h3>
              <p className="notice">{step.text}</p>
            </article>
          ))}
        </div>
      </Reveal>
      {item.slug === "sistemas-software-web" && <TechnologyShowcase />}
      <section id="equipos" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EQUIPOS Y PROYECTOS</p>
            <h2>Explora nuestro trabajo</h2>
          </div>
          <Link className="text-link" href="/buscar">
            Buscar proyectos
          </Link>
        </div>
        {areas.length ? (
          <div className="cards-grid">
            {areas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Estamos preparando este espacio</h3>
            <p>
              Los equipos y proyectos publicados de esta especialidad aparecerán
              aquí.
            </p>
            <Link className="button secondary" href="/servicios">
              Explorar otras áreas
            </Link>
          </div>
        )}
      </section>
      {item.slug === "sistemas-software-web" && <TechnologyCatalog />}
    </div>
  );
}
