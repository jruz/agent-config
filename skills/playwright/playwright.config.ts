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
  expect: {
    timeout: 5_000,
  },
  forbidOnly: true,
  fullyParallel: false,
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { height: 900, width: 1440 } },
    },
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { height: 844, width: 390 } },
    },
  ],
  reporter: "list",
  retries: 0,
  snapshotPathTemplate: "playwright/screenshots/{arg}-{projectName}{ext}",
  testDir: "./playwright",
  timeout: 5_000,
  use: {
    actionTimeout: 5_000,
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "just run",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    timeout: 5_000,
    url: baseURL,
  },
  workers: 1,
});
