# 05 — Roadmap y checklist para Codex

> Ejecutar en orden y marcar únicamente lo verificado. El usuario autorizó continuar las fases el 12/10/2026. La publicación externa requiere configurar el entorno de producción.

## Fase 0 — Base del proyecto
- [x] `create-next-app` (TS, App Router, Tailwind, ESLint, `src/`, alias `@/*`) con pnpm
- [x] Instalar shadcn/ui, lucide-react, zod, react-hook-form, prisma, @prisma/client, next-auth, tiptap, argon2 (o bcryptjs)
- [x] Configurar fuentes (`next/font`): Plus Jakarta Sans, Inter, JetBrains Mono
- [x] Implementar tokens de `03-DESIGN-SYSTEM.md` en `globals.css` (claro/oscuro) y tema en Tailwind
- [x] `ThemeProvider` + toggle de tema
- [x] `.env.example`, scripts en `package.json`, ESLint/Prettier
- [x] Estructura de carpetas de `02-ARQUITECTURA.md`

## Fase 1 — Base de datos y autenticación
- [x] `schema.prisma` completo + migración inicial
- [x] Seed: 1 super admin, 4 áreas de ejemplo, 2 editores, 6 proyectos demo (2 sistemas)
- [x] Auth.js credenciales, hash de contraseña, rate limit en login
- [x] `lib/permissions.ts` con tests unitarios (matriz de `04-REGLAS-DE-NEGOCIO.md`)
- [x] `lib/crypto.ts` (AES-256-GCM) con tests
- [x] Middleware de `/panel`
- [x] Página `/ingresar`

## Fase 2 — Sitio público
- [x] Layout público (Navbar, Footer)
- [x] Inicio: hero + buscador, áreas, proyectos recientes/destacados
- [x] `/areas` y `/areas/[slug]` con filtros (tipo, año, etiqueta) y paginación
- [x] `/proyectos/[slug]`: galería con lightbox, contenido, etiquetas, `SystemBlock`
- [x] `/buscar`
- [x] SEO: metadata, OG, sitemap, robots, 404/error
- [x] Skeletons y estados vacíos

## Fase 3 — Panel base
- [x] Layout de panel (sidebar, topbar, selector de área)
- [x] Dashboard con conteos por estado
- [x] Listado de proyectos (tabla, búsqueda, filtros, acciones)
- [x] Guard por área en todas las rutas del panel

## Fase 4 — Editor de proyectos
- [x] Formulario por secciones con validación Zod
- [x] Tiptap (negrita, listas, títulos, enlaces, citas)
- [x] `StorageProvider` + `/api/upload` + `ImageUploader` (drag & drop, orden, portada, alt)
- [x] Sección "Datos del sistema" + `CredentialsEditor` (cifrado, mostrar/ocultar, copiar)
- [x] Estados: guardar borrador, vista previa, publicar, archivar, duplicar
- [x] Revalidación de caché al publicar/editar

## Fase 5 — Administración
- [x] Mi área (editar datos, portada, color, ícono)
- [x] Equipo del área (asignar editores)
- [x] Super admin: áreas (CRUD + orden), usuarios (CRUD + roles + áreas), ajustes del sitio, flujo de revisión on/off
- [x] Auditoría (registro + vista)

## Fase 6 — Pulido y calidad
- [x] Accesibilidad (teclado, aria, contraste) y revisión responsive
- [x] Optimización de imágenes y Lighthouse ≥ 90
- [x] Tests e2e (Playwright): login, crear proyecto, subir imagen, publicar, permiso cruzado entre áreas, visibilidad de credenciales
- [x] Cabeceras de seguridad y revisión de variables de entorno

## Fase 7 — Despliegue
- [x] Guía de despliegue (`DEPLOY.md`), `Dockerfile` opcional
- [ ] Migraciones en producción, backup de BD, healthcheck

## Verificación de esta entrega · 12/10/2026

- Fases 0–5 implementadas y verificadas localmente.
- Fase 6: lint y TypeScript correctos; build de producción correcto; 26 pruebas unitarias/integración y 7 escenarios de navegador verificados (4 flujos y 3 tamaños de pantalla).
- Claro/oscuro comprobados a 375, 768 y 1280 px sin desbordamiento y sin infracciones WCAG A/AA en el inicio.
- Lighthouse móvil sobre el build local de producción:

