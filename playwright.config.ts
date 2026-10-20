import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/fixtures/e2e-setup.ts",
  globalTeardown: "./tests/fixtures/e2e-teardown.ts",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "off",
  },
});
