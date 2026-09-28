import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, name: string) {
  await page.goto("/select-user");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("Team Lead reviews a pending reply and the Specialist reads the feedback", async ({ page }) => {
  await signIn(page, "Marta Vidal");
  await expect(page).toHaveURL(/\/responses$/);

  // Only Marta's brands are listed.
  const list = page.getByRole("list", { name: "Responses" });
  await expect(list.getByText("Can I ride in the rain?")).toBeVisible();
  await expect(list.getByText("Delivery date for PO 7781")).toHaveCount(0);

  await list.getByRole("link", { name: /Can I ride in the rain\?/ }).click();
  await expect(page.getByRole("heading", { name: "Can I ride in the rain?" })).toBeVisible();
  await expect(page.getByText("What good looks like for Voltra Scooters")).toBeVisible();

  // Server-side validation.
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Error: Choose a score from 1 to 5.")).toBeVisible();

  await page.getByLabel("4 · Good").check();
  await page.getByLabel("Too long for the brand").check();
  await page.getByLabel("Feedback for the Specialist").fill("Correct and safe. Lead with the IP rating in one line.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Saved. The Specialist can now see this review.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Update review" })).toBeVisible();

  await page.getByRole("button", { name: "Switch user" }).click();
  await signIn(page, "Dani Ortega");
  await expect(page).toHaveURL(/\/my-reviews$/);
  const card = page.getByRole("article", { name: "Can I ride in the rain?" });
  await expect(card.getByText("4 · Good")).toBeVisible();
  await expect(card.getByText("Correct and safe. Lead with the IP rating in one line.")).toBeVisible();
  await expect(card.getByText("Too long for the brand")).toBeVisible();
  await expect(card.getByText("Reviewed by Marta Vidal", { exact: false })).toBeVisible();
});

test("only the author can edit a review", async ({ page }) => {
  await signIn(page, "Nuria Costa");
  await page.goto("/responses/lu-301");
  await expect(page.getByText("Only Marta Vidal can edit this review.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Update review" })).toHaveCount(0);
});

test("filters narrow the response list", async ({ page }) => {
  await signIn(page, "Nuria Costa");
  await page.getByLabel("Brand", { exact: true }).selectOption({ label: "Boxwell Packaging" });
  await page.getByLabel("Status").selectOption("pending");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/brand=boxwell&status=pending/);
  await expect(page.getByRole("list", { name: "Responses" }).getByRole("link")).toHaveCount(2);
});
