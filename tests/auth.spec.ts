import { expect, test } from "@playwright/test";

test("protected product routes redirect to login, then dev auth unlocks the workspace", async ({
  page,
  request,
}) => {
  await request.post("/api/testing/reset-mvp");

  await page.goto("/questions");
  await expect(page).toHaveURL(/\/login\?next=%2Fquestions$/);
  await expect(page.getByRole("heading", { name: /Sign in to the Froggy workspace/i })).toBeVisible();

  await page.getByRole("button", { name: /Priya Raman/i }).click();
  await expect(page).toHaveURL("/questions");
  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();
});
