export const services = [
  {
    slug: "sistemas-software-web",
    name: "Sistemas, software y páginas web",
    short: "Tecnología",
    icon: "Code2",
    description:
      "Soluciones digitales que conectan procesos, personas y negocios.",
    matches: ["sistemas", "software", "web"],
    features: [
      "Sistemas de gestión y automatización",
      "Aplicaciones y software a medida",
      "Páginas web y experiencias digitales",
    ],
  },
  {
    slug: "marketing-diseno",
    name: "Marketing y diseño gráfico",
    short: "Comunicación",
    icon: "Palette",
    description:
      "Estrategia y diseño para construir una presencia de marca coherente.",
    matches: ["marketing", "diseno", "diseño"],
    features: [
      "Estrategia y contenido digital",
      "Identidad visual y branding",
      "Diseño gráfico y campañas",
    ],
  },
  {
    slug: "soporte-tecnico",
    name: "Soporte técnico",
    short: "Continuidad",
    icon: "Headphones",
    description:
      "Acompañamiento técnico para mantener tus herramientas en funcionamiento.",
    matches: ["soporte", "tecnico", "técnico"],
    features: [
      "Diagnóstico y mantenimiento",
      "Configuración de equipos y redes",
      "Asistencia y seguimiento técnico",
    ],
  },
  {
    slug: "ciberseguridad",
    name: "Ciberseguridad",
    short: "Seguridad digital",
    icon: "ShieldCheck",
    description:
      "Protección de sistemas, redes y datos para fortalecer la seguridad de tu negocio.",
    matches: ["ciberseguridad", "seguridad"],
    features: [
      "Evaluación de riesgos y vulnerabilidades",
      "Protección de sistemas, redes y datos",
      "Prevención y respuesta ante incidentes",
    ],
  },
] as const;
export function matchesService(
  slug: string,
  name: string,
  matches: readonly string[],
) {
  const text = `${slug} ${name}`.toLowerCase();
  return matches.some((word) => text.includes(word));
}
