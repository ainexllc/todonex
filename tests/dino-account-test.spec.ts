import { test, expect } from '@playwright/test';

test.describe('Dino Account Creation and Login', () => {
  const testUser = {
    fullName: 'Dino Horn',
    email: 'dinohorn9@gmail.com',
    password: 'dino'
  };

  test('create account and login flow', async ({ page }) => {
    console.log('Starting account creation test for:', testUser.email);

    // Step 1: Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Step 2: Switch to Sign Up mode
    const signUpButton = page.getByRole('button', { name: 'Sign Up' });
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
      console.log('✅ Switched to Sign Up mode');
    }

    // Step 3: Fill in registration form
    console.log('Filling registration form...');

    // Find and fill the name field
    const nameField = page.getByPlaceholder('Your Name');
    await nameField.fill(testUser.fullName);

    // Find and fill the email field
    const emailField = page.getByPlaceholder('Email');
    await emailField.fill(testUser.email);

    // Find and fill the password field
    const passwordField = page.getByPlaceholder('Password');
    await passwordField.fill(testUser.password);

    console.log('✅ Form filled with user details');

    // Step 4: Submit registration
    const createAccountButton = page.getByRole('button', { name: /Create Account/i });
    await createAccountButton.click();
    console.log('⏳ Creating account...');

    // Step 5: Wait for success or error
    await page.waitForTimeout(3000); // Give time for Firebase to process

    // Check for possible outcomes
    const currentUrl = page.url();

    if (currentUrl.includes('/tasks')) {
      console.log('✅ Account created successfully - redirected to tasks dashboard');

      // Verify dashboard elements
      await expect(page.getByText(/Welcome/i)).toBeVisible();
      console.log('✅ Dashboard loaded successfully');

      // Check for user name in dashboard
      const userDisplay = page.getByText('Dino Horn');
      if (await userDisplay.isVisible()) {
        console.log('✅ User name displayed in dashboard');
      }

    } else {
      // Check if account already exists (need to sign in instead)
      const errorMessage = page.getByText(/already in use|already exists/i);

      if (await errorMessage.isVisible().catch(() => false)) {
        console.log('⚠️ Account already exists, attempting to sign in...');

        // Switch to Sign In mode
        const signInButton = page.getByRole('button', { name: 'Sign In' });
        if (await signInButton.isVisible()) {
          await signInButton.click();
        }

        // Sign in with existing account
        await emailField.fill(testUser.email);
        await passwordField.fill(testUser.password);

        const signInSubmit = page.getByRole('button', { name: /Sign In/i });
        await signInSubmit.click();
        console.log('⏳ Signing in...');

        // Wait for redirect
        await page.waitForURL(/.*\/tasks/, { timeout: 10000 });
        console.log('✅ Signed in successfully - redirected to tasks dashboard');

        // Verify dashboard
        await expect(page.getByText(/Welcome/i)).toBeVisible();
        console.log('✅ Dashboard loaded after sign in');
      } else {
        // Check for success message on same page
        const successMessage = page.getByText(/Account created successfully|Welcome/i);
        if (await successMessage.isVisible().catch(() => false)) {
          console.log('✅ Account created - waiting for redirect...');
          await page.waitForURL(/.*\/tasks/, { timeout: 10000 });
          console.log('✅ Redirected to tasks dashboard');
        }
      }
    }

    // Step 6: Test Sign Out functionality
    console.log('Testing sign out functionality...');

    // Look for sign out button
    const signOutButton = page.getByRole('button', { name: /Sign Out/i });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      console.log('⏳ Signing out...');

      // Wait for redirect to homepage
      await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
      console.log('✅ Successfully signed out and returned to homepage');
    }

    // Step 7: Test Sign In with created account
    console.log('Testing sign in with created account...');

    // Click Sign In tab
    const signInTab = page.getByRole('button', { name: 'Sign In' });
    if (await signInTab.isVisible()) {
      await signInTab.click();
    }

    // Fill in credentials
    await page.getByPlaceholder('Email').fill(testUser.email);
    await page.getByPlaceholder('Password').fill(testUser.password);

    // Submit sign in
    const finalSignIn = page.getByRole('button', { name: /Sign In/i });
    await finalSignIn.click();
    console.log('⏳ Signing in again...');

    // Wait for redirect to tasks
    await page.waitForURL(/.*\/tasks/, { timeout: 10000 });
    console.log('✅ Successfully signed in and reached dashboard');

    // Final verification
    await expect(page).toHaveURL(/.*\/tasks/);
    await expect(page.getByText(/Welcome/i)).toBeVisible();

    console.log('✨ Test completed successfully!');
    console.log('Account details:');
    console.log('  Email:', testUser.email);
    console.log('  Name:', testUser.fullName);
    console.log('  Dashboard: Accessible ✅');
  });

  test('verify dashboard features after login', async ({ page }) => {
    console.log('Testing dashboard features for:', testUser.email);

    // Sign in directly
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Switch to Sign In mode
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    if (await signInButton.isVisible()) {
      await signInButton.click();
    }

    // Fill credentials
    await page.getByPlaceholder('Email').fill(testUser.email);
    await page.getByPlaceholder('Password').fill(testUser.password);

    // Submit
    const signInSubmit = page.getByRole('button', { name: /Sign In/i });
    await signInSubmit.click();

    // Wait for dashboard
    await page.waitForURL(/.*\/tasks/, { timeout: 10000 });

    // Check dashboard elements
    console.log('Checking dashboard elements...');

    // Check for welcome message
    const welcomeText = page.getByText(/Welcome.*Dino/i);
    if (await welcomeText.isVisible().catch(() => false)) {
      console.log('✅ Personalized welcome message displayed');
    }

    // Check for stats cards
    const completedToday = page.getByText('Completed Today');
    const pendingTasks = page.getByText('Pending Tasks');
    const overdue = page.getByText('Overdue');

    if (await completedToday.isVisible()) {
      console.log('✅ Stats cards are displayed');
    }

    // Check for AI task creation section
    const aiSection = page.getByText('AI Task Creation');
    if (await aiSection.isVisible()) {
      console.log('✅ AI Task Creation section available');
    }

    // Check for user profile in header
    const userEmail = page.getByText(testUser.email);
    if (await userEmail.isVisible().catch(() => false)) {
      console.log('✅ User email displayed in header');
    }

    console.log('✨ Dashboard verification completed!');
  });
});