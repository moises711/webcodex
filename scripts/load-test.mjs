import http from "node:http";
import os from "node:os";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { performance } from "node:perf_hooks";
const base = process.env.LOAD_BASE_URL || "http://127.0.0.1:3002";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(base).hostname))
  throw new Error("Esta prueba está limitada al servidor local.");
const dir =
  process.env.LOAD_OUTPUT_DIR ||
  new URL("../output/performance/", import.meta.url).pathname;
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 500,
  maxFreeSockets: 500,
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const stages = [1, 10, 25, 50, 100, 200, 300, 400, 500];
const paths = [
  "/",
  "/areas",
  "/servicios/sistemas-software-web",
  "/areas/sistemas",
  "/buscar",
  "/buscar?q=mantenimiento",
  "/proyectos/portal-de-asistencia",
];
const serverPid = Number(process.env.LOAD_SERVER_PID || 0);
let pending = 0;
function request(path) {
  return new Promise((resolve) => {
    const start = performance.now();
    pending++;
    let settled = false;
    let bytes = 0;
    let html = false;
    let ttfb;
    const finish = (status, error) => {
      if (settled) return;
      settled = true;
      pending--;
      resolve({
        path,
        status,
        error,
        ms: performance.now() - start,
        ttfb: ttfb ?? performance.now() - start,
        bytes,
      });
    };
    const req = http.get(
      base + path,
      {
        agent,
        headers: {
          Accept: "text/html",
          "User-Agent": "Webcodex-local-load-test/1.0",
        },
      },
      (res) => {
        ttfb = performance.now() - start;
        res.on("data", (chunk) => {
          bytes += chunk.length;
          if (chunk.toString().includes("<html")) html = true;
        });
        res.on("end", () =>
          finish(
            res.statusCode,
            res.statusCode !== 200
              ? `HTTP ${res.statusCode}`
              : !html
                ? "HTML faltante"
                : undefined,
          ),
        );
        res.on("error", (err) =>
          finish(res.statusCode, err.code || err.message),
        );
      },
    );
    const deadline = setTimeout(
      () => req.destroy(new Error("TIMEOUT_12S")),
      12000,
    );
    req.on("close", () => clearTimeout(deadline));
    req.on("error", (err) => finish(0, err.code || err.message));
  });
}
function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return (
    Math.round(sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)] * 10) / 10
  );
}
function summary(rows, seconds) {
  const errors = rows.filter((r) => r.error);
  return {
    requests: rows.length,
    errors: errors.length,
    errorPct: +((100 * errors.length) / (rows.length || 1)).toFixed(2),
    rps: +(rows.length / seconds).toFixed(1),
    p50: percentile(
      rows.map((r) => r.ms),
      0.5,
    ),
    p95: percentile(
      rows.map((r) => r.ms),
      0.95,
    ),
    p99: percentile(
      rows.map((r) => r.ms),
      0.99,
    ),
    max: percentile(
      rows.map((r) => r.ms),
      1,
    ),
    ttfbP95: percentile(
      rows.map((r) => r.ttfb),
      0.95,
    ),
    bytes: rows.reduce((a, r) => a + r.bytes, 0),
  };
}
async function resource() {
  if (!serverPid)
    return {
      time: Date.now(),
      ticks: 0,
      rssMB: 0,
      hostLoad: os.loadavg()[0],
      freeMB: Math.round(os.freemem() / 1048576),
    };
  try {
    const stat = await readFile(`/proc/${serverPid}/stat`, "utf8");
    const values = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    const status = await readFile(`/proc/${serverPid}/status`, "utf8");
    return {
      time: Date.now(),
      ticks: Number(values[11]) + Number(values[12]),
      rssMB: Math.round(
        Number(status.match(/VmRSS:\s+(\d+)/)?.[1] || 0) / 1024,
      ),
      hostLoad: os.loadavg()[0],
      freeMB: Math.round(os.freemem() / 1048576),
    };
  } catch {
    return null;
  }
}
await mkdir(dir, { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  base,
  buildId: (
    await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")
  ).trim(),
  platform: os.platform(),
  cpuCount: os.cpus().length,
  totalMemoryMB: Math.round(os.totalmem() / 1048576),
  paths,
  model:
    "Closed model: each VU makes sequential HTML GETs with 0.8–1.2 s think time; keep-alive; 3 s ramp; 15 s per stage, 30 s at 500; no JS execution or asset requests.",
  stages: [],
};
for (const path of paths) {
  const result = await request(path);
  if (result.error) throw Error(`Preflight ${path}: ${result.error}`);
}
for (const users of stages) {
  const duration = users === 500 ? 30000 : 15000;
  const start = performance.now();
  const deadline = start + duration;
  const rows = [];
  let peakPending = 0;
  const samples = [];
  const monitor = setInterval(async () => {
    peakPending = Math.max(peakPending, pending);
    const sample = await resource();
    if (sample) samples.push(sample);
  }, 500);
  let active = 0,
    peakActive = 0;
  const workers = Array.from({ length: users }, (_, id) =>
    (async () => {
      await sleep(users === 1 ? 0 : (3000 * id) / users);
      active++;
      peakActive = Math.max(peakActive, active);
      let turn = id;
      while (performance.now() < deadline) {
        rows.push(await request(paths[turn++ % paths.length]));
        const remaining = deadline - performance.now();
        if (remaining > 0)
          await sleep(Math.min(remaining, 800 + Math.random() * 400));
      }
      active--;
    })(),
  );
  await Promise.all(workers);
  clearInterval(monitor);
  const elapsed = (performance.now() - start) / 1000;
  const result = {
    users,
    elapsed: +elapsed.toFixed(2),
    peakActive,
    peakPending,
    ...summary(rows, elapsed),
    routes: Object.fromEntries(
      paths.map((path) => [
        path,
        summary(
          rows.filter((r) => r.path === path),
          elapsed,
        ),
      ]),
    ),
    errorDetails: Object.fromEntries(
      [...new Set(rows.filter((r) => r.error).map((r) => r.error))].map(
        (error) => [error, rows.filter((r) => r.error === error).length],
      ),
    ),
    resources: samples,
  };
  report.stages.push(result);
  await writeFile(dir + "/load-results.json", JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      users,
      requests: result.requests,
      rps: result.rps,
      p95: result.p95,
      p99: result.p99,
      errors: result.errors,
      peakActive,
      peakPending,
      rssMB: Math.max(...samples.map((r) => r.rssMB)),
    }),
  );
  if (result.errorPct > 10) {
    report.stopped = `More than 10% failed requests at ${users} VUs`;
    break;
  }
}
report.finishedAt = new Date().toISOString();
await writeFile(dir + "/load-results.json", JSON.stringify(report, null, 2));
agent.destroy();
console.log("FINISHED " + dir + "/load-results.json");
