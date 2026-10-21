import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Software, páginas web y marketing en Cusco, Perú",
  "Códex Cusco: desarrollo de sistemas y páginas web, marketing digital, diseño gráfico, ciberseguridad y soporte técnico para empresas.",
  "/",
);
import { ShowcaseCarousel } from "@/components/public/showcase-carousel";
import Image from "next/image";
import { Ambient } from "@/components/motion/ambient";
import Link from "next/link";
import { ArrowDown, Lightbulb, UsersRound, Cpu } from "lucide-react";
import { AreaCard, ProjectCard } from "@/components/public/cards";
import { getHome } from "@/server/queries/public";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { PageViews } from "@/components/public/page-views";
export const revalidate = 60;
export default async function Home() {
  const { areas, projects, total } = await getHome();
  return (
    <>
      <section className="immersive-hero">
        <div className="container immersive-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> CÓDEX CUSCO · SOLUCIONES TECNOLÓGICAS
            </p>
            <h1>
              Tecnología para tu negocio.
              <br />
              <span>Desde Cusco, para crecer.</span>
            </h1>
            <p className="hero-description">
              Desarrollo de software y páginas web, marketing digital,
              ciberseguridad y soporte técnico. Cuéntanos qué necesita tu
              negocio y conversemos sobre una solución a tu medida.
            </p>
            <form action="/buscar" className="search-form">
              <label className="sr-only" htmlFor="home-search">
                Buscar proyectos
              </label>
              <input
                id="home-search"
                name="q"
                placeholder="¿Qué proyecto estás buscando?"
                maxLength={200}
              />
              <button className="button primary">Buscar </button>
            </form>
            <div className="hero-links">
              <Link href="#proyectos" className="hero-explore">
                Explorar nuestro trabajo
              </Link>
              <span>TECNOLOGÍA DESDE CUSCO</span>
            </div>
            <div className="stats">
              <div>
                <strong>
                  <CountUp value={areas.length} />
                </strong>
                Áreas conectadas
              </div>
              <div>
                <strong>
                  <CountUp value={total} />
                </strong>
                Proyectos publicados
              </div>
            </div>
          </div>
          <ShowcaseCarousel variant="hero" />
        </div>
        <div className="container hero-bottom">
          <span>IDEAS / EQUIPOS / SOLUCIONES</span>
          <Link href="#areas">
            Desliza para descubrir <ArrowDown size={15} />
          </Link>
        </div>
      </section>
      <Ambient className="connection-strip">
        <div className="connection-track">
          {[0, 1].map((i) => (
            <span key={i}>
              <span className="connection-item">
                <Lightbulb aria-hidden="true" /> IDEAS
              </span>
              <span className="connection-item">
                <UsersRound aria-hidden="true" /> COLABORACIÓN
              </span>
              <span className="connection-item">
                <Cpu aria-hidden="true" /> TECNOLOGÍA
              </span>
              <span className="connection-item">
                <Image
                  src="/resources/images/codex-cusco-logo.png"
                  alt=""
                  width={84}
                  height={28}
                />{" "}
                CÓDEX CUSCO
              </span>
            </span>
          ))}
        </div>
      </Ambient>
      <section id="areas" className="section container showcase-section">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / NUESTRO EQUIPO</p>
              <h2>
                Distintas áreas.
                <br />
                <span className="heading-muted">Una misma visión.</span>
              </h2>
            </div>
            <div className="section-intro">
              <p>
                Conectamos capacidades para transformar ideas en soluciones.
              </p>
              <Link href="/servicios">Ver todos los servicios</Link>
            </div>
          </div>
        </Reveal>
        {areas.length ? (
          <div className="cards-grid area-grid">
            {areas.map((area, index) => (
              <Reveal key={area.id} delay={Math.min(index, 3) * 0.07}>
                <AreaCard area={area} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="empty-state">Todavía no hay áreas publicadas.</p>
        )}
      </section>
      <section id="proyectos" className="section container showcase-section">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / LO QUE CONSTRUIMOS</p>
              <h2>
                El trabajo habla.
                <br />
                <span className="heading-muted">Descubre lo que hacemos.</span>
              </h2>
            </div>
            <div className="section-intro">
              <p>
                Proyectos y sistemas creados por los equipos de Códex Cusco.
              </p>
              <Link href="/buscar">Explorar proyectos</Link>
            </div>
          </div>
        </Reveal>
        {projects.length ? (
          <div className="cards-grid projects-showcase">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={Math.min(index % 3, 2) * 0.06}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Consulta nuestros servicios o escríbenos para conversar sobre tu
            proyecto.
          </p>
        )}
      </section>
      <section className="container">
        <Reveal className="connection-callout">
          <div>
            <p className="eyebrow">DE UNA IDEA A LO QUE SIGUE</p>
            <h2>
              Las mejores soluciones
              <br />
              se construyen juntos.
            </h2>
          </div>
          <Link
            className="callout-link"
            href="/servicios"
            aria-label="Conocer las áreas de Códex Cusco"
          ></Link>
          <svg
            viewBox="0 0 800 200"
            className="callout-circuit"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M350 200v-40l60-60h130l60-60h200M480 200v-30l45-45h160l40-40h75"
              stroke="currentColor"
            />
            <circle cx="410" cy="100" r="5" stroke="currentColor" />
          </svg>
        </Reveal>
      </section>
      <PageViews />
    </>
  );
}
