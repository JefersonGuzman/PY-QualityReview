import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, name: string) {
  await page.goto("/select-user");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("the dashboard shows the trend and issues of one brand", async ({ page }) => {
  await signIn(page, "Marta Vidal");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByLabel("Brand", { exact: true }).selectOption({ label: "Voltra Scooters" });
  await page.getByRole("button", { name: "Show" }).click();
  await expect(page.getByRole("heading", { name: "Voltra Scooters" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trend by week" })).toBeVisible();
  await expect(page.getByText("Skipped brand procedure")).toBeVisible();
});