| Página | Rendimiento | Accesibilidad | SEO |
|---|---:|---:|---:|
| Inicio | 90 | 100 | 100 |
| Áreas | 93 | 98 | 100 |
| Área Sistemas | 92 | 98 | 100 |
| Proyecto | 92 | 98 | 100 |
| Búsqueda | 92 | 98 | 100 |

- El respaldo local se restauró en una base temporal y recuperó los seis proyectos; la base temporal se eliminó al terminar.
- `/api/health` está implementado; producción aún no publicada.

### Límites de entorno y trabajo posterior

- R2/S3 real, correo Resend y hosting de producción requieren sus variables. En desarrollo se utiliza un `StorageProvider` local; producción no hace fallback al disco.
- La recuperación de contraseña está implementada; no se envió correo real durante las pruebas.
- Los proyectos del seed son ejemplos identificados como demostración, con accesos ficticios.
- El logo original JPEG está integrado sin modificar el archivo. Las variantes vectoriales siguen pendientes; la capa de movimiento solicitada ya está implementada sin generar versiones falsas del logo.
- El panel lista los últimos 100 proyectos y la auditoría los últimos 200 eventos; el catálogo público sí incluye paginación.
- Quedan pendientes las migraciones y el respaldo gestionado del entorno de producción. La guía `DEPLOY.md` y el respaldo/healthcheck locales ya están preparados.


### Actualización de movimiento

Implementados Motion, escena de circuitos con proyección de profundidad, reveal por scroll, contadores, tarjetas interactivas, banda tipográfica, barra de progreso y controles de pausa. Las métricas Lighthouse y los siete escenarios E2E documentados arriba pertenecen a la versión anterior; deben repetirse para esta nueva capa cuando el navegador permita el acceso. La compilación, el lint, TypeScript y las pruebas de servidor se comprueban por separado.

- [x] Componentes y estilos de la nueva capa de movimiento integrados.
- [x] Build, TypeScript, ESLint y 26 pruebas de servidor correctos.
- [x] HTML y estilos de la nueva portada servidos por localhost.
- [ ] Revisión visual/E2E de la nueva capa a 375, 768 y 1280 px.
- [ ] Nuevas mediciones Lighthouse después de añadir Motion.

### Actualización estética · fondo compartido y cristal

- [x] Fondo ambiental global en el layout raíz, con auroras, trazos y destellos.
- [x] Control global de pausa, movimiento reducido y suspensión en pestañas ocultas.
- [x] Títulos Caveat locales con licencia, formularios Inter y transparencias adaptadas a claro/oscuro.
- [x] Portada orgánica, tarjetas de cristal y superficies translúcidas en acceso y panel.
- [x] HTML/CSS comprobados por HTTP en inicio, áreas, búsqueda y acceso.
- [ ] Verificación visual, contraste medido y rendimiento de esta actualización; el navegador automatizado sigue bloqueado.

### Contador de visitas de la portada

- [x] Contador público persistente con registro anónimo y validación de solicitudes.
- [x] Una visita por navegador cada 30 minutos; recargar no aumenta el total en ese intervalo.
- [x] Estados de carga, error y reintento. El conteo comienza al activar esta función.

### Navegación, branding y especialidades · 13/10/2026

- [x] Menú responsive con empresa, especialidades desplegables, equipos registrados y administración; cierre con Escape y clic exterior.
- [x] Vista de empresa con identidad configurable mediante los ajustes existentes.
- [x] Vistas de sistemas/software/web, marketing/diseño gráfico y soporte técnico con capacidades, proceso y enlaces a equipos publicados.
- [x] Mejora del directorio y de la navegación de las vistas de área; acceso a gestión sujeto a los permisos existentes.
- [x] TypeScript, ESLint, build y 28 pruebas correctos.
- [x] Menú verificado con Playwright a 375, 768 y 1280 px sin desbordamiento; nuevas rutas responden 200.
- Las especialidades enlazan las áreas activas por nombre/slug. Si no existe un equipo asociado muestran un estado vacío; no se modificaron registros existentes ni asignaciones de usuarios.

### Iconos y catálogo tecnológico · 13/10/2026

- [x] Banda de portada con iconos semánticos para ideas, colaboración y tecnología, y logo de empresa.
- [x] Banda animada y catálogo agrupado de 24 tecnologías en la especialidad y área de Sistemas, con logos SVG locales Devicon v2.17.0 y enlaces oficiales.
- [x] Los 24 logos cargan y no hay desbordamiento a 375, 768 y 1280 px; se respeta movimiento reducido y pausa global.
- Referencia de selección: Stack Overflow Developer Survey 2026. El catálogo describe opciones tecnológicas, no certificaciones ni experiencia acreditada de la empresa.


