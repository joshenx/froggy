import { expect, test } from "@playwright/test";

test("renders the landing page and submits the waitlist form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Build interviews that find your ideal candidate/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Try Froggy/i })).toBeVisible();

  await page.route("/api/interested", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.getByLabel(/Work email/i).fill("founder@example.com");
  await page.getByRole("button", { name: /Try Froggy/i }).click();
  await expect(page.getByText(/You’re on the list/i)).toBeVisible();
});

test("navbar anchors scroll to their sections", async ({ page }) => {
  await page.goto("/");

  const anchors = [
    { link: "Product", heading: /The interview system/i },
    { link: "Question banks", heading: /Collaborative banks/i },
    { link: "Evaluation axes", heading: /See exactly what each question tests/i },
    { link: "Pricing", heading: /Early teams get founder pricing/i },
  ];

  for (const anchor of anchors) {
    await page.getByRole("link", { name: anchor.link }).click();
    await expect(page.getByRole("heading", { name: anchor.heading })).toBeInViewport();
  }
});

test("clicking questions updates the evaluation axes chart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Evaluation axes" }).click();

  await expect(page.getByRole("heading", { name: /See exactly what each question tests/i })).toBeVisible();
  const axesTable = page.getByTestId("axes-table");
  await expect(axesTable.getByRole("row", { name: /Customer empathy 92%/i })).toBeVisible();

  await page.getByRole("tab", { name: /Question 2/i }).click();
  await expect(axesTable.getByRole("row", { name: /Product sense 88%/i })).toBeVisible();

  await page.getByRole("tab", { name: /Question 3/i }).click();
  await expect(axesTable.getByRole("row", { name: /Bar clarity 84%/i })).toBeVisible();
});
