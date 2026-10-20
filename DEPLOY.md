# Despliegue en Hostinger · Códex Cusco

## Estado de esta preparación

Aplicación adaptada a MySQL/MariaDB con Prisma 6.19. Los datos PostgreSQL existentes se copiaron a una instancia MySQL 8.4 local, sin modificar el origen, y se verificó igualdad de contenido en todas las tablas. Hostinger aún no se ha configurado ni publicado. MariaDB en el servidor de destino requiere la verificación final.

XAMPP es un entorno local que incluye MariaDB/MySQL, no un motor distinto. En Hostinger usa los datos MySQL del panel y una aplicación **Node.js/Next.js**, no una carpeta de hosting PHP.

## 1. Crear la base y configurar Node.js

En hPanel crea una base MySQL y su usuario, y configura la aplicación Node.js desde este proyecto. Usa un runtime soportado por Next.js 16 (Node.js 22 LTS o compatible).

Configura las variables de `.env.example` en el panel. Ejemplo, sin credenciales reales:

```dotenv
DATABASE_URL="mysql://USUARIO:CONTRASENA_CODIFICADA@HOST:3306/NOMBRE_BASE?connection_limit=5"
AUTH_URL="https://tu-dominio.com"
APP_URL="https://tu-dominio.com"
```

Copia HOST, nombre y usuario exactos de hPanel. Las contraseñas con caracteres especiales deben codificarse para una URL. No uses el puerto local 53306 en la nube. Nunca subas `.env`, `.env.postgresql-local`, claves ni respaldos como archivos públicos.

Mantén el valor actual de `CREDENTIALS_ENC_KEY` en un gestor de secretos y configúralo de forma privada en Hostinger: permite descifrar las credenciales demo existentes. Los usuarios y sus hashes se conservan, por lo que pueden usar sus contraseñas actuales. Configura `AUTH_SECRET` de forma privada; puedes generar uno nuevo para producción y obligar a iniciar sesión otra vez. Configura correo (`RESEND_*`) y almacenamiento (`STORAGE_*`) si vas a usar esas funciones.

## 2. Trasladar los datos: elige UNA ruta

Haz el traslado durante una ventana sin escrituras. No ejecutes `db:seed` o `db:seed:admin` sobre los datos importados: pueden cambiar las cuentas y contraseñas existentes.

### Ruta A: importar el SQL local desde phpMyAdmin

Esta ruta es práctica si no tienes terminal para importar datos en Hostinger.

1. En la máquina local ejecuta `pnpm db:backup`. Genera un SQL privado en `.local/backups/mysql-<fecha>.sql` con esquema, datos y el historial `_prisma_migrations`.
2. En phpMyAdmin de Hostinger selecciona la base **vacía** e importa ese SQL. El archivo no se coloca en `public` ni en la carpeta pública del hosting.
3. Configura las variables de producción y despliega la app. Como el SQL incluye `_prisma_migrations`, `prisma migrate deploy` reconocerá la migración inicial aplicada. No apliques la migración inicial manualmente antes de importar el dump.
4. Compara conteos y verifica ingreso, búsquedas, publicaciones y visitas. Para verificar el contenido completo, usa la ruta de verificación del apartado siguiente desde un entorno con acceso al destino.

### Ruta B: migraciones Prisma más respaldo JSON

Esquema e historial antiguo: `prisma/postgresql/`. El JSON privado de la transferencia inicial está en `.local/backups/postgresql-before-mysql.json`; si el origen ha cambiado, genera otro archivo (el exportador no sobrescribe respaldos).

```bash
# Solo en la máquina que conserva el origen PostgreSQL:
pnpm db:generate:postgresql
node scripts/transfer-db.mjs export .local/backups/traslado-nuevo.json .env.postgresql-local
```

En un entorno con acceso a la base MySQL vacía de Hostinger, prepara un archivo privado `.env.hostinger` con `DATABASE_URL` del destino. No lo publiques.

```bash
pnpm db:generate
node --env-file=.env.hostinger node_modules/prisma/build/index.js migrate deploy
node scripts/transfer-db.mjs import .local/backups/traslado-nuevo.json .env.hostinger
node scripts/transfer-db.mjs verify .local/backups/traslado-nuevo.json .env.hostinger
```