### Proformas desde administración · 13/10/2026

- [x] Formulario para empresa, cliente, servicios, alcance, condiciones e IGV opcional.
- [x] PDF A4 descargable, cálculo monetario en céntimos, encabezados y paginación.
- [x] Acceso restringido al superadministrador, validación Zod, verificación de origen y límite de tamaño en servidor.
- [x] Flujo de descarga y límites de acceso comprobados con usuarios temporales sobre el build local de producción; formulario sin desbordamiento a 375, 768 y 1280 px.
- [x] TypeScript, lint, build y 30 pruebas correctos; PDF de una página y caso de 40 servicios revisados visualmente.
- No guarda historial ni asigna correlativos automáticos; no incorpora una firma escaneada.


### Prueba gradual de carga · 13/10/2026

- [x] Build de producción local sometido a escalones de 1 a 500 usuarios virtuales simultáneos con recorridos públicos de lectura.
- [x] Registro de latencia, throughput, errores y memoria; recuperación comprobada tras retirar carga.
- [x] Informe y datos crudos guardados en output/performance.
- Resultado: hasta 100 VU sin fallos y p95 105.4 ms; a 500 VU, p95 12 s y 6.1% de errores. No equivale a una capacidad garantizada de 500 usuarios en producción.


### Caché y optimización de recursos · 13/10/2026

- [x] ISR de especialidades y caché de listados públicos frecuentes con invalidación por catalog.
- [x] Caché HTTP de logos SVG, logo principal optimizado y dibujo de canvas limitado a 30 fps.
- [x] Botones manuales de pausa retirados; se conserva pausa automática y movimiento reducido.
- [x] Comparación local hasta 500 VU: p95 2.88 s y 2.23% de errores, frente a 12 s y 6.10% anteriores.
- Informe en output/performance/comparacion-cache.md. No representa 500 navegadores con imágenes y animaciones ni garantiza capacidad del hosting.

### Menor trabajo gráfico en laptop · 13/10/2026

- [x] Fondo estático con gradientes; auroras desenfocadas y trama densa retiradas del renderizado.
- [x] Circuitos en SVG estático: reemplaza el canvas y elimina su bucle de 30 FPS.
- [x] Detenido el movimiento continuo de cintas, destellos, órbitas y etiquetas; carruseles y transiciones breves conservados.
- [x] Superficies principales sin backdrop-filter, con contraste preservado mediante fondos más opacos.
- [x] TypeScript, ESLint, 30 pruebas y build correctos.
- La temperatura real de la laptop no fue medida; el cambio reduce fuentes de trabajo continuo del navegador, sin prometer un porcentaje de CPU/GPU.

### Animaciones breves de bajo costo · 13/10/2026

- [x] Entradas de secciones con Web Animations API, opacidad y desplazamiento de 10 px durante 380 ms; una sola vez por montaje.
- [x] Entradas breves de encabezados y desplegable, respuestas de botones y tarjetas con transformaciones CSS.
- [x] Eliminado el seguimiento del cursor y el foco radial de las tarjetas.
- [x] Fondo, órbitas y circuito permanecen estáticos; no se reintrodujeron canvas ni desenfoques grandes.
- [x] TypeScript, lint y build correctos; hover, fin de las animaciones, movimiento reducido y tamaños responsive comprobados en navegador.
- No se midió la temperatura ni un porcentaje de ahorro de CPU/GPU de la laptop.

### Quiénes somos · 14/10/2026

- [x] Menú y título de la página Empresa actualizados a QUIENES SOMOS.
- [x] Textos de misión y visión incorporados en tarjetas adaptables a móvil y escritorio.
- [x] TypeScript y ESLint de los componentes modificados correctos.

### Animaciones restauradas · 14/10/2026

- [x] Modo completo de ambiente activado: auroras, cintas, destellos, órbitas y etiquetas animadas.
- [x] Conservadas las entradas de secciones y las interacciones de botones y tarjetas.
- [x] Conservada la pausa con pestaña oculta y la preferencia de movimiento reducido.

### Migración MySQL/MariaDB para Hostinger · 14/10/2026

