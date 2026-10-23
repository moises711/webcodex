# Páginas de servicios — 22/10/2026

## Estructura pública

- `/paginas-web-cusco`: diseño web corporativo y landing pages. Catálogo limitado a WEBSITE.
- `/software-a-medida-cusco`: procesos, módulos, integraciones y entrega. Catálogo limitado a SYSTEM.
- `/tiendas-virtuales-cusco`: catálogo, pedidos, pagos, entrega y operación de comercio electrónico.
- `/paginas-web-agencias-viajes`: fichas de tours, itinerarios, idiomas y consulta/reserva.
- `/diseno-grafico-cusco`: identidad visual, piezas, formatos y entrega de archivos.
- `/marketing`, `/ciberseguridad`, `/soporte-tecnico`: conservan sus direcciones. Marketing se centra en estrategia y comunicación; diseño cuenta con su página propia.
- `/sistemas`: título «Sistemas de gestión a medida en Cusco, Perú»; conserva el catálogo anterior y enlaza las especialidades. No se redirige a una sola especialidad porque contiene trabajos de varios tipos.

Las nuevas páginas se resuelven en la ruta existente `[slug]`, con contenido independiente en `src/lib/service-landings.ts`. No se crean áreas administrativas ni se modifica la base de datos. Conservan el diseño, los componentes y los permisos existentes.

Cada página tiene title, descripción, canonical, H1, datos Service, breadcrumbs y enlaces relacionados. La información del servicio se resume en una tarjeta al final: descripción concreta, tres puntos de alcance y una nota de contratación. Se retiraron los bloques extensos y los datos FAQPage de las páginas que ya no muestran preguntas. Están enlazadas desde inicio, servicios, menú y sitemap; la pestaña móvil Servicios las reconoce.

## Referencias de estructura

Se tomó como referencia la separación por intención y especialidad observada en:
- https://cuscocreativos.com/
- https://ably.pe/
- https://webdesigncusco.com/
- https://codperu.com/cusco/desarrollo-de-software/
- https://www.cuscocode.com/software-a-medida/
- https://www.wildevstudio.com/

El análisis anterior también contempló Nixsur, Skynet, Saywa Media, Mi Web Cusco, Software Perú, Ku Code Labs, InkaCode e Innovacion.pe. El contenido es original y no reproduce textos, precios, reseñas ni resultados de los competidores. No se anuncia SEO mensual, nuevas certificaciones ni integraciones concretas sin verificar su oferta.

## Publicación y seguimiento

Recompilar y desplegar siguiendo DEPLOY.md. Esta tarea prepara el código local; no modifica el hosting ni solicita indexación automáticamente.

Después de publicar: comprobar 200 y canonical de las cinco URLs, contenido visible en HTML, enlaces y sitemap; enviar el sitemap en Search Console e inspeccionar cada URL. Medir consultas, impresiones y clics por página, separando búsquedas de marca de búsquedas comerciales.

Pendiente externo previamente detectado: comprobar y corregir el certificado de www.codexcusco.com y redirigirlo al dominio principal. No se modifica DNS/SSL en este cambio.

## Títulos por servicio

Cada servicio utiliza un único H1 y un título SEO con su nombre y «Cusco, Perú». Sistemas se orienta a gestión operativa y software a desarrollo e integraciones. Supervisar en Search Console si ambas páginas compiten por las mismas consultas antes de ampliar contenido.

## Validación local

Compilación de producción, TypeScript, lint y 13 pruebas SEO correctos. Navegador: las nueve páginas responden 200, tienen un H1 y canonical propio, y no desbordan a 375, 768 o 1280 px en las comprobaciones con ambos temas. Verificados los nueve enlaces del menú, navegación hacia software y pestaña móvil Servicios. Sitemap local responde 200. Se utilizaron los datos de desarrollo mediante `.env.mysql-local` sin cambiar los archivos de entorno: la configuración habitual mostró un error de autenticación de base durante la compilación. No se ejecutaron las pruebas de integración que escriben en la base configurada.

## Tarjetas de información

Contenido breve específico para los nueve servicios en `src/lib/service-info.ts`, presentado por `ServiceInfoCard` al final de cada página. Se conservan títulos SEO y metadatos. Verificación de TypeScript, lint y nueve pruebas; tarjetas revisadas en navegador a 375, 768 y 1280 px sin desbordamiento.
