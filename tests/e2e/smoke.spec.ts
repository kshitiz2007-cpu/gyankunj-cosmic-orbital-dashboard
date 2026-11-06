import { expect, test } from "@playwright/test";

test("homepage renders usable content", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });

  expect(response, "homepage should return a document response").not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
  await expect(page.locator("body")).toBeVisible();

  const bodyText = (await page.locator("body").innerText()).trim();
  expect(bodyText.length, "homepage should not be an empty shell").toBeGreaterThan(0);
});

test("homepage does not create horizontal page overflow", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.content,
    `page content width (${dimensions.content}px) should fit viewport (${dimensions.viewport}px)`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
});
