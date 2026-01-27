import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  consoleErrors: [async ({ page }, use) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await use(errors);

    expect(errors, `Console errors:\n${errors.join("\n")}`).toHaveLength(0);
  }, { auto: true }],
});
