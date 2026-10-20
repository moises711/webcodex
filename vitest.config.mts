import { defineConfig } from "vitest/config";
import { loadEnvFile } from "node:process";
import path from "node:path";
loadEnvFile(".env");
export default defineConfig({
  resolve: { alias: { "@": path.resolve("src") } },
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    maxWorkers: 1,
  },
});
