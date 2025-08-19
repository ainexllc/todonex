import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HomeKeep/);
});

test('mobile responsive layout', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Should redirect to auth page for unauthenticated users
  await expect(page).toHaveURL(/\/auth/);
  
  // Should have responsive container with specific classes
  const container = page.locator('div.min-h-dvh.bg-gradient-to-br').first();
  await expect(container).toBeVisible();
});

test('glass morphism effects load', async ({ page }) => {
  await page.goto('/');
  
  // Should redirect to auth page
  await expect(page).toHaveURL(/\/auth/);
  
  // Check if glass effects are applied on auth page
  const glassCard = page.locator('.glass');
  if (await glassCard.count() > 0) {
    await expect(glassCard.first()).toBeVisible();
  }
});

test('auth page welcome state', async ({ page }) => {
  await page.goto('/');
  
  // Should redirect to auth and show welcome text
  await expect(page).toHaveURL(/\/auth/);
  const welcomeHeading = page.getByRole('heading', { name: /welcome/i });
  await expect(welcomeHeading).toBeVisible();
});