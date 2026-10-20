# 01 — PRD (Requerimientos del producto)

## 1. Objetivo
Un portal donde la empresa muestra su trabajo. Cada **área** (p. ej. Sistemas, Ingeniería, Marketing, RRHH…) administra su propia sección: sube proyectos con imágenes y descripción. Los proyectos que son **sistemas** muestran además nombre del sistema, link de acceso y credenciales de prueba (demo).

## 2. Usuarios y roles
| Rol | Descripción |
|---|---|
| **Visitante** | Navega el sitio público. Ve contenido publicado. |
| **Usuario interno** (opcional, ver 06) | Visitante con sesión; puede ver credenciales demo marcadas como "solo internos". |
| **Editor de área** | Crea/edita proyectos de SU área. No publica si está activada la revisión. |
| **Admin de área** | Todo lo del editor + publica/archiva, gestiona editores de su área, edita datos del área. |
| **Super Admin** | Gestiona áreas, usuarios, ajustes del sitio, ve todo, auditoría. |

## 3. Sitio público
- **Inicio**: hero, buscador, áreas destacadas, proyectos recientes/destacados, contador de proyectos/áreas.
- **Áreas** (`/areas`): tarjetas de todas las áreas.
- **Área** (`/areas/[slug]`): portada del área, descripción, filtros (tipo, año, etiqueta), grid de proyectos.
- **Proyecto** (`/proyectos/[slug]`): galería de imágenes (lightbox), título, resumen, contenido enriquecido, etiquetas, año, tecnologías, área. Si es sistema: bloque "Sistema" con nombre, botón "Abrir sistema", y bloque de credenciales demo (según visibilidad).
- **Búsqueda** (`/buscar?q=`): por título, resumen, etiquetas.
- Páginas: Acerca de (opcional), 404, error.
- SEO: metadatos, Open Graph con imagen de portada, sitemap.xml, robots.txt.

## 4. Panel (`/panel`)
- **Login** `/ingresar`, recuperación de contraseña.
- **Dashboard**: resumen de mis proyectos por estado (borrador, en revisión, publicado), actividad reciente.
- **Proyectos**: tabla con búsqueda, filtro por estado/tipo, acciones (editar, duplicar, publicar, archivar, eliminar).
- **Editor de proyecto** (formulario por secciones):
  1. Información básica: título, resumen (máx. 200 car.), tipo (Proyecto / Sistema), área (fijada a la del usuario salvo super admin), año, etiquetas, tecnologías, destacado.
  2. Contenido: editor enriquecido (Tiptap).
  3. Imágenes: subir varias (drag & drop), elegir portada, reordenar, texto alternativo, eliminar.
  4. **Datos del sistema** (solo si tipo = Sistema): nombre del sistema, URL, entorno (demo/producción), visibilidad de credenciales, lista de credenciales demo (etiqueta/rol, usuario, contraseña, notas).
  5. Publicación: estado, vista previa, fecha de publicación.
- **Mi área**: (admin de área) editar nombre, descripción, portada, ícono, color.
- **Equipo del área**: (admin de área) asignar editores.
- **Super admin**: CRUD de áreas, CRUD de usuarios (asignar rol y áreas), ajustes del sitio (logo, nombre, contacto, redes), auditoría.

## 5. Estados de un proyecto
`DRAFT` → `IN_REVIEW` (si la revisión está activa) → `PUBLISHED` → `ARCHIVED`. Solo `PUBLISHED` es visible al público.

## 6. Fuera de alcance (v1)
Comentarios públicos, multiidioma, pagos, app móvil, analítica avanzada.

## 7. Criterios de aceptación globales
- Un editor del Área A **no puede** ver el panel de edición ni modificar proyectos del Área B (probado por URL directa y por API).
- Las contraseñas demo nunca aparecen en el HTML si la visibilidad no lo permite.
- Subir una imagen > límite o de tipo inválido muestra error claro.
- Lighthouse ≥ 90 en Performance/Accesibilidad/SEO en páginas públicas.