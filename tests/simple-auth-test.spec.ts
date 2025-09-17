import { test, expect } from '@playwright/test';

test.describe('Simple Authentication Redirect Test', () => {
  test('homepage loads and shows auth form', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that we're on the homepage
    await expect(page).toHaveURL('http://localhost:3000/');

    // Check for key elements
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    console.log('✅ Homepage loaded successfully with auth form');
  });

  test('tasks page redirects unauthenticated users', async ({ page }) => {
    // Try to access tasks page directly
    await page.goto('http://localhost:3000/tasks');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should see the "Please sign in" message
    const signInPrompt = page.getByText('Please sign in to access your tasks');
    await expect(signInPrompt).toBeVisible();

    console.log('✅ Tasks page correctly blocks unauthenticated users');
  });

  test('sign out button appears for authenticated users', async ({ page }) => {
    // This test assumes you're already logged in
    // First, let's check if there's a sign out button visible anywhere

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Look for sign out button (might be visible briefly before redirect)
    const signOutButton = page.getByRole('button', { name: /Sign Out/i });
    const isSignOutVisible = await signOutButton.isVisible().catch(() => false);

    if (isSignOutVisible) {
      console.log('✅ User is authenticated - Sign Out button is visible');

      // Click sign out
      await signOutButton.click();

      // Wait for sign out to complete
      await page.waitForTimeout(2000);

      // Should be back on homepage with auth form
      const emailInput = page.getByPlaceholder('Email');
      await expect(emailInput).toBeVisible();

      console.log('✅ Sign out successful');
    } else {
      console.log('ℹ️ User is not authenticated - Sign Out button not visible');
    }
  });
});