/* eslint-disable @typescript-eslint/no-require-imports -- LiteSpeed loads the startup file using CommonJS. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");

// The package is deployed at hbuilds/versions/<version>/nodejs.
const buildRoot = path.resolve(__dirname, "../../..");
if (path.basename(buildRoot) !== "hbuilds") {
  throw new Error(
    "The Hostinger package must be installed inside hbuilds/versions/<version>/nodejs",
  );
}
const envFile = path.join(buildRoot, "config", ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
process.env.NODE_ENV = "production";
// LiteSpeed uses a Unix socket, so Next cannot fetch redirects on localhost:3000.
// Use the configured public origin for Server Action forwarding on this platform.
if (process.env.LSNODE_SOCKET && !process.env.__NEXT_PRIVATE_ORIGIN) {
  const configuredOrigin = process.env.APP_URL || process.env.AUTH_URL;
  if (!configuredOrigin)
    throw new Error("Configure APP_URL for Hostinger Server Actions");
  const url = new URL(configuredOrigin);
  if (url.protocol !== "https:")
    throw new Error("Hostinger APP_URL must use HTTPS");
  process.env.__NEXT_PRIVATE_ORIGIN = url.origin;
}
process.env.STORAGE_LOCAL_DIR ||= path.join(buildRoot, "private-media");
if (!path.isAbsolute(process.env.STORAGE_LOCAL_DIR)) {
  throw new Error("STORAGE_LOCAL_DIR must be an absolute private path");
}
fs.mkdirSync(process.env.STORAGE_LOCAL_DIR, { recursive: true, mode: 0o700 });
require("./next-server.js");
