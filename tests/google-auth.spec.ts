import { test, expect } from '@playwright/test';

test.describe('Google Authentication Tests', () => {
  test('should navigate to /auth and test Google OAuth flow', async ({ page }) => {
    // Step 1: Navigate to http://localhost:3002
    console.log('Step 1: Navigating to http://localhost:3002');
    await page.goto('/');
    
    // Wait for initial loading to complete
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/initial-page.png',
      fullPage: true 
    });
    
    // Check current URL after loading
    const currentUrl = page.url();
    console.log(`Current URL after initial load: ${currentUrl}`);
    
    // Step 2: Check if we're on /auth or if we need to navigate there
    if (currentUrl.includes('/auth')) {
      console.log('✓ Already on /auth page');
    } else {
      console.log('Not on /auth page, checking if redirect happens automatically...');
      
      // Wait a bit more for potential redirect
      try {
        await page.waitForURL('/auth', { timeout: 10000 });
        console.log('✓ Successfully redirected to /auth page');
      } catch (e) {
        console.log('No automatic redirect to /auth detected');
        console.log('Manually navigating to /auth...');
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Step 3: Take a screenshot of the auth page
    console.log('Step 3: Taking screenshot of auth page');
    await page.screenshot({ 
      path: 'test-results/auth-page-screenshot.png',
      fullPage: true 
    });
    console.log('✓ Auth page screenshot saved');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Step 4: Look for the "Continue with Google" button
    console.log('Step 4: Looking for "Continue with Google" button');
    
    // Try different possible selectors for the Google auth button
    const googleButtonSelectors = [
      'text="Continue with Google"',
      'text="Sign in with Google"', 
      'text="Login with Google"',
      '[data-testid="google-signin"]',
      'button:has-text("Google")',
      '.google-signin-btn',
      '[aria-label*="Google"]'
    ];
    
    let googleButton;
    let foundButtonText = '';
    
    for (const selector of googleButtonSelectors) {
      try {
        googleButton = page.locator(selector).first();
        if (await googleButton.isVisible({ timeout: 2000 })) {
          foundButtonText = await googleButton.textContent() || '';
          console.log(`✓ Found Google button with text: "${foundButtonText}"`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!googleButton || !(await googleButton.isVisible())) {
      console.log('❌ Could not find Google authentication button');
      
      // Take screenshot to see what's actually on the page
      await page.screenshot({ 
        path: 'test-results/auth-page-no-google-button.png',
        fullPage: true 
      });
      
      // Log all buttons on the page for debugging
      const allButtons = await page.locator('button').all();
      console.log('All buttons found on the page:');
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`  Button ${i + 1}: "${buttonText}"`);
      }
      
      throw new Error('Google authentication button not found on the page');
    }
    
    // Step 5: Click the Google button and monitor for OAuth flow
    console.log('Step 5: Clicking Google button to test OAuth flow');
    
    // Set up listeners for new pages/popups (OAuth flow typically opens in popup)
    const popupPromise = page.waitForEvent('popup', { timeout: 10000 });
    
    try {
      // Click the Google button
      await googleButton.click();
      console.log('✓ Clicked Google authentication button');
      
      // Wait for popup or navigation
      try {
        const popup = await popupPromise;
        console.log('✓ OAuth popup detected');
        console.log(`Popup URL: ${popup.url()}`);
        
        // Take screenshot of the popup
        await popup.screenshot({ 
          path: 'test-results/google-oauth-popup.png',
          fullPage: true 
        });
        console.log('✓ OAuth popup screenshot saved');
        
        // Check if this is actually Google's OAuth page
        if (popup.url().includes('accounts.google.com')) {
          console.log('✓ Successfully redirected to Google OAuth (accounts.google.com)');
        } else {
          console.log(`⚠️  Popup opened but not to Google OAuth. URL: ${popup.url()}`);
        }
        
        // Close popup to clean up
        await popup.close();
        
      } catch (popupError) {
        console.log('No popup detected, checking for same-page navigation...');
        
        // Check if navigation happened in the same page
        await page.waitForTimeout(3000); // Wait a bit for potential navigation
        
        const currentUrl = page.url();
        console.log(`Current URL after click: ${currentUrl}`);
        
        if (currentUrl.includes('accounts.google.com')) {
          console.log('✓ Successfully navigated to Google OAuth');
          await page.screenshot({ 
            path: 'test-results/google-oauth-page.png',
            fullPage: true 
          });
        } else if (currentUrl === 'http://localhost:3002/auth') {
          console.log('⚠️  Still on auth page - OAuth may not have triggered');
          await page.screenshot({ 
            path: 'test-results/auth-page-after-click.png',
            fullPage: true 
          });
        } else {
          console.log(`⚠️  Unexpected navigation to: ${currentUrl}`);
        }
      }
      
    } catch (clickError) {
      console.log(`❌ Error clicking Google button: ${clickError.message}`);
      await page.screenshot({ 
        path: 'test-results/error-clicking-google-button.png',
        fullPage: true 
      });
      throw clickError;
    }
    
    // Step 6: Check for any errors on the page
    console.log('Step 6: Checking for JavaScript errors');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit more to catch any async errors
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors detected:');
      errors.forEach((error, index) => {
        console.log(`  Error ${index + 1}: ${error}`);
      });
    } else {
      console.log('✓ No JavaScript errors detected');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/final-state.png',
      fullPage: true 
    });
    
    console.log('✓ Google authentication test completed');
  });
  
  test('should verify Firebase configuration', async ({ page }) => {
    console.log('Verifying Firebase configuration...');
    
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Check if Firebase is properly loaded
    const firebaseConfig = await page.evaluate(() => {
      // Check if Firebase is available globally
      if (typeof window !== 'undefined') {
        // Try to access Firebase configuration
        try {
          return {
            hasFirebase: typeof (window as any).firebase !== 'undefined',
            hasFirebaseAuth: typeof (window as any).firebase?.auth !== 'undefined',
            projectId: (window as any).firebase?.app()?.options?.projectId || 'not found'
          };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { error: 'Window not available' };
    });
    
    console.log('Firebase configuration check:', firebaseConfig);
    
    // Take screenshot for reference
    await page.screenshot({ 
      path: 'test-results/firebase-config-check.png',
      fullPage: true 
    });
  });
});