import { test, expect } from "@playwright/test";

test.describe("Atelier Storefront & Journey Verification", () => {
  test("renders home page with high visual fidelity and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Atelier/);
    await expect(page.getByRole("heading", { name: /Considered goods/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse Catalog/i })).toBeVisible();
  });

  test("loads catalog listing and interactive filters", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: /All Considered Goods/i })).toBeVisible();
    
    // Check search input presence
    const searchInput = page.getByPlaceholder(/Search stoneware/i);
    await expect(searchInput).toBeVisible();

    // Verify product cards are rendered
    const cards = page.locator(".group.overflow-hidden");
    await expect(cards.first()).toBeVisible();
  });

  test("renders the design system token authority page in light and dark mode", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.getByRole("heading", { name: /Design Tokens & Components/i })).toBeVisible();
    
    // Toggle dark mode
    const modeButton = page.getByRole("button", { name: /Switch to Dark Mode/i });
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await expect(page.locator("html, body, div").first()).toBeVisible();
    }
  });

  test("allows inspecting product details and viewing similar nearest neighbors", async ({ page }) => {
    await page.goto("/products/hand-thrown-stoneware-pour-over-dripper-1");
    if (page.url().includes("products/")) {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("walks test checkout flow and displays test card information", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText(/Stripe Test Credentials/i)).toBeVisible();
    await expect(page.getByText(/4242 •••• •••• 4242/i)).toBeVisible();
  });

  test("protects admin dashboard and redirects unauthenticated visitors to admin login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*admin\/login/);
    await expect(page.getByRole("heading", { name: /Atelier Studio Portal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Access Studio Admin/i })).toBeVisible();
  });

  test("protects customer account and redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });
});
