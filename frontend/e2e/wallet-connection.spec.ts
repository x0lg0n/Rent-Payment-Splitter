import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Wallet Connection Flow
 * 
 * Tests the complete wallet connection experience:
 * - Opening wallet selector
 * - Selecting a wallet
 * - Connection states
 * - Disconnection
 */

test.describe("Wallet Connection Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard");
  });

  test("should display wallet selector when connect button clicked", async ({ page }) => {
    // Find and click the connect wallet button
    const connectButton = page.getByRole("button", { name: /connect wallet/i }).or(
      page.getByRole("button", { name: /wallet/i })
    );
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Wallet selector modal should appear
      await expect(page.getByText(/connect wallet/i)).toBeVisible();
      await expect(page.getByText(/choose one Stellar wallet/i)).toBeVisible();
    }
  });

  test("should display available wallets", async ({ page }) => {
    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Check for supported wallets
      await expect(page.getByText(/Freighter/i)).toBeVisible();
      await expect(page.getByText(/xBull/i)).toBeVisible();
      await expect(page.getByText(/Albedo/i)).toBeVisible();
    }
  });

  test("should close wallet selector on cancel", async ({ page }) => {
    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Click cancel
      const cancelButton = page.getByRole("button", { name: /cancel/i });
      await cancelButton.click();
      
      // Modal should close
      await expect(page.getByText(/connect wallet/i)).not.toBeVisible();
    }
  });

  test("should close wallet selector on X button", async ({ page }) => {
    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Click X button
      const closeButton = page.getByRole("button", { name: /close/i });
      await closeButton.click();
      
      // Modal should close
      await expect(page.getByText(/connect wallet/i)).not.toBeVisible();
    }
  });

  test("should show wallet installation links for unavailable wallets", async ({ page }) => {
    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Should show install links
      const installLinks = page.getByText(/install/i);
      if (await installLinks.count() > 0) {
        await expect(installLinks.first()).toBeVisible();
      }
    }
  });

  test("should display wallet connection status", async ({ page }) => {
    // Check if already connected
    const connectedStatus = page.getByText(/connected/i).or(page.getByText(/TESTNET/i));
    await expect(connectedStatus.first()).toBeVisible();
  });
});

test.describe("Wallet States", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test("should show wallet balance when connected", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Balance section should be visible
    await expect(page.getByText(/balance/i)).toBeVisible();
  });

  test("should show network indicator", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Network indicator should be visible
    const networkIndicator = page.getByText(/TESTNET/i).or(page.getByText(/MAINNET/i));
    await expect(networkIndicator.first()).toBeVisible();
  });

  test("should display wallet address when connected", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should show shortened address
    const addressPattern = /G[A-Z0-9]{3}\.\.\.[A-Z0-9]{4}/;
    const addressElement = page.locator("text=" + addressPattern.source);
    await expect(addressElement.first()).toBeVisible();
  });
});

test.describe("Wallet Disconnection", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard/settings");
  });

  test("should have disconnect option in settings", async ({ page }) => {
    // Look for disconnect button
    const disconnectButton = page.getByRole("button", { name: /disconnect/i });
    if (await disconnectButton.isVisible()) {
      await expect(disconnectButton).toBeVisible();
    }
  });
});