- [x] Esquema y consultas adaptados a MySQL/MariaDB; historial PostgreSQL conservado.
- [x] Respaldo PostgreSQL y traslado local a MySQL 8.4, con igualdad de todos los campos verificada.
- [x] Usuarios, relaciones, hashes, credenciales cifradas y fechas conservados.
- [x] Exportador/importador transaccional y verificación completa preparados; SQL privado para phpMyAdmin.
- [x] 33 pruebas correctas, ESLint, TypeScript y build de producción correctos.
- [x] Guía de Hostinger, variables privadas y traslado separado de archivos documentados en DEPLOY.md.
- [ ] Configurar Hostinger, importar la base y comprobar el motor MariaDB/MySQL de destino.
- [ ] Trasladar imágenes físicas y configurar almacenamiento persistente/R2/S3 en producción.

### Área Ciberseguridad · 14/10/2026

- [x] Especialidad con icono de escudo, descripción y capacidades agregada al menú y catálogo.
- [x] Área creada en MySQL y comando idempotente preparado para otros entornos.
- [x] SQL de Hostinger actualizado con la nueva área.
- [x] ESLint, TypeScript y build correctos, incluida /servicios/ciberseguridad.

### Carruseles y publicaciones web · 14/10/2026

- [x] Carruseles de fondo junto al título en inicio, quiénes somos, áreas, búsqueda y especialidades.
- [x] Cambio automático cada 5 s, transición cruzada y bordes rectangulares desvanecidos; controles visibles retirados por indicación del usuario.
- [x] Imágenes públicas por área, pausa por visibilidad y movimiento reducido.
- [x] Sistemas web y Páginas web separados únicamente en Sistemas; proyectos anteriores preservados.
- [x] URL e imagen requeridas al publicar páginas web; sistemas conservan credenciales cifradas y permisos.
- [x] Áreas actuales conservadas; alta y eliminación bloqueadas en servidor y panel.
- [x] 36 pruebas de permisos, publicación y consultas correctas.

- [x] Comprobado en navegador a 375, 768 y 1280 px: sin desbordamiento, sin controles visibles y máscara rectangular.
- [x] Cambio de diapositiva cada 5 s y respeto de movimiento reducido verificados.
- [x] Secciones exclusivas de Sistemas y build final comprobados; SQL de Hostinger actualizado.

- [x] Encabezado compartido PublicHero con el estilo de Inicio aplicado a las vistas principales, conservando carruseles por área.
- [x] MySQL activo y servidor web reiniciado para cargar la conexión actual.

### Áreas en el menú principal · 14/10/2026

- [x] Desplegable Áreas sustituido por enlaces directos a las áreas actuales.
- [x] Menú adaptable y cierre con Escape verificados a 375, 768 y 1280 px.
- [x] ESLint del componente y TypeScript correctos.

### Cuatro áreas definitivas · 14/10/2026

- [x] Sistemas, software y páginas web; Marketing y diseño gráfico; Ciberseguridad; Soporte técnico.
- [x] Ingeniería y Operaciones eliminadas; proyectos y asignaciones trasladados a Sistemas y Soporte técnico.
- [x] Configuración de seed e iconos actualizada; respaldo antes del cambio y SQL de Hostinger actualizado.
- [x] 36 pruebas, ESLint, TypeScript y menú adaptable correctos.

- [x] Cuatro áreas agrupadas en Servicios; quienes somos en minúsculas. Menú y cierre con Escape verificados a 375, 768 y 1280 px.

- [x] Atajo simultáneo A+S para abrir Ingresar en las vistas públicas; excluye campos editables. Logo vinculado nuevamente a Inicio.

### Contacto y navegación para teléfonos · 14/10/2026

- [x] Vista propia /contactanos con WhatsApp destacado, enlace de llamadas, correo y redes.
- [x] Barra inferior para teléfonos: Inicio, Servicios, Nosotros y Contacto, con iconos y estado activo.
- [x] Menú hamburguesa oculto en teléfonos; conservado el menú de escritorio y tablet.
- [x] Ajustes adaptables de formularios, tarjetas, texto y panel.
- [x] Vistas públicas principales y panel verificados a 375, 768 y 1280 px sin desbordamiento horizontal.
- [x] ESLint, TypeScript y build correctos.

- [x] Rutas directas de servicios con redirecciones permanentes; SEO editable por área, canonicals, sitemap y datos estructurados para codexcusco.com.

