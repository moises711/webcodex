# SEO: publicación y verificación

El HTML publicado el 21/10/2026 declaraba red-oryx-303419.hostingersite.com
como canonical, og:url, origen de imágenes sociales e identidad de Organization.
El .env local tiene ese dominio temporal; config/.env descargado de Hostinger y
.env.hostinger ya tienen codexcusco.com. Cambiar solo variables en runtime no
corrige necesariamente metadatos generados al compilar.

La identidad pública ahora se fija en src/lib/seo.ts a https://codexcusco.com.
APP_URL conserva su función para autenticación y seguridad y no se modifica.
El favicon.ico usa la X existente de la marca, sin el icono inicial de Next.js.

## Publicar

1. Conservar los cambios locales previos y respaldar la base y las imágenes.
2. Ejecutar pnpm install --frozen-lockfile, pnpm typecheck, pnpm lint y pnpm test.
3. Configurar APP_URL y NEXT_PUBLIC_SITE_URL=https://codexcusco.com tanto en
   compilación como en ejecución. No versionar archivos .env ni credenciales.
4. Ejecutar pnpm build. Para el flujo standalone existente ejecutar después
   pnpm package:hostinger y seguir DEPLOY.md; para GitHub subir el código fuente
   y recompilar en Hostinger. No sobrescribir config/.env ni private-media con
   el paquete; hbuilds contiene estado y archivos privados, no es el repositorio.
5. Verificar en producción /, /sistemas, /servicios, /sitemap.xml, /robots.txt y
   /favicon.ico: HTTP 200, canonical en codexcusco.com y sin noindex en servicios.
6. Configurar en hosting una redirección permanente de www y del dominio temporal
   hacia https://codexcusco.com, conservando ruta y consulta; comprobar que no
   introduce bucles. Esto requiere configuración del hosting, no solo canonical.

## Google Search Console

Verificar la propiedad del dominio codexcusco.com. Enviar
https://codexcusco.com/sitemap.xml. Inspeccionar / y /sistemas, ejecutar prueba
de URL publicada y solicitar indexación después del despliegue. Revisar páginas
excluidas, canonical elegido por Google, rastreo y consultas de rendimiento.
Sin acceso a Search Console no se puede determinar si la ausencia es por falta
de indexación, canonical elegido o posición baja.

Orientar el contenido a consultas concretas como «diseño de páginas web en Cusco».
Publicar casos reales con objetivos, alcance, imágenes descriptivas y resultados
verificables; evitar títulos de fotos como nombres de archivo de WhatsApp.
No inventar dirección, reseñas, precios ni resultados en datos estructurados.
No hay garantía de indexación, puesto o plazo. El favicon puede tardar días o
semanas en actualizarse después del rastreo.
