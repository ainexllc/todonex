import { test, expect } from '@playwright/test';

test.describe('Dino Account Test - Simple', () => {
  test('create or login to Dino account', async ({ page }) => {
    // Test credentials
    const email = 'dinohorn9@gmail.com';
    const password = 'dino';
    const fullName = 'Dino Horn';

    console.log('🚀 Starting test for:', email);

    // Go to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded');

    // Take screenshot of initial page
    await page.screenshot({ path: 'test-results/1-homepage.png' });

    // Try to sign up first (if account doesn't exist)
    try {
      // Click Sign Up tab
      await page.getByRole('button', { name: 'Sign Up' }).click();
      console.log('📝 Attempting to create account...');

      // Fill sign up form
      await page.getByPlaceholder('Your Name').fill(fullName);
      await page.getByPlaceholder('Email').fill(email);
      await page.getByPlaceholder('Password').fill(password);

      // Take screenshot before submitting
      await page.screenshot({ path: 'test-results/2-signup-form.png' });

      // Click Create Account
      await page.getByRole('button', { name: /Create Account/i }).click();

      // Wait a bit for response
      await page.waitForTimeout(5000);

      // Take screenshot after submission
      await page.screenshot({ path: 'test-results/3-after-signup.png' });

      // Check where we are
      const url = page.url();
      console.log('Current URL:', url);

      if (url.includes('/tasks')) {
        console.log('✅ SUCCESS: Account created and redirected to dashboard!');
        await page.screenshot({ path: 'test-results/4-dashboard.png' });
        return; // Test successful
      }

      // Check for error (account exists)
      const errorText = await page.getByText(/already in use|already exists/i).isVisible().catch(() => false);

      if (errorText) {
        console.log('⚠️ Account already exists, switching to sign in...');
      }

    } catch (error) {
      console.log('Sign up attempt failed, trying sign in...');
    }

    // Try to sign in
    console.log('🔑 Attempting to sign in...');

    // Go back to homepage to reset
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Click Sign In tab
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Fill sign in form
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);

    // Take screenshot before sign in
    await page.screenshot({ path: 'test-results/5-signin-form.png' });

    // Click Sign In button
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for navigation
    await page.waitForTimeout(5000);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/6-after-signin.png' });

    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    if (finalUrl.includes('/tasks')) {
      console.log('✅ SUCCESS: Signed in and reached dashboard!');

      // Verify some dashboard elements
      const welcomeVisible = await page.getByText(/Welcome/i).isVisible().catch(() => false);
      if (welcomeVisible) {
        console.log('✅ Dashboard welcome message visible');
      }

      // Look for user info
      const userInfoVisible = await page.getByText(email).isVisible().catch(() => false);
      if (userInfoVisible) {
        console.log('✅ User email visible in dashboard');
      }

    } else {
      console.log('❌ Failed to reach dashboard');
      console.log('Still on:', finalUrl);
    }
  });
});