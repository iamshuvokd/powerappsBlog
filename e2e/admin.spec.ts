import { expect, test } from "@playwright/test";

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@powerapps.blog";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

test("admin login -> create + publish post -> visible publicly with video embed", async ({
  page,
}) => {
  // --- Login ---
  await page.goto("/admin/login");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("Total Posts")).toBeVisible();

  // --- Create a new post ---
  await page.goto("/admin/posts/new");
  const unique = Date.now();
  const title = `Playwright Post ${unique}`;
  const slug = `playwright-post-${unique}`;

  await page.fill('input[placeholder^="Post title"]', title);
  await page.fill('textarea[placeholder^="Short summary"]', "Created by the Playwright e2e test.");

  // Paragraph block
  await page.getByRole("button", { name: "Add block" }).click();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.fill('textarea[placeholder^="Paragraph"]', "Body authored by the e2e test.");

  // Video block (YouTube) — exercises the embed renderer
  await page.getByRole("button", { name: "Add block" }).click();
  await page.getByRole("button", { name: "Video", exact: true }).click();
  await page.fill('input[placeholder="Video URL"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  // Publish
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published.")).toBeVisible({ timeout: 15_000 });

  // --- Verify it is live on the public site ---
  await page.goto(`/blog/${slug}`);
  await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Body authored by the e2e test.")).toBeVisible();
  await expect(page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]')).toBeVisible();
});
