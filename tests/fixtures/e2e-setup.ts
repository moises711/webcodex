import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID, randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import sharp from "sharp";
import { encryptCredential } from "../../src/lib/crypto";
export default async function setup() {
  loadEnvFile(".env");
  const db = new PrismaClient();
  const prefix = `e2e-${randomUUID()}`;
  const password = randomBytes(24).toString("base64url");
  const secret = randomBytes(18).toString("base64url");
  const areas = [];
  for (const suffix of ["a", "b"])
    areas.push(
      await db.area.create({
        data: {
          name: `${prefix}-${suffix}`,
          slug: `${prefix}-${suffix}`,
          color: "#2F86C8",
        },
      }),
    );
  const users = [];
  for (const [index, role] of ["EDITOR", "EDITOR", "SUPER_ADMIN"].entries()) {
    const email = `${prefix}-${index}@test.invalid`;
    users.push(
      await db.user.create({
        data: {
          name: `E2E ${index}`,
          email,
          passwordHash: await hash(password, 12),
          role: role as "EDITOR",
          mustChangePassword: false,
          areas:
            role === "SUPER_ADMIN"
              ? undefined
              : { create: { areaId: areas[index].id } },
        },
      }),
    );
  }
  const projects = [];
  for (const [index, visibility] of [
    "INTERNAL",
    "HIDDEN",
    "PUBLIC",
  ].entries()) {
    const p = await db.project.create({
      data: {
        title: `${prefix} ${visibility}`,
        slug: `${prefix}-${visibility.toLowerCase()}`,
        summary: "Proyecto de pruebas automáticas",
        areaId: areas[index === 1 ? 1 : 0].id,
        createdById: users[index === 1 ? 1 : 0].id,
        status: "PUBLISHED",
        publishedAt: new Date(),
        type: "SYSTEM",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Contenido seguro de prueba" }],
            },
          ],
        },
        media: {
          create: {
            url: "/brand/codex-cusco.jpeg",
            storageKey: "seed/codex-cusco",
            alt: "Logo de Códex Cusco",
          },
        },
        system: {
          create: {
            systemName: "Sistema de prueba",
            url: "https://example.com",
            credentialVisibility: visibility as "INTERNAL",
            credentials: {
              create: {
                label: "Demo",
                username: "demo",
                passwordEnc: encryptCredential(secret),
              },
            },
          },
        },
      },
    });
    const media = await db.media.findFirstOrThrow({
      where: { projectId: p.id },
    });
    await db.project.update({
      where: { id: p.id },
      data: { coverMediaId: media.id },
    });
    projects.push({ id: p.id, slug: p.slug });
  }
  await mkdir(".local", { recursive: true });
  await writeFile(
    ".local/e2e.json",
    JSON.stringify({
      prefix,
      password,
      secret,
      areas: areas.map((a) => ({ id: a.id, name: a.name })),
      users: users.map((u) => ({ id: u.id, email: u.email })),
      projects,
    }),
    { mode: 0o600 },
  );
  await sharp({
    create: {
      width: 800,
      height: 450,
      channels: 3,
      background: { r: 50, g: 130, b: 180 },
    },
  })
    .png()
    .toFile(".local/e2e.png");
  await db.$disconnect();
}
