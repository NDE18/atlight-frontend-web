import { expect, test } from "@playwright/test";

test("une page privée sans session redirige vers la connexion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login\?next=%2F$/);
});

test.describe("langue du navigateur", () => {
  test.describe("française", () => {
    test.use({ locale: "fr-FR" });
    test("affiche la connexion en français", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "Content de vous revoir" })).toBeVisible();
    });
  });

  test.describe("anglaise", () => {
    test.use({ locale: "en-US" });
    test("affiche la connexion en anglais", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    });
  });
});

test("la sonde de santé répond sans session", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({ status: "ok" });
});

test("assetlinks.json est servi pour Android App Links", async ({ request }) => {
  const response = await request.get("/.well-known/assetlinks.json");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/json");
});
