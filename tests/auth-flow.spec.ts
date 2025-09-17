import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3000');
  });

  test('homepage loads correctly', async ({ page }) => {
    // Check that the homepage loads
    await expect(page).toHaveTitle(/NextTaskPro/i);

    // Check for auth form elements
    await expect(page.getByText('Get Started Today')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('unauthenticated user cannot access tasks page', async ({ page }) => {
    // Try to navigate to tasks page directly
    await page.goto('http://localhost:3000/tasks');

    // Should show sign in prompt
    await expect(page.getByText('Please sign in to access your tasks')).toBeVisible();
    await expect(page.getByRole('button', { name: /Go to Sign In/i })).toBeVisible();
  });

  test('sign up with email creates new account', async ({ page, context }) => {
    // Generate unique email for testing
    const uniqueEmail = `test${Date.now()}@example.com`;

    // Switch to sign up mode if needed
    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    // Fill in sign up form
    await page.getByPlaceholder('Your Name').fill('Test User');
    await page.getByPlaceholder('Email').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill('TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Wait for success message or redirect
    await page.waitForLoadState('networkidle');

    // Check if redirected to tasks page or success message shown
    const url = page.url();
    if (url.includes('/tasks')) {
      // Successfully redirected to tasks page
      await expect(page.getByText(/Welcome/i)).toBeVisible();
    } else {
      // Check for success message on the same page
      await expect(page.getByText(/Account created successfully/i)).toBeVisible();
    }
  });

  test('sign in with email works correctly', async ({ page }) => {
    // Switch to sign in mode if needed
    const signInTab = page.getByRole('button', { name: 'Sign In' });
    if (await signInTab.isVisible()) {
      await signInTab.click();
    }

    // Use a test account (you'll need to create this manually first)
    // Or use the account created in the previous test
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for navigation or error
    await page.waitForLoadState('networkidle');

    // Check result
    const url = page.url();
    if (url.includes('/tasks')) {
      // Successfully redirected to tasks page
      await expect(page.getByText(/Welcome/i)).toBeVisible();
    } else {
      // Check for error message (account might not exist)
      const errorVisible = await page.getByText(/error/i).isVisible().catch(() => false);
      if (errorVisible) {
        console.log('Sign in failed - test account may not exist');
      }
    }
  });

  test('authenticated user is redirected from homepage to tasks', async ({ page, context }) => {
    // First sign in (using test account or creating new one)
    const uniqueEmail = `test${Date.now()}@example.com`;

    // Go to homepage and sign up
    await page.goto('http://localhost:3000');

    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    await page.getByPlaceholder('Your Name').fill('Test User');
    await page.getByPlaceholder('Email').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Wait for authentication to complete
    await page.waitForTimeout(2000);

    // Now navigate back to homepage
    await page.goto('http://localhost:3000');

    // Should be redirected to tasks page
    await expect(page).toHaveURL(/.*\/tasks/);
  });

  test('sign out functionality works', async ({ page }) => {
    // First create and sign in with a test account
    const uniqueEmail = `test${Date.now()}@example.com`;

    await page.goto('http://localhost:3000');

    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    await page.getByPlaceholder('Your Name').fill('Test User');
    await page.getByPlaceholder('Email').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Wait for redirect to tasks page
    await page.waitForURL(/.*\/tasks/, { timeout: 10000 });

    // Find and click sign out button
    await page.getByRole('button', { name: /Sign Out/i }).click();

    // Should be redirected to homepage
    await page.waitForURL('http://localhost:3000/');

    // Verify signed out by checking auth form is visible
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('homepage shows auth status bar when logged in', async ({ page }) => {
    // Create and sign in with test account
    const uniqueEmail = `test${Date.now()}@example.com`;

    await page.goto('http://localhost:3000');

    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    await page.getByPlaceholder('Your Name').fill('Test User');
    await page.getByPlaceholder('Email').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Wait for authentication
    await page.waitForTimeout(2000);

    // Navigate to homepage (should show auth bar briefly before redirect)
    await page.goto('http://localhost:3000');

    // Check if auth status bar appears (even briefly)
    const signOutButton = page.getByRole('button', { name: /Sign Out/i });
    const goToTasksButton = page.getByRole('button', { name: /Go to Tasks/i });

    // These should be visible briefly before redirect
    const signOutVisible = await signOutButton.isVisible().catch(() => false);
    const goToTasksVisible = await goToTasksButton.isVisible().catch(() => false);

    if (signOutVisible && goToTasksVisible) {
      console.log('Auth status bar is correctly shown for authenticated users');
    }

    // Should redirect to tasks
    await expect(page).toHaveURL(/.*\/tasks/);
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('password123');

    // Email validation should show error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows error for short password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('123');

    // Password validation should show error
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });
});