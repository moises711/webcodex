import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { PublicHero } from "@/components/public/public-hero";
import Link from "next/link";
import { getSettings } from "@/server/queries/public";
import { Reveal } from "@/components/motion/reveal";
import { services } from "@/lib/services";
export const metadata = pageMetadata(
  "Códex Cusco: soluciones tecnológicas en Cusco",
  "Conoce Códex Cusco: talento local e innovación en software, marketing digital, ciberseguridad y soporte técnico. Nuestra misión y visión.",
  "/empresa",
);
export default async function Page() {
  const settings = await getSettings();
  return (
    <div className="container section">
      <Breadcrumbs
        items={[
          { name: "Inicio", href: "/" },
          { name: "Empresa", href: "/empresa" },
        ]}
      />
      <PublicHero>
        <p className="eyebrow">EMPRESA · IDENTIDAD · EQUIPO</p>
        <h1>Códex Cusco: tecnología y talento de Cusco</h1>
        <p className="hero-description">
          {settings?.siteName || "Códex Cusco"} brinda soluciones de software,
          marketing digital, ciberseguridad y soporte técnico con talento local
          de Cusco. Trabajamos para impulsar a las empresas con herramientas
          digitales eficientes, seguras y personalizadas.
        </p>
        <div className="stack">
          <Link className="button primary" href="/servicios">
            Conocer nuestros servicios
          </Link>
          {settings?.contactEmail && (
            <a
              className="button secondary"
              href={`mailto:${settings.contactEmail}`}
            >
              Contactar
            </a>
          )}
        </div>
      </PublicHero>
      <Reveal className="section">
        <div className="company-purpose">
          <article className="panel-card">
            <h2>Misión</h2>
            <p className="hero-description">
              Brindar soluciones tecnológicas integrales en desarrollo de
              software, marketing digital y soporte técnico, fusionando la
              innovación global con el talento local de Cusco. Nos comprometemos
              a potenciar el crecimiento de nuestros clientes mediante
              herramientas digitales eficientes, seguras y personalizadas.
            </p>
          </article>
          <article className="panel-card">
            <h2>Visión</h2>
            <p className="hero-description">
              Ser el referente tecnológico líder en la región sur del Perú para
              el año 2030, reconocidos por nuestra excelencia técnica y
              capacidad creativa. Aspiramos a digitalizar el legado de Cusco,
              conectando empresas locales con el mercado global a través de
              tecnología de vanguardia.
            </p>
          </article>
        </div>
      </Reveal>
      <Reveal>
        <p className="eyebrow">NUESTRAS ESPECIALIDADES</p>
        <h2>De la idea al funcionamiento</h2>
        <div className="cards-grid">
          {services.map((service, index) => (
            <Link
              className="panel-card service-feature"
              key={service.slug}
              href={`/${service.slug === "sistemas-software-web" ? "sistemas" : service.slug === "marketing-diseno" ? "marketing" : service.slug}`}
            >
              <span className="eyebrow">
                0{index + 1} · {service.short}
              </span>
              <h3>{service.name}</h3>
              <p className="notice">{service.description}</p>
              <span className="text-link">Explorar especialidad </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
