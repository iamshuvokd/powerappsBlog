import { expect, test } from "@playwright/test";

test("homepage renders the Three.js hero canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Microsoft 365 builder blog")).toBeVisible();
  // Three.js mounts a <canvas> into the hero.
  await expect.poll(() => page.locator("canvas").count(), { timeout: 15_000 }).toBeGreaterThan(0);
});

test("blog list shows posts loaded from the API", async ({ page }) => {
  await page.goto("/tutorials");
  await expect(
    page.getByRole("link", { name: /Build an Enterprise Inventory System/ }),
  ).toBeVisible({ timeout: 15_000 });
});

test("blog post code block has a working copy button", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog/build-an-enterprise-inventory-system-in-power-apps");

  const copyButton = page.getByRole("button", { name: "Copy code" }).first();
  await expect(copyButton).toBeVisible({ timeout: 15_000 });
  await copyButton.click();
  await expect(page.getByText("Copied")).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("Filter(Movements");
});
