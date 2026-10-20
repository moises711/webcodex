import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, chmodSync } from "node:fs";
import { loadEnvFile } from "node:process";
import path from "node:path";
const mode = process.argv[2];
const directory = path.resolve(".local/postgres");
const binary = process.env.LOCAL_POSTGRES_BIN || "/usr/lib/postgresql/17/bin";
function run(name, args, env = process.env) {
  const result = spawnSync(path.join(binary, name), args, {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
if (mode === "start") {
  if (!existsSync(directory)) {
    console.error(
      "No existe la instancia local. Consulta README.md para crearla o configura DATABASE_URL.",
    );
    process.exit(1);
  }
  const status = spawnSync(
    path.join(binary, "pg_ctl"),
    ["-D", directory, "status"],
    { stdio: "ignore" },
  );
  if (status.status === 0) {
    console.log("PostgreSQL local ya está activo");
  } else
    run("pg_ctl", [
      "-D",
      directory,
      "-l",
      path.resolve(".local/postgres.log"),
      "-o",
      `-h 127.0.0.1 -p 55432 -k ${path.resolve(".local")}`,
      "start",
    ]);
} else if (mode === "stop") {
  run("pg_ctl", ["-D", directory, "stop", "-m", "fast"]);
} else if (mode === "backup") {
  loadEnvFile(".env.postgresql-local");
  const url = new URL(process.env.DATABASE_URL);
  const env = {
    ...process.env,
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: url.pathname.slice(1),
  };
  mkdirSync(".local/backups", { recursive: true });
  const file = path.resolve(
    `.local/backups/webcodex-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`,
  );
  run("pg_dump", ["--format=custom", "--file", file], env);
  chmodSync(file, 0o600);
  console.log("Respaldo creado en .local/backups");
} else {
  console.error("Usa start, stop o backup");
  process.exit(1);
}
