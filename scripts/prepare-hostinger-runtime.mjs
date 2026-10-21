import { createRequire } from "node:module";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
} from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const destination = path.resolve(process.argv[2] || ".next/standalone");
const runtimeRequire = createRequire(path.join(destination, "package.json"));
const nextRequire = createRequire(runtimeRequire.resolve("next"));
const prismaRequire = createRequire(runtimeRequire.resolve("@prisma/client"));
async function dependencySource(resolve, prefix, relative) {
  try {
    return resolve();
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    const store = path.join(destination, "node_modules/.pnpm");
    const candidates = [];
    for (const entry of await readdir(store)) {
      if (!entry.startsWith(prefix)) continue;
      const candidate = path.join(store, entry, "node_modules", relative);
      if (await lstat(candidate).catch(() => null)) candidates.push(candidate);
    }
    if (candidates.length !== 1)
      throw new Error(`Cannot uniquely locate runtime dependency: ${relative}`);
    return candidates[0];
  }
}
const aliases = [
  [
    "@swc/helpers",
    await dependencySource(
      () => path.dirname(nextRequire.resolve("@swc/helpers/package.json")),
      "@swc+helpers@",
      "@swc/helpers",
    ),
  ],
  [
    "react",
    await dependencySource(
      () => path.dirname(nextRequire.resolve("react/package.json")),
      "react@",
      "react",
    ),
  ],
  [
    ".prisma",
    await dependencySource(
      () =>
        path.dirname(
          path.dirname(prismaRequire.resolve(".prisma/client/default")),
        ),
      "@prisma+client@",
      ".prisma",
    ),
  ],
];
for (const [name, source] of aliases) {
  const target = path.join(destination, "node_modules", name);
  const canonical = await realpath(source);
  if (!canonical.startsWith(destination + path.sep))
    throw new Error("Runtime dependency outside standalone output");
  if (
    await lstat(target).catch((e) => {
      if (e.code === "ENOENT") return null;
      throw e;
    })
  )
    continue;
  await mkdir(path.dirname(target), { recursive: true });
  await symlink(path.relative(path.dirname(target), canonical), target);
}
// Do not publish build-time environment files; bootstrap reads private config.
for (const filename of [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
]) {
  await rm(path.join(destination, filename), { force: true });
}
// Test resolution through the non-canonical paths used by LiteSpeed.
const directNext = createRequire(
  path.join(destination, "node_modules/next/dist/client/lib/console.js"),
);
directNext("@swc/helpers/_/_interop_require_default");
directNext("react");
createRequire(path.join(destination, "node_modules/@prisma/client/default.js"))(
  ".prisma/client/default",
);
if (
  !(await lstat(path.join(destination, "next-server.js")).catch(() => null))
) {
  await readFile(path.join(destination, "server.js"));
  await rename(
    path.join(destination, "server.js"),
    path.join(destination, "next-server.js"),
  );
}
await cp(
  path.join(root, "scripts/hostinger-entry.cjs"),
  path.join(destination, "server.js"),
);
console.log(
  "Hostinger runtime prepared: dependency aliases and private environment bootstrap",
);
