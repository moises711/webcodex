import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  chmodSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { loadEnvFile } from "node:process";
import path from "node:path";
const mode = process.argv[2];
const directory = path.resolve(".local/mysql");
const sourceBinary = process.env.LOCAL_MYSQL_BIN || "/usr/sbin/mysqld";
function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
if (mode === "start") {
  if (!existsSync(path.join(directory, "data", "auto.cnf"))) {
    console.error(
      "Configura MySQL/MariaDB o XAMPP y DATABASE_URL. La instancia local dedicada no está inicializada.",
    );
    process.exit(1);
  }
  const admin = path.join(directory, "admin.cnf");
  const status = spawnSync(
    "mysqladmin",
    [`--defaults-extra-file=${admin}`, "ping"],
    { stdio: "ignore" },
  );
  if (status.status === 0) console.log("MySQL local ya está activo");
  else {
    const binary = path.join(directory, "mysqld");
    if (!existsSync(binary)) {
      copyFileSync(sourceBinary, binary);
      chmodSync(binary, 0o700);
    }
    run(binary, [
      "--no-defaults",
      "--basedir=/usr",
      `--datadir=${directory}/data`,
      `--socket=${directory}/mysql.sock`,
      `--pid-file=${directory}/mysql.pid`,
      `--log-error=${directory}/mysql.log`,
      "--bind-address=127.0.0.1",
      "--port=53306",
      "--mysqlx=OFF",
      "--daemonize",
    ]);
  }
} else if (mode === "stop") {
  run("mysqladmin", [
    `--defaults-extra-file=${directory}/admin.cnf`,
    "shutdown",
  ]);
} else if (mode === "backup") {
  loadEnvFile(".env");
  const url = new URL(process.env.DATABASE_URL);
  if (url.protocol !== "mysql:")
    throw new Error("DATABASE_URL debe ser MySQL/MariaDB");
  const escape = (value) =>
    '"' +
    value
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r") +
    '"';
  const backups = path.resolve(".local/backups");
  mkdirSync(backups, { recursive: true });
  const config = path.join(backups, `client-${process.pid}.cnf`);
  const file = path.join(
    backups,
    `mysql-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`,
  );
  writeFileSync(
    config,
    `[client]\nuser=${escape(decodeURIComponent(url.username))}\npassword=${escape(decodeURIComponent(url.password))}\nhost=${escape(url.hostname)}\nport=${url.port || "3306"}\n`,
    { mode: 0o600, flag: "wx" },
  );
  writeFileSync(file, "", { mode: 0o600, flag: "wx" });
  try {
    const result = spawnSync(
      "mysqldump",
      [
        `--defaults-extra-file=${config}`,
        "--single-transaction",
        "--no-tablespaces",
        "--set-gtid-purged=OFF",
        `--result-file=${file}`,
        decodeURIComponent(url.pathname.slice(1)),
      ],
      { stdio: "inherit" },
    );
    if (result.status !== 0) {
      unlinkSync(file);
      process.exitCode = 1;
    } else console.log("Respaldo MySQL creado en .local/backups");
  } finally {
    unlinkSync(config);
  }
} else {
  console.error("Usa start, stop o backup");
  process.exit(1);
}
