import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "just run",
    url: "http://localhost:8001",
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: "8001",
    },
  },
});
