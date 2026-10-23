export type ServiceLanding = {
  slug: string;
  name: string;
  title: string;
  description: string;
  area: "sistemas" | "marketing";
  icon: "Code2" | "Palette";
  intro: string;
  sections: { title: string; text: string; items?: string[] }[];
  process: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
  projectType?: "WEBSITE" | "SYSTEM";
};

export const serviceLandings: ServiceLanding[] = [
  {
    slug: "paginas-web-cusco",
    name: "Diseño de páginas web",
    title: "Páginas web en Cusco, Perú",
    description:
      "Páginas web para empresas en Cusco: diseño adaptable a celulares, contenido de servicios y contacto por WhatsApp. Cotiza tu web con Códex Cusco.",
    area: "sistemas",
    icon: "Code2",
    projectType: "WEBSITE",
    intro:
      "Tu página web es el lugar donde un posible cliente conoce tu empresa antes de escribirte. Diseñamos sitios para negocios de Cusco que necesitan explicar sus servicios, mostrar trabajos y recibir consultas con una navegación clara en celular y computadora.",
    sections: [
      {
        title: "Páginas web para empresas y profesionales",
        text: "Una web corporativa organiza quién eres, qué ofreces y cómo contratarte. Una landing page concentra una campaña o un servicio en una sola página. Elegimos la estructura según tus clientes y los contenidos que tienes disponibles.",
        items: [
          "Presentación de la empresa y páginas de servicios con títulos propios.",
          "Galería o portafolio con fotografías autorizadas y descripciones útiles.",
          "Enlaces de WhatsApp, teléfono y formularios según el alcance acordado.",
        ],
      },
      {
        title: "Qué incluye el diseño de tu página web",
        text: "Definimos la estructura, la propuesta visual y las funciones antes de desarrollar. Revisamos navegación, legibilidad y contacto en distintos tamaños de pantalla. El número de páginas y las revisiones quedan especificados en la propuesta.",
        items: [
          "Diseño coherente con tu identidad visual.",
          "Organización de textos e imágenes para cada sección.",
          "Pruebas de enlaces y funciones antes de publicar.",
        ],
      },
      {
        title: "Una estructura preparada para los buscadores",
        text: "Organizamos títulos, encabezados, descripciones y enlaces para que cada página explique un servicio concreto. La configuración técnica de publicación se acuerda según el proyecto. El posicionamiento requiere seguimiento y depende también de la competencia y del contenido.",
      },
      {
        title: "Precio, dominio y mantenimiento de una web",
        text: "La inversión depende de las páginas internas, los materiales y las funciones. En la cotización distinguimos desarrollo, dominio, alojamiento, licencias y mantenimiento. También acordamos quién administra los accesos y qué asistencia necesitas después de publicar.",
      },
    ],
    process: [
      "Revisamos tu negocio, tus clientes y el objetivo de la web.",
      "Acordamos páginas, contenidos, funciones, precio y calendario.",
      "Diseñamos y desarrollamos con revisiones de los avances.",
      "Comprobamos el funcionamiento y coordinamos la publicación y entrega.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta una página web en Cusco?",
        answer:
          "Depende del número de páginas, diseño, contenido e integraciones. Envíanos tus servicios, referencias y funciones necesarias para preparar una propuesta con alcance y costos detallados.",
      },
      {
        question: "¿La página funcionará en celulares?",
        answer:
          "Sí. Diseñamos la navegación y el contenido para celulares, tabletas y computadoras, y revisamos su funcionamiento antes de la entrega.",
      },
      {
        question: "¿En cuánto tiempo estará lista mi web?",
        answer:
          "El plazo se define después de revisar el alcance y la disponibilidad de textos, fotos y accesos. La propuesta indica las etapas, revisiones y responsabilidades para publicar.",
      },
      {
        question: "¿Pueden mejorar mi página actual?",
        answer:
          "Podemos evaluar su estructura, contenido y funciones para determinar qué conservar y qué actualizar. Si cambian las direcciones de las páginas, planificamos sus redirecciones.",
      },
    ],
    related: [
      "tiendas-virtuales-cusco",
      "paginas-web-agencias-viajes",
      "software-a-medida-cusco",
    ],
  },
  {
    slug: "software-a-medida-cusco",
    name: "Software a medida",
    title: "Software a medida en Cusco, Perú",
    description:
      "Desarrollo de sistemas web y software a medida en Cusco para organizar procesos, usuarios y reportes. Define tu proyecto con Códex Cusco.",
    area: "sistemas",
    icon: "Code2",
    projectType: "SYSTEM",
    intro:
      "Cuando hojas de cálculo y tareas manuales dejan de ser suficientes, un sistema puede reunir la información y ordenar el trabajo. Analizamos los procesos de tu empresa para desarrollar las funciones que necesitas, con responsables, permisos y entregas definidos.",
    sections: [
      {
        title: "Sistemas de gestión para tu empresa",
        text: "Partimos del proceso real: qué registra tu equipo, quién aprueba y qué información necesitas consultar. Definimos los módulos por prioridad para evitar desarrollar funciones que no aportan al trabajo diario.",
        items: [
          "Registro y consulta de operaciones según el flujo de tu negocio.",
          "Paneles, reportes y filtros definidos con los usuarios.",
          "Roles y permisos para separar responsabilidades.",
        ],
      },
      {
        title: "Automatización e integración de herramientas",
        text: "Evaluamos qué tareas repetitivas se pueden automatizar y qué sistemas deben intercambiar datos. Antes de ofrecer una integración comprobamos los accesos disponibles, las APIs, las licencias y los límites del proveedor.",
      },
      {
        title: "Desarrollo por etapas y validación",
        text: "Acordamos requisitos y criterios de aceptación. Revisamos avances con tu equipo y comprobamos las funciones antes de su puesta en uso. Las necesidades nuevas se evalúan con su impacto en costo y calendario.",
      },
      {
        title: "Entrega, capacitación y soporte del sistema",
        text: "La propuesta especifica alojamiento, documentación, accesos, condiciones de entrega y mantenimiento. Si hay información que trasladar, primero definimos su calidad, los respaldos y el procedimiento de migración.",
      },
    ],
    process: [
      "Documentamos el problema, los usuarios y el proceso actual.",
      "Priorizamos módulos y acordamos requisitos, costo y entregas.",
      "Desarrollamos y validamos las funciones con tu equipo.",
      "Coordinamos puesta en marcha, capacitación y soporte contratado.",
    ],
    faqs: [
      {
        question: "¿Necesito software a medida o una página web?",
        answer:
          "Una web presenta tu negocio y facilita consultas. Un sistema permite gestionar información y tareas con usuarios y reglas. Si necesitas ambos, podemos definir una web pública y un panel de gestión separado.",
      },
      {
        question: "¿Se puede conectar con otros sistemas?",
        answer:
          "Se evalúa cada integración según la documentación del proveedor, los permisos y el acceso técnico disponible. Su alcance y los costos externos se especifican antes del desarrollo.",
      },
      {
        question: "¿Cómo se calcula el precio del software?",
        answer:
          "Revisamos módulos, usuarios, reglas, reportes, integraciones y migración de datos. Con esa información preparamos una propuesta por etapas y definimos las condiciones de mantenimiento.",
      },
    ],
    related: ["paginas-web-cusco", "tiendas-virtuales-cusco", "ciberseguridad"],
  },
  {
    slug: "tiendas-virtuales-cusco",
    name: "Tiendas virtuales",
    title: "Tiendas virtuales en Cusco, Perú",
    description:
      "Desarrollo de tiendas virtuales en Cusco con catálogo, carrito y gestión de pedidos según tu negocio. Consulta pagos e integraciones con Códex Cusco.",
    area: "sistemas",
    icon: "Code2",
    intro:
      "Una tienda virtual necesita más que fotografías y un botón de compra. Definimos contigo cómo presentar los productos, recibir pedidos, gestionar pagos y comunicar la entrega, para que la operación del negocio acompañe la venta por internet.",
    sections: [
      {
        title: "Catálogo de productos y experiencia de compra",
        text: "Organizamos categorías, fichas, fotografías, variantes y precios. Definimos qué información necesita el comprador y cómo pasar del catálogo al pedido.",
        items: [
          "Categorías y fichas con descripción, imágenes y condiciones de venta.",
          "Carrito y flujo de pedido según el modelo de negocio.",
          "Presentación adaptable a celulares y computadoras.",
        ],
      },
      {
        title: "Pagos, entregas y condiciones comerciales",
        text: "Evaluamos el medio de pago adecuado y sus requisitos. Las comisiones, contratos y habilitación de cuentas corresponden al proveedor seleccionado. También acordamos zonas de entrega, tarifas, recojo y mensajes de confirmación.",
      },
      {
        title: "Administración de pedidos y productos",
        text: "Definimos quién actualizará el catálogo y cómo se registrarán los pedidos. Si necesitas inventario, facturación o conexión con otro sistema, revisamos esas funciones como parte del alcance técnico.",
      },
      {
        title: "Qué preparar para cotizar tu tienda online",
        text: "Necesitamos conocer la cantidad de productos, sus variantes, los medios de pago y cómo entregas tus pedidos. La propuesta distingue desarrollo, carga de contenido, servicios externos y mantenimiento.",
      },
    ],
    process: [
      "Revisamos productos, clientes y operación de ventas.",
      "Definimos catálogo, pedidos, pagos y entrega.",
      "Construimos la tienda y probamos el recorrido de compra acordado.",
      "Coordinamos la publicación y la administración del catálogo.",
    ],
    faqs: [
      {
        question:
          "¿Puedo comenzar con un catálogo y recibir pedidos por WhatsApp?",
        answer:
          "Sí. Podemos evaluar un catálogo con consultas por WhatsApp o una tienda con carrito y pago. Son alcances diferentes; elegimos el adecuado según tu operación.",
      },
      {
        question: "¿El precio incluye comisiones de pago?",
        answer:
          "Las comisiones y costos de proveedores se detallan por separado. Confirmamos los requisitos de la cuenta comercial antes de integrar el medio de pago.",
      },
      {
        question: "¿La tienda puede controlar inventario?",
        answer:
          "El control de existencias se define según tus productos, almacenes y canales de venta. Si ya usas otro sistema, evaluamos si permite sincronización.",
      },
    ],
    related: ["paginas-web-cusco", "software-a-medida-cusco", "marketing"],
  },
  {
    slug: "paginas-web-agencias-viajes",
    name: "Webs para agencias de viajes",
    title: "Páginas web para agencias de viajes en Cusco, Perú",
    description:
      "Diseño de páginas web para agencias de viajes en Cusco: tours, itinerarios, consultas y opciones de reserva según tu operación. Cotiza con Códex Cusco.",
    area: "sistemas",
    icon: "Code2",
    intro:
      "Un viajero necesita entender qué incluye el tour, cuánto dura y cómo reservar antes de ponerse en contacto. Organizamos las páginas de tu agencia para presentar experiencias e itinerarios con información clara y una ruta de consulta adecuada a tu forma de atender.",
    sections: [
      {
        title: "Una página para cada tour e itinerario",
        text: "Cada experiencia necesita su propia descripción. Organizamos duración, recorrido, servicios incluidos, requisitos y recomendaciones para que el viajero compare opciones con información suficiente.",
        items: [
          "Fichas de tours y categorías por destino o tipo de experiencia.",
          "Itinerarios, punto de encuentro y condiciones proporcionadas por tu agencia.",
          "Fotografías autorizadas y llamadas a consultar o reservar.",
        ],
      },
      {
        title: "Consultas y reservas según tu operación",
        text: "Podemos definir consultas por WhatsApp o formularios, solicitudes de disponibilidad y funciones de reserva. Si necesitas cupos en tiempo real o pagos, primero evaluamos la fuente de disponibilidad y el proveedor que utilizará la agencia.",
      },
      {
        title: "Contenido para viajeros y búsquedas turísticas",
        text: "Planteamos títulos y enlaces específicos para cada experiencia. Los idiomas se acuerdan según el público de la agencia, incluyendo quién prepara y valida las traducciones. Evitamos repetir la misma descripción en todos los tours.",
      },
      {
        title: "Información comercial que genera confianza",
        text: "La agencia proporciona sus datos de contacto, políticas, condiciones y documentación que corresponda mostrar. Antes de publicar revisamos que precios, inclusiones y restricciones sean coherentes con la operación real.",
      },
    ],
    process: [
      "Conocemos tus destinos, tours y público objetivo.",
      "Definimos fichas, idiomas y el proceso de consulta o reserva.",
      "Diseñamos las páginas y cargamos los contenidos acordados.",
      "Probamos consultas e integraciones antes de publicar.",
    ],
    faqs: [
      {
        question: "¿Se pueden publicar tours en varios idiomas?",
        answer:
          "Sí, se puede planificar una estructura por idioma. La cantidad de idiomas, traducciones y su validación se especifican en la propuesta.",
      },
      {
        question: "¿La web puede cobrar reservas?",
        answer:
          "Podemos evaluar pagos y reservas según el proveedor, los requisitos de la agencia y la disponibilidad de cada tour. Una solicitud de reserva no equivale a una plaza confirmada; el flujo debe reflejar esa diferencia.",
      },
      {
        question:
          "¿Pueden integrar disponibilidad de entradas o servicios externos?",
        answer:
          "Primero comprobamos si existe una integración autorizada y disponible. No ofrecemos disponibilidad automática de terceros sin confirmar su acceso y condiciones.",
      },
    ],
    related: [
      "paginas-web-cusco",
      "software-a-medida-cusco",
      "diseno-grafico-cusco",
    ],
  },
  {
    slug: "diseno-grafico-cusco",
    name: "Diseño gráfico",
    title: "Diseño gráfico en Cusco, Perú",
    description:
      "Diseño gráfico en Cusco para identidad visual, piezas publicitarias y contenido de marca. Define formatos y entregables con Códex Cusco.",
    area: "marketing",
    icon: "Palette",
    intro:
      "Una identidad visual consistente ayuda a reconocer tu negocio en la web, las redes y los materiales comerciales. Trabajamos las piezas a partir de tu público, mensaje y canales, con formatos y revisiones acordados antes de diseñar.",
    sections: [
      {
        title: "Identidad visual para tu negocio",
        text: "Revisamos si tu marca necesita una identidad nueva o adaptar la existente. Definimos aplicaciones, colores, tipografía y criterios visuales según el alcance; la propuesta detalla qué piezas y archivos recibirás.",
      },
      {
        title: "Piezas gráficas para redes y publicidad",
        text: "Diseñamos materiales para los canales que utilizas. Cada pieza parte de un mensaje y una acción: conocer un servicio, consultar una promoción o visitar tu web.",
        items: [
          "Publicaciones y formatos digitales según el canal seleccionado.",
          "Banners y recursos visuales para páginas web.",
          "Material comercial con dimensiones y especificaciones acordadas.",
        ],
      },
      {
        title: "Archivos, formatos y uso de materiales",
        text: "Antes de producir confirmamos medidas, versiones, licencias y derechos de uso de imágenes. Si el trabajo se imprimirá, acordamos las especificaciones con el proveedor. La impresión y los archivos editables se detallan en la propuesta.",
      },
      {
        title: "Cómo cotizar un proyecto de diseño gráfico",
        text: "Indícanos qué piezas necesitas, dónde se usarán y qué materiales de marca ya tienes. Con eso definimos cantidad, formatos, revisiones y fechas de entrega. La gestión de campañas y publicación se evalúa como un servicio de marketing.",
      },
    ],
    process: [
      "Revisamos tu marca, público y mensaje.",
      "Acordamos piezas, formatos, materiales y revisiones.",
      "Preparamos las propuestas y recogemos tus observaciones.",
      "Entregamos los archivos en los formatos contratados.",
    ],
    faqs: [
      {
        question: "¿Pueden trabajar con mi logotipo actual?",
        answer:
          "Sí. Revisamos los archivos disponibles y las reglas visuales existentes para adaptar las piezas sin perder la identidad de tu negocio.",
      },
      {
        question: "¿Incluye publicación en redes sociales?",
        answer:
          "El diseño de piezas y la gestión de redes son alcances distintos. Podemos definirlos juntos, indicando canales, calendario y responsabilidades en la propuesta.",
      },
      {
        question: "¿Recibiré archivos editables?",
        answer:
          "Los formatos finales, editables y condiciones de uso se acuerdan antes de comenzar, considerando también las licencias de tipografías, fotografías y otros recursos.",
      },
    ],
    related: ["marketing", "paginas-web-cusco", "paginas-web-agencias-viajes"],
  },
];

export function getServiceLanding(slug: string) {
  return serviceLandings.find((page) => page.slug === slug);
}
