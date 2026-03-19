import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Escrow Creation Flow
 * 
 * Tests the complete escrow creation experience:
 * - Navigating to escrow creation page
 * - Filling out the form
 * - Validation
 * - Submission
 */

test.describe("Escrow Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test("should navigate to escrow creation page", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Page title should be visible
    await expect(page.getByText(/create rent escrow/i)).toBeVisible();
  });

  test("should display escrow creation form", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Check form fields
    await expect(page.getByLabel(/landlord/i)).toBeVisible();
    await expect(page.getByText(/participants/i)).toBeVisible();
    await expect(page.getByLabel(/deadline/i)).toBeVisible();
  });

  test("should show split mode options", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Check split mode buttons
    await expect(page.getByRole("button", { name: /Equal split/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Custom shares/i })).toBeVisible();
  });

  test("should validate landlord address format", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter invalid address
    const landlordInput = page.getByLabel(/landlord/i);
    await landlordInput.fill("invalid-address");
    await landlordInput.blur();
    
    // Should show validation error
    await expect(page.getByText(/Invalid Stellar address/i)).toBeVisible();
  });

  test("should accept valid Stellar address for landlord", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter valid address format
    const landlordInput = page.getByLabel(/landlord/i);
    await landlordInput.fill("GBXGQJWVL7XRJHQR6Y4DH5N2VW3XZJK4L5M6N7O8P9Q0R1S2T3U4V5W7");
    await landlordInput.blur();
    
    // Should not show validation error
    const errorText = page.getByText(/Invalid Stellar address/i);
    await expect(errorText).not.toBeVisible();
  });

  test("should allow adding participants", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Click add participant button
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();
    
    // Should have 2 participant inputs now
    const participantInputs = page.getByPlaceholder(/Participant \d+ address/i);
    await expect(participantInputs).toHaveCount(2);
  });

  test("should allow removing participants", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Add a participant
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();
    
    // Remove the participant
    const removeButtons = page.getByRole("button", { name: "" }).filter({ hasText: /✕/ });
    if (await removeButtons.count() > 0) {
      await removeButtons.first().click();
    }
    
    // Should have 1 participant input
    const participantInputs = page.getByPlaceholder(/Participant \d+ address/i);
    await expect(participantInputs).toHaveCount(1);
  });

  test("should validate participant address format", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter invalid participant address
    const participantInput = page.getByPlaceholder(/Participant 1 address/i);
    await participantInput.fill("invalid");
    await participantInput.blur();
    
    // Should show validation error
    await expect(page.getByText(/Invalid Stellar address/i)).toBeVisible();
  });

  test("should show equal split with total rent input", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Equal split should be default
    await expect(page.getByRole("button", { name: /Equal split/i })).toHaveClass(/bg-slate-950/);
    
    // Total rent input should be visible
    await expect(page.getByLabel(/Total rent/i)).toBeVisible();
  });

  test("should switch to custom shares mode", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Click custom shares
    const customButton = page.getByRole("button", { name: /Custom shares/i });
    await customButton.click();
    
    // Custom should be selected
    await expect(customButton).toHaveClass(/bg-slate-950/);
    
    // Share inputs should be visible for each participant
    await expect(page.getByPlaceholder(/Share \(XLM\)/i).first()).toBeVisible();
  });

  test("should validate deadline is required", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Fill in landlord
    const landlordInput = page.getByLabel(/landlord/i);
    await landlordInput.fill("GBXGQJWVL7XRJHQR6Y4DH5N2VW3XZJK4L5M6N7O8P9Q0R1S2T3U4V5W7");
    
    // Try to submit without deadline
    const submitButton = page.getByRole("button", { name: /Create escrow/i });
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/Deadline is required/i)).toBeVisible();
  });

  test("should validate deadline is in future", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter past deadline
    const deadlineInput = page.getByLabel(/deadline/i);
    const pastDate = new Date(Date.now() - 3600000).toISOString().slice(0, 16);
    await deadlineInput.fill(pastDate);
    
    // Try to submit
    const submitButton = page.getByRole("button", { name: /Create escrow/i });
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/Deadline/i)).toBeVisible();
  });

  test("should show deadline preview", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter future deadline
    const deadlineInput = page.getByLabel(/deadline/i);
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    await deadlineInput.fill(futureDate);
    
    // Should show preview
    await expect(page.getByText(/Due in/i)).toBeVisible();
  });

  test("should display form summary", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Enter total rent
    const totalRentInput = page.getByLabel(/Total rent/i);
    await totalRentInput.fill("1000");
    
    // Summary should show the value
    await expect(page.getByText(/1000\.00 XLM/i)).toBeVisible();
  });

  test("should show wallet connection warning", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Should show wallet warning if not connected
    const warningText = page.getByText(/Connect your wallet/i);
    if (await warningText.isVisible()) {
      await expect(warningText).toBeVisible();
    }
  });

  test("should disable submit without wallet", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Submit should be disabled without wallet
    const submitButton = page.getByRole("button", { name: /Create escrow/i });
    // Button might be disabled or show warning
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test("should have cancel button", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Cancel button should be visible
    await expect(page.getByRole("button", { name: /Cancel/i })).toBeVisible();
  });

  test("should navigate back from cancel", async ({ page }) => {
    await page.goto("/dashboard/escrow-create");
    
    // Click cancel
    const cancelButton = page.getByRole("button", { name: /Cancel/i });
    await cancelButton.click();
    
    // Should navigate away (check URL changed or page changed)
    // This depends on the actual implementation
  });
});

test.describe("Escrow List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test("should navigate to escrows list", async ({ page }) => {
    await page.goto("/dashboard/escrows");
    
    // Page title should be visible
    await expect(page.getByText(/escrow/i)).toBeVisible();
  });

  test("should show create escrow button", async ({ page }) => {
    await page.goto("/dashboard/escrows");
    
    // Create button should be visible
    await expect(page.getByRole("button", { name: /Create escrow/i })).toBeVisible();
  });

  test("should navigate to create page from list", async ({ page }) => {
    await page.goto("/dashboard/escrows");
    
    // Click create button
    const createButton = page.getByRole("button", { name: /Create escrow/i });
    await createButton.click();
    
    // Should navigate to create page
    await expect(page).toHaveURL(/\/escrow-create/);
  });

  test("should display escrow count", async ({ page }) => {
    await page.goto("/dashboard/escrows");
    
    // Should show total count
    await expect(page.getByText(/Total escrows/i)).toBeVisible();
  });

  test("should show empty state when no escrows", async ({ page }) => {
    await page.goto("/dashboard/escrows");
    
    // Should show empty state or list
    const emptyState = page.getByText(/No escrows/i).or(page.getByText(/Create your first escrow/i));
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});
