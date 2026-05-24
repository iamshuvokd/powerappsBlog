import { defineConfig, devices } from "@playwright/test";

// Prerequisites to run e2e:
//   1. MySQL running + seeded (npm run db:seed)
//   2. API + frontend (the webServer block below starts them, reusing if up)
// Run with:  npm run test:e2e   (after `npx playwright install chromium`)

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run api:start",
      url: "http://localhost:4000/health",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npm run dev -- --port 4321 --strictPort",
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
