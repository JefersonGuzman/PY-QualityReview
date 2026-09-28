import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, name: string) {
  await page.goto("/select-user");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("without an identity every page goes to the selector and the API answers 401", async ({ page, request }) => {
  await page.goto("/responses");
  await expect(page).toHaveURL(/\/select-user$/);
  await expect(page.getByRole("heading", { name: "Choose a demo user" })).toBeVisible();
  expect((await request.get("/api/responses")).status()).toBe(401);
});

test("a Specialist only sees their own replies, in the UI and in the API", async ({ page }) => {
  await signIn(page, "Dani Ortega");
  await expect(page.getByRole("list", { name: "My responses" }).getByRole("article")).toHaveCount(7);
  await expect(page.getByText("Lamp arrived with a cracked shade")).toHaveCount(0);

  const denied = await page.goto("/responses");
  expect(denied?.status()).toBe(403);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();

  // Asking the API directly for another Specialist's reply (Leo's) says no.
  expect((await page.request.get("/api/responses/lu-301")).status()).toBe(404);
  expect((await page.request.get("/api/responses/vo-101")).status()).toBe(200);
});

test("a Team Lead cannot read another brand's reply by URL or API", async ({ page }) => {
  await signIn(page, "Marta Vidal");
  expect((await page.goto("/responses/bx-202"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  expect((await page.request.get("/api/responses/bx-202")).status()).toBe(404);

  const all = await (await page.request.get("/api/responses")).json();
  expect(all.responses.some((r: { brandName: string }) => r.brandName === "Boxwell Packaging")).toBe(false);
});
