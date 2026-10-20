import Image from "next/image";
import { Ambient } from "@/components/motion/ambient";
import { Reveal } from "@/components/motion/reveal";
import { technologies } from "@/lib/technologies";
export function TechnologyShowcase() {
  return (
    <section className="technology-section" aria-labelledby="technology-title">
      <Reveal>
        <p className="eyebrow">ECOSISTEMA TECNOLÓGICO</p>
        <h2 id="technology-title">Herramientas para construir lo que sigue</h2>
        <p className="notice">
          Tecnologías para interfaces, aplicaciones, APIs y despliegue. La
          selección de cada proyecto depende de sus objetivos y necesidades.
        </p>
      </Reveal>
      <Ambient className="connection-strip technology-strip" hidden={false}>
        <div className="connection-track technology-track">
          {[0, 1].map((copy) => (
            <span
              className="technology-run"
              key={copy}
              aria-hidden={copy === 1 || undefined}
            >
              {technologies.map((tech) => (
                <span className="technology-chip" key={tech.slug}>
                  <Image
                    src={`/technologies/${tech.slug}.svg`}
                    alt=""
                    width={38}
                    height={38}
                  />
                  <span>{tech.name}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </Ambient>
    </section>
  );
}

export function TechnologyCatalog() {
  return (
    <section
      className="technology-section"
      aria-labelledby="technology-catalog-title"
    >
      <p className="eyebrow">TECNOLOGÍAS POR ESPECIALIDAD</p>
      <h2 id="technology-catalog-title">Conoce el ecosistema completo</h2>
      <div className="technology-categories">
        {[...new Set(technologies.map((tech) => tech.category))].map(
          (category) => (
            <Reveal key={category}>
              <h3>{category}</h3>
              <div className="technology-grid">
                {technologies
                  .filter((tech) => tech.category === category)
                  .map((tech) => (
                    <a
                      className="technology-card"
                      key={tech.slug}
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${tech.name}: sitio oficial (abre una pestaña nueva)`}
                    >
                      <span className="technology-logo">
                        <Image
                          src={`/technologies/${tech.slug}.svg`}
                          alt={`Logo de ${tech.name}`}
                          width={44}
                          height={44}
                        />
                      </span>
                      <span>{tech.name}</span>
                    </a>
                  ))}
              </div>
            </Reveal>
          ),
        )}
      </div>
    </section>
  );
}
