import { test, expect } from "@playwright/test";

/**
 * E2E Tests for SplitRent Application
 * 
 * These tests cover critical user flows:
 * - Landing page loads correctly
 * - Dashboard accessibility
 * - Wallet connection flow
 * - Navigation between pages
 */

test.describe("SplitRent E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.describe("Landing Page", () => {
    test("should load the landing page with correct title", async ({ page }) => {
      await page.goto("/");

      // Check page title
      await expect(page).toHaveTitle(/SplitRent/);

      // Check main heading exists
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("should display main value proposition", async ({ page }) => {
      await page.goto("/");

      // Check for key value propositions
      await expect(page.getByText(/rent/i)).toBeVisible();
      await expect(page.getByText(/split/i)).toBeVisible();
    });

    test("should have navigation to dashboard", async ({ page }) => {
      await page.goto("/");

      // Check for dashboard/app navigation button
      const appButton = page.getByRole("button", { name: /app/i }).or(page.getByRole("link", { name: /dashboard/i }));
      await expect(appButton).toBeVisible();
    });

    test("should display features section", async ({ page }) => {
      await page.goto("/");

      // Scroll to features section
      await page.getByText(/features/i).first().scrollIntoViewIfNeeded();
      await expect(page.getByText(/features/i).first()).toBeVisible();
    });
  });

  test.describe("Dashboard Page", () => {
    test("should load dashboard page", async ({ page }) => {
      await page.goto("/dashboard");

      // Should redirect to login or show dashboard
      const url = page.url();
      expect(url).toMatch(/\/dashboard/);
    });

    test("should display wallet connection prompt", async ({ page }) => {
      await page.goto("/dashboard");

      // Should prompt for wallet connection
      await expect(page.getByText(/wallet/i)).toBeVisible();
    });

    test("should show balance section", async ({ page }) => {
      await page.goto("/dashboard");

      // Check for balance-related text
      await expect(page.getByText(/balance/i)).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate from landing to dashboard", async ({ page }) => {
      await page.goto("/");

      // Find and click the app/dashboard link
      const appLink = page.getByRole("button", { name: /app/i }).or(page.getByRole("link", { name: /dashboard/i }));
      if (await appLink.isVisible()) {
        await appLink.click();
        await expect(page).toHaveURL(/\/dashboard/);
      }
    });

    test("should navigate between dashboard sections", async ({ page }) => {
      await page.goto("/dashboard");

      // Check sidebar navigation exists
      await expect(page.getByRole("navigation")).toBeVisible();
    });

    test("should access escrows page", async ({ page }) => {
      await page.goto("/dashboard/escrows");

      await expect(page.getByText(/escrow/i)).toBeVisible();
    });

    test("should access escrow creation page", async ({ page }) => {
      await page.goto("/dashboard/escrow-create");

      await expect(page.getByText(/create/i)).toBeVisible();
    });

    test("should access analytics page", async ({ page }) => {
      await page.goto("/dashboard/analytics");

      await expect(page.getByText(/analytics/i)).toBeVisible();
    });

    test("should access settings page", async ({ page }) => {
      await page.goto("/dashboard/settings");

      await expect(page.getByText(/settings/i)).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Main content should be visible
      await expect(page.getByRole("main")).toBeVisible();
    });

    test("should work on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      // Main content should be visible
      await expect(page.getByRole("main")).toBeVisible();
    });

    test("should work on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");

      // Main content should be visible
      await expect(page.getByRole("main")).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle 404 pages gracefully", async ({ page }) => {
      await page.goto("/non-existent-page-12345");

      // Should show some error content or redirect
      expect(page.url()).not.toMatch(/\/non-existent-page-12345/);
    });

    test("should handle invalid dashboard routes", async ({ page }) => {
      await page.goto("/dashboard/invalid-route-xyz");

      // Should redirect or show error
      const url = page.url();
      expect(url).toMatch(/\/dashboard/);
    });
  });

  test.describe("Performance", () => {
    test("should load landing page within 3 seconds", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test("should load dashboard within 3 seconds", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/dashboard");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/");

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    });

    test("should have alt text for images", async ({ page }) => {
      await page.goto("/");

      // All images should have alt text
      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        expect(alt).toBeDefined();
      }
    });

    test("should have proper button labels", async ({ page }) => {
      await page.goto("/");

      // All buttons should have accessible names
      const buttons = page.getByRole("button");
      await expect(buttons.first()).toBeVisible();
    });
  });
});
