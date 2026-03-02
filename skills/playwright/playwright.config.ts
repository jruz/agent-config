import { defineConfig } from "@playwright/test";
import { log } from "./scripts/log.ts";

if (!process.env["APP_DOMAIN"]) {
  log.error("APP_DOMAIN environment variable is not set");
  process.exit(1);
}
if (!process.env["PORT"]) {
  log.error("PORT environment variable is not set");
  process.exit(1);
}
const baseURL = `http://${process.env["APP_DOMAIN"]}:${process.env["PORT"]}`;

export default defineConfig({
  testDir: "./playwright",
  snapshotPathTemplate: "playwright/screenshots/{arg}-{projectName}{ext}",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 5_000,
  reporter: "list",
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    actionTimeout: 5_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "just run",
    url: baseURL,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 5_000,
  },
});
