# Códex Cusco · Portal de proyectos

Portal público y panel para publicar proyectos y sistemas por áreas. Next.js 16.4, React, TypeScript, Tailwind v4, Prisma/MySQL-MariaDB y Auth.js v5.

## Desarrollo local

```bash
pnpm install
pnpm db:start
pnpm db:generate
pnpm dev
```

Abre http://localhost:3000. La instancia exclusiva de desarrollo usa MySQL en `127.0.0.1:53306`, con datos en `.local/mysql`. Los datos previos fueron trasladados y verificados. En otra máquina puedes usar MySQL/MariaDB de XAMPP en el puerto 3306 y configurar `DATABASE_URL`; `db:start`/`db:stop` solo administran la instancia dedicada existente.

`.env` ya está creado localmente, está ignorado por Git y tiene permisos restrictivos. En otra máquina, copia `.env.example`, configura una base MySQL/MariaDB y genera `AUTH_SECRET` y `CREDENTIALS_ENC_KEY` (32 bytes base64) antes de migrar.

```bash
pnpm prisma migrate deploy
pnpm db:seed
```

El seed es idempotente y solo para desarrollo: cuatro áreas, seis proyectos identificados como demostración y tres cuentas. El administrador usa el correo de `SEED_ADMIN_EMAIL`; su contraseña temporal está en `SEED_ADMIN_PASSWORD` de `.env`. Los editores usan `sistemas@codex.local` e `marketing@codex.local`, con `SEED_EDITOR_PASSWORD`. Deben cambiar su contraseña en el primer ingreso. No se imprimen claves en consola.

## Panel

En `/ingresar`, inicia sesión y cambia la contraseña temporal. El panel ofrece resumen, proyectos, editor enriquecido, subidas, portada, credenciales demo, vista previa y publicación. Los responsables gestionan sus áreas y editores. El super administrador gestiona áreas, usuarios, ajustes y auditoría.

`AREA_ADMIN` identifica el rol general; `UserArea.isManager` determina exactamente qué áreas puede administrar un usuario. `INTERNAL` puede consultar credenciales internas y no puede editar. La sesión se comprueba contra la base en cada operación; desactivar un usuario o cambiar sus permisos invalida sus sesiones anteriores.

El logo original está en `public/brand/codex-cusco.jpeg`. Se mantiene la imagen original y se encuadra con CSS.

## Imágenes

En desarrollo, sin configuración S3/R2, las imágenes se guardan en `.local/media` y se sirven con comprobación de publicación o permisos. En producción, las subidas requieren `STORAGE_*`. Se permiten JPG/PNG/WebP, máximo 5 MB y 12 imágenes por proyecto; se validan y convierten a WebP con un máximo de 1920 px. Las contraseñas demo se cifran con AES-256-GCM y solo se revelan con permiso y auditoría.

## Comprobaciones

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# Con pnpm dev abierto:
pnpm exec playwright install chromium
pnpm test:e2e
```

Las pruebas de integración y E2E usan registros propios temporales y los limpian al terminar. No deben ejecutarse contra producción. Los resultados de navegador se guardan en `test-results/` (ignorado).

## Respaldo y estado

`pnpm db:backup` crea un respaldo SQL de MySQL en `.local/backups` con permisos restrictivos. Conserva también `.local/media` cuando uses almacenamiento local. `GET /api/health` devuelve 200 si la base está disponible y 503 si no lo está. `pnpm db:stop` detiene únicamente la instancia dedicada.

Requisitos, arquitectura y checklist: `docs/`. Despliegue en Hostinger, importación por phpMyAdmin y traslado de datos: `DEPLOY.md`. El esquema e historial PostgreSQL anterior se conservan en `prisma/postgresql/`; no ejecutar ese historial contra MySQL.

La recuperación de acceso está disponible en `/recuperar` y requiere `RESEND_API_KEY` y `RESEND_FROM` para enviar enlaces. Los tokens vencen en 30 minutos, se guardan como hashes y son de un solo uso. Las claves temporales se reemplazan por el usuario desde `/cambiar-clave`.

Resultados de esta entrega: 26 pruebas unitarias/integración correctas y 7 escenarios E2E comprobados; métricas detalladas en `docs/05-ROADMAP-TAREAS.md`. Las variantes vectoriales de identidad siguen pendientes. La actualización de movimiento se detalla más abajo.

## Movimiento y referencias visuales

La nueva capa de presentación está inspirada en las referencias Framer, Active Theory y Lusion indicadas por el usuario. Usa Motion, Canvas 2D y CSS; mantiene el logo original y las rutas del portal. El botón de pausa del hero controla el movimiento del sitio público, y se respeta `prefers-reduced-motion`. La escena y los efectos ambientales se suspenden fuera de pantalla y cuando la pestaña está oculta.

La revisión visual y Lighthouse de esta capa está pendiente debido al bloqueo del navegador automático sobre la URL local; las métricas anteriores no describen esta nueva versión.

Para crear o actualizar únicamente el super administrador configurado en `.env`, ejecuta `pnpm db:seed:admin`. Actualiza su contraseña, activa la cuenta, invalida sus sesiones anteriores y limpia sus intentos de acceso locales. No crea contenido de demostración.

### Recursos visuales

Los recursos públicos se organizan en `public/resources/{images,icons,fonts,documents,videos,audio}`. Ejemplo: `public/resources/images/codex-cusco.jpeg` se usa con `/resources/images/codex-cusco.jpeg`. Los archivos se sirven sin modificar el original.

Las imágenes subidas desde el panel se guardan en `.local/resources/images`; sus originales sin recomprimir se conservan en `.local/resources/originals`. El sistema continúa usando `/api/media/<id>.webp` con comprobación de permisos. Las carpetas `documents`, `videos` y `audio` quedan preparadas; la subida desde el panel sigue admitiendo únicamente imágenes. Incluye `.local/resources` en los respaldos. En producción se mantiene el almacenamiento S3/R2.


### Generador de proformas

Disponible para el administrador general en `/panel/admin/proformas`. Permite editar empresa, cliente, alcance, hasta 40 servicios, condiciones e IGV opcional, con cálculo en céntimos y descarga PDF A4 desde `/api/proformas`. El servidor verifica sesión, rol, origen, tamaño y esquema Zod; no recibe importes calculados del cliente.

La versión inicial no guarda historial ni reserva números consecutivos: el número se ingresa manualmente. La firma se completa fuera del portal. `pdf-lib` y `@pdf-lib/fontkit` generan PDFs con fuentes locales incrustadas; la licencia está en `src/server/pdf/fonts/LICENSE.txt`. El ejemplo está en `output/pdf/proforma-ejemplo.pdf`.

### Cambios de base de datos y desarrollo

Después de cambiar `DATABASE_URL`, el motor o regenerar Prisma Client, reinicia `pnpm dev`. El cliente global del servidor de desarrollo puede conservar la conexión anterior durante las recargas de código. `pnpm db:start` levanta únicamente MySQL; la web se inicia con `pnpm dev`.
