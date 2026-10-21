import { createRequire } from "node:module";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const destination = path.resolve(root, "output", "hostinger", "nodejs");
const standalone = path.join(root, ".next", "standalone");
await readFile(path.join(standalone, "server.js"));
await readFile(path.join(root, ".next", "BUILD_ID"));
await mkdir(path.dirname(destination), { recursive: true });
await rm(destination, { recursive: true, force: true });
await cp(standalone, destination, { recursive: true, verbatimSymlinks: true });
// Never ship build-time credentials: runtime reads Hostinger's private config.
for (const filename of [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
]) {
  await rm(path.join(destination, filename), { force: true });
}
await cp(
  path.join(root, ".next", "static"),
  path.join(destination, ".next", "static"),
  { recursive: true },
);
await cp(path.join(root, "public"), path.join(destination, "public"), {
  recursive: true,
});
if (
  !(await lstat(path.join(destination, "next-server.js")).catch(() => null))
) {
  await rename(
    path.join(destination, "server.js"),
    path.join(destination, "next-server.js"),
  );
}
await cp(
  path.join(root, "scripts", "hostinger-entry.cjs"),
  path.join(destination, "server.js"),
);
// LiteSpeed/Next can require a module through its non-canonical symlink path.
// Expose only the three runtime dependencies observed to fail on that platform.
const runtimeRequire = createRequire(path.join(destination, "next-server.js"));
const nextRequire = createRequire(runtimeRequire.resolve("next"));
const prismaRequire = createRequire(runtimeRequire.resolve("@prisma/client"));
const aliases = [
  [
    "@swc/helpers",
    path.dirname(nextRequire.resolve("@swc/helpers/package.json")),
  ],
  ["react", path.dirname(nextRequire.resolve("react/package.json"))],
  [
    ".prisma",
    path.dirname(path.dirname(prismaRequire.resolve(".prisma/client/default"))),
  ],
];
for (const [name, source] of aliases) {
  const target = path.join(destination, "node_modules", name);
  if (
    await lstat(target).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    })
  )
    continue;
  const canonical = await realpath(source);
  if (!canonical.startsWith(destination + path.sep))
    throw new Error("Runtime dependency points outside package");
  await mkdir(path.dirname(target), { recursive: true });
  await symlink(path.relative(path.dirname(target), canonical), target);
}
await lstat(
  path.join(
    destination,
    "node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node",
  ),
);
const directNext = createRequire(
  path.join(destination, "node_modules/next/dist/client/lib/console.js"),
);
directNext("@swc/helpers/_/_interop_require_default");
directNext("react");
createRequire(path.join(destination, "node_modules/@prisma/client/default.js"))(
  ".prisma/client/default",
);
await writeFile(
  path.join(destination, "DEPLOYMENT.json"),
  JSON.stringify(
    {
      buildId: (
        await readFile(path.join(root, ".next", "BUILD_ID"), "utf8")
      ).trim(),
      persistentStorage: "hbuilds/private-media",
    },
    null,
    2,
  ),
);
console.log(`Hostinger package ready: ${destination}`);
