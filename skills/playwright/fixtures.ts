import { test as base, expect, type Page } from "@playwright/test";

type ConsoleFixtures = {
  consoleErrors: string[];
};

export const test = base.extend<ConsoleFixtures>({
  consoleErrors: [
    async ({ page }: { page: Page }, use: (r: string[]) => Promise<void>) => {
      const errors: string[] = [];

      page.on("pageerror", (error: Error) => errors.push(error.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await use(errors);

      expect(errors, `Console errors:\n${errors.join("\n")}`).toHaveLength(0);
    },
    { auto: true },
  ],
});