El importador exige todas las tablas de aplicación vacías, conserva IDs, fechas, relaciones, hashes y contraseñas demo cifradas, y ejecuta la importación dentro de una transacción. Si falla, revierte sus inserciones. `verify` compara todos los campos de todas las tablas; úsalo antes de abrir la app para evitar diferencias por nuevas visitas o inicios de sesión. Si ejecutas los comandos desde tu computadora, configura el acceso remoto MySQL en Hostinger para esa conexión.

## 3. Construir e iniciar

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm prisma migrate deploy
pnpm build
pnpm start
```

La instalación genera Prisma Client con `postinstall`. En Hostinger establece `pnpm build` como comando de construcción y `pnpm start` como comando de inicio según los campos disponibles en tu plan. Las migraciones y la importación se ejecutan con acceso al destino, antes de aceptar tráfico. No uses `migrate dev` ni `migrate reset` en producción.

## 4. Archivos e imágenes existentes

La base conserva las referencias a imágenes; los archivos físicos requieren traslado aparte. Conserva `public/` y las imágenes locales en `.local/resources/images` (y `.local/media` si hay imágenes antiguas). Sus URLs `/api/media/...` seguirán funcionando si esos archivos están presentes en el servidor, fuera del directorio público y con almacenamiento persistente.

Las subidas nuevas en producción requieren R2/S3 (`STORAGE_*`). Si el hosting no conserva archivos locales entre despliegues, traslada las imágenes existentes a almacenamiento persistente y actualiza sus referencias antes de abrir el sitio. Guarda también los originales de `.local/resources/originals` como respaldo privado.

## 5. Comprobar y respaldar

Verifica `/api/health`, `/servicios`, `/buscar`, ingreso, permisos por área, edición, imágenes y contador. Activa respaldos de MySQL y del almacenamiento; conserva `CREDENTIALS_ENC_KEY` con los respaldos. La configuración de proxy solo debe activar `TRUST_PROXY=true` cuando el proxy de confianza reescriba `X-Forwarded-For`.

## Fuentes

- [Conectar MySQL a Node.js en Hostinger](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/)
- [Crear una aplicación Node.js en Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- [Conector MySQL/MariaDB de Prisma](https://docs.prisma.io/docs/orm/v6/overview/databases/mysql)

## Área Ciberseguridad

El SQL `hostinger-webcodex.sql` incluye el área Ciberseguridad. Si utilizas el respaldo PostgreSQL anterior mediante la ruta B, después de importarlo agrega solo esta área sin ejecutar el seed de ejemplo:

```bash
node --env-file=.env.hostinger scripts/add-cybersecurity.mjs
```

El comando es idempotente y conserva un área ya existente. Reinicia la aplicación para refrescar el catálogo.

## Carruseles y publicaciones en Sistemas

Las vistas públicas principales incluyen un carrusel de fondo integrado al encabezado, con desvanecido rectangular en todos los bordes y cambio de imagen cada 5 segundos. No muestra controles visibles. Usa portadas de áreas activas e imágenes de proyectos publicados; borradores y credenciales quedan fuera del carrusel. Se pausa fuera de pantalla, en pestañas ocultas y al interactuar; respeta movimiento reducido.

Las áreas actuales se conservan: el panel permite editar información, portadas e imágenes de sus proyectos, pero no crear ni eliminar áreas. Dentro de Sistemas se distinguen Sistemas web (URL y credenciales de demostración con visibilidad configurable) y Páginas web (URL e imagen de referencia obligatorias al publicar). Los proyectos anteriores se mantienen en Otros proyectos existentes.

La migración `20261014010000_website_projects` agrega WEBSITE sin cambiar los proyectos existentes. El SQL `hostinger-webcodex.sql` actualizado incluye las tres migraciones. Si ya importaste un SQL anterior, ejecuta `pnpm prisma migrate deploy` con la conexión de Hostinger antes de desplegar esta versión; no vuelvas a importar el dump sobre una base con datos.

## Cuatro áreas definitivas

El SQL actualizado incluye únicamente Sistemas, software y páginas web; Marketing y diseño gráfico; Ciberseguridad; Soporte técnico. Los proyectos y asignaciones anteriores de Ingeniería se trasladaron a Sistemas; los de Operaciones, a Soporte técnico. Para actualizar una base ya importada, configura la conexión del destino en un archivo privado y ejecuta `pnpm exec tsx --env-file=.env.hostinger scripts/consolidate-areas.ts` desde un entorno con acceso a esa base. El comando es idempotente y no restablece contraseñas. No importes el dump sobre una base con datos.

## SEO y dominio público
Configura `NEXT_PUBLIC_SITE_URL=https://codexcusco.com` y `APP_URL=https://codexcusco.com` en Hostinger. En desarrollo APP_URL conserva localhost. Ejecuta `pnpm prisma migrate deploy` para incluir los campos SEO. Los títulos, descripciones y palabras clave se editan en cada área del panel. No se insertan palabras ocultas en el contenido.
Una vez publicada la web, verifica la propiedad del dominio en Google Search Console mediante DNS y envía `https://codexcusco.com/sitemap.xml`. Solicita indexación de Inicio, Empresa, Contacto y los cuatro servicios. Google decide los títulos finales y enlaces de sitio; no se garantiza cuándo aparecerán.

