import { portalAreas } from "../src/lib/areas";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { encryptCredential } from "../src/lib/crypto";
import { randomBytes } from "node:crypto";
const db = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("El seed de ejemplo está deshabilitado en producción");
  if (process.env.ALLOW_DEMO_SEED !== "true")
    throw new Error(
      "Los ejemplos están desactivados. Usa ALLOW_DEMO_SEED=true únicamente en una base de pruebas.",
    );
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_EDITOR_PASSWORD)
    throw new Error("Configura las contraseñas de seed en .env");
  const admin = await db.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@codex.local" },
    update: {},
    create: {
      name: "Administrador Códex",
      email: process.env.SEED_ADMIN_EMAIL || "admin@codex.local",
      passwordHash: await hash(process.env.SEED_ADMIN_PASSWORD, 12),
      role: "SUPER_ADMIN",
      mustChangePassword: true,
    },
  });
  const areas = portalAreas;
  const saved = [];
  for (const [order, area] of areas.entries())
    saved.push(
      await db.area.upsert({
        where: { slug: area.slug },
        update: {},
        create: { ...area, order },
      }),
    );
  for (const [index, email] of [
    "sistemas@codex.local",
    "marketing@codex.local",
  ].entries()) {
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        name: index === 0 ? "Editor de Sistemas" : "Editor de Marketing",
        email,
        passwordHash: await hash(process.env.SEED_EDITOR_PASSWORD, 12),
        role: "EDITOR",
        mustChangePassword: true,
      },
    });
    await db.userArea.upsert({
      where: { userId_areaId: { userId: user.id, areaId: saved[index].id } },
      update: {},
      create: { userId: user.id, areaId: saved[index].id },
    });
  }
  const samples = [
    {
      title: "Portal de asistencia",
      slug: "portal-de-asistencia",
      area: 0,
      system: true,
    },
    {
      title: "Gestión de proyectos",
      slug: "gestion-de-proyectos",
      area: 0,
      system: true,
    },
    {
      title: "Planificación técnica",
      slug: "planificacion-tecnica",
      area: 0,
      system: false,
    },
    {
      title: "Diseño de soluciones",
      slug: "diseno-de-soluciones",
      area: 0,
      system: false,
    },
    {
      title: "Identidad y comunicación",
      slug: "identidad-y-comunicacion",
      area: 1,
      system: false,
    },
    {
      title: "Mejora de procesos",
      slug: "mejora-de-procesos",
      area: 3,
      system: false,
    },
  ];
  for (const sample of samples) {
    if (await db.project.findUnique({ where: { slug: sample.slug } })) continue;
    const project = await db.project.create({
      data: {
        title: sample.title,
        slug: sample.slug,
        areaId: saved[sample.area].id,
        summary:
          "Proyecto de ejemplo para explorar el portal de Códex Cusco. Este contenido es demostrativo.",
        year: 2026,
        tags: ["Demostración"],
        techStack: sample.system ? ["Next.js", "MySQL"] : [],
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: admin.id,
        type: sample.system ? "SYSTEM" : "PROJECT",
        isFeatured: sample.area === 0,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Contenido de demostración. Reemplaza este proyecto por el trabajo real de tu equipo desde el panel.",
                },
              ],
            },
          ],
        },
        media: {
          create: {
            url: "/brand/codex-cusco.jpeg",
            storageKey: "seed/codex-cusco",
            alt: "Identidad de Códex Cusco; imagen de demostración",
          },
        },
        ...(sample.system
          ? {
              system: {
                create: {
                  systemName: sample.title,
                  url: "https://example.com",
                  credentialVisibility: "INTERNAL",
                  credentials: {
                    create: {
                      label: "Cuenta de ejemplo",
                      username: "demo",
                      passwordEnc: encryptCredential(
                        randomBytes(16).toString("base64url"),
                      ),
                      notes:
                        "Credencial ficticia; no corresponde a un sistema real.",
                    },
                  },
                },
              },
            }
          : {}),
      },
    });
    const cover = await db.media.findFirstOrThrow({
      where: { projectId: project.id },
    });
    await db.project.update({
      where: { id: project.id },
      data: { coverMediaId: cover.id },
    });
  }
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: "Códex Cusco",
      logoUrl: "/brand/codex-cusco.jpeg",
      notice:
        "Este portal muestra proyectos corporativos. Las credenciales demo son exclusivamente para pruebas.",
    },
  });
  console.log(
    "Seed completado: 4 áreas y 6 proyectos de demostración. Las claves están en .env y no se imprimen.",
  );
}
main().finally(() => db.$disconnect());
