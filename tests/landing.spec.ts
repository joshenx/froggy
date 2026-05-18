import { expect, test } from "@playwright/test";

test("renders the landing page and submits the waitlist form", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Design interview loops with a clear, calibrated hiring signal/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Join waitlist/i })).toBeVisible();

  await page.route("/api/interested", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.getByLabel(/Work email/i).fill("founder@example.com");
  await page.getByRole("button", { name: /Join waitlist/i }).click();
  await expect(page.getByText(/You’re on the list/i)).toBeVisible();
});

test("navbar anchors scroll to their sections", async ({ page }) => {
  await page.goto("/");

  const anchors = [
    { link: "Question bank", heading: /Structured question bank with audit history/i },
    { link: "Rubrics", heading: /Reusable rubrics with anchored 1-5 bands/i },
    { link: "Coverage", heading: /See where each question adds coverage/i },
    { link: "Pricing", heading: /Pricing and launch/i },
    { link: "FAQ", heading: /Frequently asked questions/i },
  ];

  for (const anchor of anchors) {
    await page.getByRole("link", { name: anchor.link }).first().click();
    await expect(page.getByRole("heading", { name: anchor.heading })).toBeInViewport();
  }
});

test("clicking questions updates the evaluation axes chart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Coverage" }).first().click();

  await expect(page.getByRole("heading", { name: /See where each question adds coverage/i })).toBeVisible();
  const axesTable = page.getByTestId("axes-table");
  await expect(axesTable.getByRole("row", { name: /Debugging 94%/i })).toBeVisible();

  await page.getByRole("tab", { name: /Question 2/i }).click();
  await expect(axesTable.getByRole("row", { name: /Product judgment 88%/i })).toBeVisible();

  await page.getByRole("tab", { name: /Question 3/i }).click();
  await expect(axesTable.getByRole("row", { name: /Values alignment 84%/i })).toBeVisible();
});
