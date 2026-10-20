# 02 — Arquitectura

## Estructura de carpetas

```
/src
  /app
    /(public)
      page.tsx                    # Inicio
      /areas/page.tsx
      /areas/[slug]/page.tsx
      /proyectos/[slug]/page.tsx
      /buscar/page.tsx
    /(auth)/ingresar/page.tsx
    /panel
      layout.tsx                  # guard de sesión
      page.tsx                    # dashboard
      /proyectos/page.tsx
      /proyectos/nuevo/page.tsx
      /proyectos/[id]/page.tsx
      /mi-area/page.tsx
      /equipo/page.tsx
      /admin/areas | usuarios | ajustes | auditoria
    /api/upload/route.ts
    /api/auth/[...nextauth]/route.ts
    sitemap.ts · robots.ts · not-found.tsx · error.tsx
  /components
    /ui            # shadcn
    /public        # Hero, AreaCard, ProjectCard, Gallery, SystemBlock...
    /panel         # DataTable, ProjectForm, ImageUploader, CredentialsEditor...
  /lib
    auth.ts · db.ts · permissions.ts · crypto.ts · storage/ · validators/ · utils.ts
  /server
    /actions       # server actions por dominio (projects, areas, users, media)
    /queries       # lecturas con Prisma
/prisma/schema.prisma · seed.ts
/design-reference  # capturas/HTML exportados de Stitch
/docs
```

## Modelo de datos (Prisma, resumen)

```prisma
enum Role { SUPER_ADMIN AREA_ADMIN EDITOR INTERNAL }
enum ProjectType { PROJECT SYSTEM }
enum ProjectStatus { DRAFT IN_REVIEW PUBLISHED ARCHIVED }
enum CredentialVisibility { PUBLIC INTERNAL HIDDEN }

model User {
  id String @id @default(cuid())
  name String
  email String @unique
  passwordHash String
  role Role @default(EDITOR)
  isActive Boolean @default(true)
  areas UserArea[]
  createdAt DateTime @default(now())
}

model Area {
  id String @id @default(cuid())
  name String
  slug String @unique
  description String?
  color String        // hex, color de acento del área
  icon String?        // nombre de ícono lucide
  coverImageUrl String?
  order Int @default(0)
  isActive Boolean @default(true)
  users UserArea[]
  projects Project[]
}

model UserArea {
  userId String
  areaId String
  isManager Boolean @default(false)   // admin de área
  @@id([userId, areaId])
}

model Project {
  id String @id @default(cuid())
  areaId String
  title String
  slug String @unique
  summary String
  content Json?                 // Tiptap JSON
  type ProjectType @default(PROJECT)
  status ProjectStatus @default(DRAFT)
  year Int?
  tags Json @default("[]")
  techStack Json @default("[]")
  isFeatured Boolean @default(false)
  coverMediaId String?
  publishedAt DateTime?
  createdById String
  updatedById String?
  media Media[]
  system SystemInfo?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Media {
  id String @id @default(cuid())
  projectId String
  url String
  storageKey String
  alt String
  width Int?
  height Int?
  order Int @default(0)
}

model SystemInfo {
  id String @id @default(cuid())
  projectId String @unique
  systemName String
  url String
  environment String @default("demo")   // demo | produccion
  credentialVisibility CredentialVisibility @default(INTERNAL)
  credentials DemoCredential[]
}

model DemoCredential {
  id String @id @default(cuid())
  systemInfoId String
  label String                 // ej. "Administrador"
  username String
  passwordEnc String           // AES-256-GCM (iv:tag:cipher en base64)
  notes String?
  isActive Boolean @default(true)
}

model SiteSettings { id Int @id @default(1) siteName String logoUrl String? contactEmail String? socials Json? requireReview Boolean @default(false) }
model AuditLog { id String @id @default(cuid()) userId String action String entity String entityId String meta Json? createdAt DateTime @default(now()) }
```

Índices: `Project(areaId,status)`, `Project(slug)`, full-text o `ILIKE` sobre título/resumen para búsqueda.

## Autenticación y autorización

- Auth.js con credenciales; sesión JWT con `userId` y versión de sesión; rol y áreas se vuelven a consultar en la base en cada operación protegida.
- `lib/permissions.ts` expone funciones puras: `canEditProject(user, project)`, `canPublish(user, project)`, `canManageArea(user, areaId)`, `canViewCredentials(user, system)`.
- `proxy.ts` (Next.js 16.4) protege `/panel/*`; **además** cada action/handler valida permisos (defensa en profundidad).
- Rate limiting en login (5 intentos / 15 min por IP+email).

## Seguridad

- Variables: `DATABASE_URL`, `AUTH_SECRET`, `CREDENTIALS_ENC_KEY` (32 bytes base64), `STORAGE_*`, `APP_URL`.
- Cifrado de contraseñas demo en `lib/crypto.ts` (AES-256-GCM, IV aleatorio por registro).
- Contraseñas demo se descifran **solo en servidor** y solo si `canViewCredentials` es verdadero; nunca se envían al cliente si no.
- Sanitizar contenido enriquecido al renderizar. Headers de seguridad (CSP, X-Frame-Options, etc.) en `next.config`.
- Subidas: tipos `image/jpeg|png|webp`, máx. 5 MB, nombre aleatorio, optimización a WebP, URL firmada o bucket público de solo lectura.
- Auditar: crear/editar/publicar/eliminar proyecto, ver/editar credenciales, cambios de usuarios.

## Rendimiento y SEO

- Páginas públicas con ISR/`revalidateTag` al publicar o editar.
- `next/image` con `sizes`; portada con `priority` solo en hero.
- `generateMetadata` por proyecto y área; JSON-LD básico.

## Despliegue (por defecto)

Vercel + Postgres gestionado (Neon/Supabase) + R2/S3. Alternativa: Docker en servidor propio (incluir `Dockerfile` y `docker-compose.yml` en Fase 7 si se pide).

Implementación vigente: `prisma/schema.prisma` completa las relaciones del resumen, añade usuario interno, versión de sesión, intentos de ingreso y tokens de recuperación. En desarrollo se usa MySQL exclusivo en el puerto 53306 y almacenamiento local detrás de `StorageProvider`; producción se prepara para MySQL/MariaDB en Hostinger y R2/S3. El origen PostgreSQL y su historial se conservan para recuperación; el traslado usa `scripts/transfer-db.mjs`.
