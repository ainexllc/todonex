import { test, expect } from '@playwright/test';

test.describe('NextTaskPro Styling Analysis', () => {
  test('capture Notes and Subscriptions screenshots with mock authentication', async ({ page }) => {
    // Mock Firebase authentication by injecting a user into localStorage
    await page.addInitScript(() => {
      // Mock Firebase auth state
      window.localStorage.setItem('firebase:authUser:' + 'your-api-key', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }));
    });

    // Navigate and wait for app to initialize
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // If still redirected to auth, try direct navigation to pages
    if (page.url().includes('/auth')) {
      console.log('Auth redirect detected, trying direct page access...');
    }
    
    // Take screenshots of Notes page
    console.log('Navigating to Notes page...');
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait for any dynamic content
    
    // Take light mode screenshot
    console.log('Taking Notes light mode screenshot...');
    await page.screenshot({ 
      path: 'notes-light-current.png',
      fullPage: true
    });
    
    // Switch to dark mode using system preference (more reliable)
    console.log('Switching to dark mode...');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(2000); // Wait for theme transition
    
    console.log('Taking Notes dark mode screenshot...');
    await page.screenshot({ 
      path: 'notes-dark-current.png',
      fullPage: true
    });
    
    // Switch back to light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(1000);
    
    // Take screenshots of Subscriptions page
    console.log('Navigating to Subscriptions page...');
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait for any dynamic content
    
    // Take light mode screenshot
    console.log('Taking Subscriptions light mode screenshot...');
    await page.screenshot({ 
      path: 'subscriptions-light-current.png',
      fullPage: true
    });
    
    // Switch to dark mode
    console.log('Switching to dark mode for Subscriptions...');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(2000); // Wait for theme transition
    
    console.log('Taking Subscriptions dark mode screenshot...');
    await page.screenshot({ 
      path: 'subscriptions-dark-current.png',
      fullPage: true
    });
    
    console.log('All screenshots completed!');
  });
});