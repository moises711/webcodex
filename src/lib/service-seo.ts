export const serviceSeo = {
  sistemas: {
    title: "Sistemas de gestión a medida en Cusco, Perú",
    description:
      "Sistemas de gestión a medida en Cusco, Perú. Organiza registros, usuarios, procesos y reportes de tu empresa con Códex Cusco.",
  },
  marketing: {
    title: "Marketing digital en Cusco, Perú",
    description:
      "Marketing digital en Cusco, Perú: estrategia, planificación de contenido y comunicación en canales digitales. Consulta tu proyecto con Códex Cusco.",
  },
  ciberseguridad: {
    title: "Ciberseguridad en Cusco, Perú",
    description:
      "Ciberseguridad en Cusco: evaluación de riesgos, protección de sistemas y orientación para prevenir incidentes. Consulta el alcance con Códex Cusco.",
  },
  "soporte-tecnico": {
    title: "Soporte técnico en Cusco, Perú",
    description:
      "Soporte técnico en Cusco para equipos, programas y redes. Diagnóstico, mantenimiento y asistencia para tu negocio con Códex Cusco.",
  },
} as const;
export function getServiceSeo(slug: string) {
  return serviceSeo[slug as keyof typeof serviceSeo];
}