## Preparación final del contenido
El respaldo actualizado conserva los seis proyectos de ejemplo como ARCHIVED; no aparecen en la web ni en su sitemap. No son trabajos reales ni deben republicarse sin reemplazar su contenido. Se conservaron cuentas, imágenes y credenciales cifradas. Para aplicar el mismo cambio en una base ya importada ejecuta `node --env-file=.env.hostinger scripts/prepare-production.mjs`. No ejecutes el seed de demostración.
Antes de abrir producción, configura las variables privadas AUTH_SECRET, CREDENTIALS_ENC_KEY, DATABASE_URL y las URLs HTTPS del dominio. El almacenamiento S3/R2 es obligatorio para nuevas subidas; configura RESEND_API_KEY y RESEND_FROM para recuperación de contraseña. Revisa los usuarios activos y sus permisos en el panel. Conserva el mismo CREDENTIALS_ENC_KEY para descifrar los accesos existentes. El código preparado no sustituye estas configuraciones del hosting.

Las cuentas de prueba admin@codex.local, sistemas@codex.local e ingenieria@codex.local quedan desactivadas; el administrador real conserva su acceso. No exportes .env, .env.postgresql-local, backups privados ni node_modules como archivos públicos.

## Contenido limpio para producción · 20/10/2026

Los seis trabajos de demostración se eliminaron de la base local junto con sus registros de imágenes y accesos demo. Las cuatro áreas y las cuentas se conservan. Genera un respaldo nuevo de la base limpia para trasladarla; los respaldos históricos pueden contener ejemplos. No importes una exportación anterior a esta limpieza.

El seed de demostración está bloqueado por defecto y siempre bloqueado en producción. `ALLOW_DEMO_SEED=true` se reserva para bases de pruebas aisladas. Para una instalación vacía de producción, sigue la configuración del administrador y las migraciones; no uses el seed de ejemplos.

## Protecciones revisadas · 20/10/2026

Consulta `docs/SEGURIDAD.md` antes de desplegar. Las nuevas imágenes se sirven por `/api/media/` tras comprobar permisos; configura S3/R2 privado y permisos mínimos. `STORAGE_PUBLIC_URL` queda para compatibilidad de imágenes anteriores, no como requisito de las nuevas subidas. Configura HTTPS y el proxy de confianza; no expongas directamente el proceso Node. No caches HTML con nonce CSP. Ejecuta `pnpm security:check` y `pnpm build` antes de publicar. El aviso de desarrollo sin parche se mantiene documentado.

## Compilación en Hostinger

El comando de compilación es `pnpm build` y ejecuta `next build --webpack`. Tailwind CSS 4 se procesa con `@tailwindcss/postcss` desde `postcss.config.mjs`; no se usa el loader de Turbopack. Conservar el lockfile actualizado. Si hPanel tiene un comando personalizado `next build`, sustituirlo por `pnpm build` para aplicar esta configuración.