- [x] Preparación de producción: ejemplos archivados sin borrar datos, contenido corporativo, revisión pública y administrativa, auditoría en español y panel no indexable.

- [x] Proformas sin RUC, firma, tarifas ni condiciones precargadas; cuentas de prueba desactivadas y vistas revisadas en 375, 768 y 1280 px.

### Publicación por área y fecha del trabajo · 20/10/2026

- [x] Fecha completa del trabajo en formulario, tarjetas y detalle; año histórico conservado.
- [x] Foto de portada y fecha obligatorias al publicar; protección al editar publicaciones.
- [x] Páginas web y sistemas de gestión exclusivos de Sistemas, con validación en servidor.
- [x] Sistemas de gestión requieren al menos una credencial activa antes de publicar.

- [x] Panel compacto: navegación activa con iconos, indicadores en una fila, formularios densos y columna de imágenes/publicación en escritorio.
- [x] Verificación: 37 pruebas automáticas y flujo de creación, imagen y publicación en navegador; panel revisado a 375, 768 y 1280 px en claro y oscuro, sin desbordamiento horizontal.

### Títulos y enlaces de sistemas en buscadores · 20/10/2026

- [x] Títulos por sistema, canonical, descripción y metadatos para compartir.
- [x] Datos estructurados de página, trabajo y migas de navegación; solo proyectos publicados.
- [x] Sitemap existente conserva enlaces individuales de los trabajos publicados.

### Publicación e imágenes por área · 20/10/2026

- [x] Dashboard con accesos equivalentes para publicar trabajos en cada área.
- [x] Contenido por área con fotos vinculadas exclusivamente a cada trabajo, desde el formulario de creación y edición.
- [x] Creación con selección explícita del área; campos y textos adecuados a trabajos con fotos.

- [x] Flujo de dos pasos: seleccionar área y cargar contenido con campos específicos.
- [x] Selección de fotos antes de guardar; carga con reintento sobre el mismo borrador. Marketing permite fotos o enlaces; Soporte y Ciberseguridad solo fotos.

- [x] Botones convencionales en todas las vistas, sin flechas decorativas, con bordes redondeados y variantes principal, secundaria y destructiva según la acción.

### Simplificación del panel · 20/10/2026

- [x] Un único apartado Contenido: lista, selección de área y creación. Resumen sin duplicar la selección.
- [x] Administración sin duplicar Mi área/Administrar áreas ni Equipo/Usuarios.
- [x] Formulario sin editor enriquecido, metadatos técnicos ni nombre duplicado del sistema; enlaces únicamente en Marketing y páginas web.

- [x] Sistemas: selector fijo entre Página web y Sistema de administración; credenciales solo para administración. Todas las demás áreas: foto, título, información, fecha y enlace opcional.

- [x] Acceso demo simplificado a correo electrónico y contraseña, con correo validado en el servidor.

- [x] Vista previa de tarjeta en vivo: título, información, fecha, área, tipo, enlace y foto, antes de guardar y al editar la portada.

- [x] Tarjetas con información superpuesta en la parte inferior de la imagen y degradado oscuro compartido entre catálogo y vista previa.

- [x] Eliminados definitivamente los seis ejemplos archivados, sus imágenes registradas y accesos demo; seed de ejemplos bloqueado por defecto. Base local limpia respaldada para producción.

### Revisión de seguridad · 20/10/2026

- [x] Dependencias indirectas vulnerables actualizadas; auditoría de producción sin avisos conocidos y aviso de desarrollo sin parche documentado.
- [x] CSP con nonce, origen obligatorio, límites de tamaño/tiempo y cuotas compartidas en MySQL.
- [x] Recuperación y cambio de contraseña reforzados; accesos internos denegados a sesiones pendientes de cambio de clave.
- [x] Imágenes privadas verificadas por permisos y almacenamiento S3 servido por la aplicación; aislamiento entre áreas.
- [x] Validación del contenido almacenado y protección transaccional del último administrador.
- [x] Pruebas de seguridad y navegador en producción local, conservando publicaciones reales.
- [x] Informe y requisitos pendientes del hosting en docs/SEGURIDAD.md; comandos security:check y security:maintenance.

- [x] Navegación pública simplificada: retirados los filtros de año, etiqueta y tipo de las áreas; búsqueda dedicada con un campo y botón Buscar.

- [x] Compilación de producción con Webpack y Tailwind PostCSS para evitar el fallo del proceso de loaders de Turbopack reportado en Hostinger.
