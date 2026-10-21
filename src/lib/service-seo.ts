export const serviceSeo = {
  "sistemas": {
    "title": "Páginas web y desarrollo de software en Cusco",
    "description": "Diseño de páginas web y desarrollo de software a medida en Cusco. Presenta tu negocio, organiza tus procesos y consulta tu proyecto con Códex Cusco."
  },
  "marketing": {
    "title": "Marketing digital y diseño gráfico en Cusco",
    "description": "Marketing digital, identidad visual y diseño gráfico en Cusco. Planifica el contenido y la comunicación de tu negocio con Códex Cusco."
  },
  "ciberseguridad": {
    "title": "Ciberseguridad en Cusco para empresas",
    "description": "Ciberseguridad en Cusco: evaluación de riesgos, protección de sistemas y orientación para prevenir incidentes. Consulta el alcance con Códex Cusco."
  },
  "soporte-tecnico": {
    "title": "Soporte técnico y mantenimiento en Cusco",
    "description": "Soporte técnico en Cusco para equipos, programas y redes. Diagnóstico, mantenimiento y asistencia para tu negocio con Códex Cusco."
  }
} as const;
export function getServiceSeo(slug: string) { return serviceSeo[slug as keyof typeof serviceSeo]; }
