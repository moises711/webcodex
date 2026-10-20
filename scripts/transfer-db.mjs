import { loadEnvFile } from "node:process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const [mode, filename, envFile = ".env"] = process.argv.slice(2);
if (!["export", "import", "verify"].includes(mode) || !filename) {
  console.error(
    "Uso: node scripts/transfer-db.mjs export|import|verify archivo.json [archivo.env]",
  );
  process.exit(1);
}
loadEnvFile(envFile);
const url = process.env.DATABASE_URL;
if (!url?.startsWith(mode === "export" ? "postgresql://" : "mysql://")) {
  throw new Error(
    "El archivo.env debe tener DATABASE_URL del motor correspondiente.",
  );
}
const clientModule =
  mode === "export"
    ? require("../.local/postgresql-client")
    : require("@prisma/client");
const { PrismaClient, Prisma } = clientModule;
const db = new PrismaClient({ datasources: { db: { url } } });
const models = [
  "user",
  "area",
  "userArea",
  "project",
  "media",
  "systemInfo",
  "demoCredential",
  "siteSettings",
  "auditLog",
  "loginAttempt",
  "passwordReset",
  "pageVisit",
];
const dates = new Set([
  "createdAt",
  "updatedAt",
  "publishedAt",
  "expiresAt",
  "usedAt",
]);
const jsonFields = new Set(["content", "socials", "meta"]);
try {
  if (mode === "export") {
    const tables = await db.$transaction(
      async (tx) => {
        const result = {};
        for (const model of models) result[model] = await tx[model].findMany();
        return result;
      },
      { isolationLevel: "RepeatableRead", timeout: 120000 },
    );
    await mkdir(path.dirname(path.resolve(filename)), { recursive: true });
    // Exclusive creation prevents overwriting an existing backup.
    await writeFile(filename, JSON.stringify({ version: 1, tables }), {
      mode: 0o600,
      flag: "wx",
    });
    console.log(
      "Exportación completa:",
      Object.fromEntries(models.map((m) => [m, tables[m].length])),
    );
  } else {
    const payload = JSON.parse(await readFile(filename, "utf8"));
    if (
      payload.version !== 1 ||
      models.some((m) => !Array.isArray(payload.tables?.[m]))
    ) {
      throw new Error("Formato de respaldo no válido.");
    }
    const tables = payload.tables;
    if (mode === "verify") {
      function canonical(value) {
        if (value instanceof Date) return value.toISOString();
        if (Array.isArray(value)) return value.map(canonical);
        if (value && typeof value === "object")
          return Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((key) => [key, canonical(value[key])]),
          );
        return value;
      }
      const encoded = (rows) =>
        rows.map((row) => JSON.stringify(canonical(row))).sort();
      await db.$transaction(
        async (tx) => {
          for (const model of models) {
            const actual = await tx[model].findMany();
            if (
              JSON.stringify(encoded(actual)) !==
              JSON.stringify(encoded(tables[model]))
            ) {
              throw new Error("VERIFICATION_FAILED");
            }
          }
        },
        { isolationLevel: "RepeatableRead", timeout: 120000 },
      );
      console.log("Contenido idéntico al respaldo en todas las tablas.");
    } else {
      await db.$transaction(
        async (tx) => {
          for (const model of models) {
            if (await tx[model].count())
              throw new Error("El destino debe estar vacío: " + model);
          }
          for (const model of models) {
            for (const source of tables[model]) {
              const row = { ...source };
              for (const key of Object.keys(row)) {
                if (dates.has(key) && row[key]) row[key] = new Date(row[key]);
                if (jsonFields.has(key) && row[key] === null)
                  row[key] = Prisma.DbNull;
              }
              // Media depends on Project, while Project's cover depends on Media.
              if (model === "project") row.coverMediaId = null;
              await tx[model].create({ data: row });
            }
          }
          for (const row of tables.project) {
            if (row.coverMediaId)
              await tx.project.update({
                where: { id: row.id },
                data: {
                  coverMediaId: row.coverMediaId,
                  updatedAt: new Date(row.updatedAt),
                },
              });
          }
          for (const model of models) {
            if ((await tx[model].count()) !== tables[model].length)
              throw new Error("Conteo incorrecto: " + model);
          }
        },
        { timeout: 300000 },
      );
      console.log(
        "Importación completa. Conteos verificados para todas las tablas.",
      );
    }
  }
} catch (error) {
  // Prisma exceptions may embed connection details or query parameters.
  console.error(
    "No se completó la transferencia. Código:",
    error.code || "TRANSFER_FAILED",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
