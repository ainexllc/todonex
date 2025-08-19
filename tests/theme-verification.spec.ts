import { test, expect } from '@playwright/test';

test.describe('HabitTracker Theme Verification - Fixed Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to authenticate
    const currentUrl = page.url();
    if (currentUrl.includes('/auth') || !currentUrl.includes('localhost:3002')) {
      // If on auth page or redirected, try to sign in
      console.log('Authentication required, attempting to sign in...');
      
      // Wait for auth form to be visible
      await page.waitForSelector('form', { timeout: 10000 });
      
      // Look for email input and fill it
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
      }
      
      // Look for password input and fill it
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('password123');
      }
      
      // Look for submit button and click it
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/localhost:3002/**', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }
    
    // Ensure we're on the dashboard
    if (!page.url().includes('localhost:3002') || page.url().includes('/auth')) {
      await page.goto('http://localhost:3002');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Notes page - Theme verification with screenshots', async ({ page }) => {
    console.log('Testing Notes page theme switching...');
    
    // Navigate to Notes page
    await page.goto('http://localhost:3002/notes');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load (not just "Loading...")
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...') || 
            document.querySelectorAll('[data-testid], .note, .notes').length > 0,
      { timeout: 10000 }
    );
    
    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000);
    
    // Test Light Mode
    console.log('Testing Notes page in light mode...');
    
    // Ensure we're in light mode - look for theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      // Check if we're in dark mode (look for dark class on html or body)
      const isDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') || 
               document.body.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });
      
      if (isDarkMode) {
        await themeToggle.click();
        await page.waitForTimeout(1000); // Wait for theme transition
      }
    }
    
    // Capture light mode screenshot
    await page.screenshot({ 
      path: 'notes-light-fixed.png',
      fullPage: true
    });
    
    // Verify light mode colors
    const lightBgColor = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    });
    
    console.log('Light mode colors:', lightBgColor);
    
    // Test Dark Mode
    console.log('Testing Notes page in dark mode...');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000); // Wait for theme transition
    }
    
    // Capture dark mode screenshot
    await page.screenshot({ 
      path: 'notes-dark-fixed.png',
      fullPage: true
    });
    
    // Verify dark mode colors
    const darkBgColor = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    });
    
    console.log('Dark mode colors:', darkBgColor);
    
    // Verify the theme toggle worked
    expect(lightBgColor.backgroundColor).not.toBe(darkBgColor.backgroundColor);
  });

  test('Subscriptions page - Theme verification with screenshots', async ({ page }) => {
    console.log('Testing Subscriptions page theme switching...');
    
    // Navigate to Subscriptions page
    await page.goto('http://localhost:3002/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load (not just "Loading...")
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...') || 
            document.querySelectorAll('[data-testid], .subscription, .subscriptions').length > 0,
      { timeout: 10000 }
    );
    
    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000);
    
    // Test Light Mode
    console.log('Testing Subscriptions page in light mode...');
    
    // Ensure we're in light mode - look for theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      // Check if we're in dark mode
      const isDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') || 
               document.body.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });
      
      if (isDarkMode) {
        await themeToggle.click();
        await page.waitForTimeout(1000); // Wait for theme transition
      }
    }
    
    // Capture light mode screenshot
    await page.screenshot({ 
      path: 'subscriptions-light-fixed.png',
      fullPage: true
    });
    
    // Verify light mode colors
    const lightBgColor = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    });
    
    console.log('Light mode colors:', lightBgColor);
    
    // Test Dark Mode
    console.log('Testing Subscriptions page in dark mode...');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000); // Wait for theme transition
    }
    
    // Capture dark mode screenshot
    await page.screenshot({ 
      path: 'subscriptions-dark-fixed.png',
      fullPage: true
    });
    
    // Verify dark mode colors
    const darkBgColor = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    });
    
    console.log('Dark mode colors:', darkBgColor);
    
    // Verify the theme toggle worked
    expect(lightBgColor.backgroundColor).not.toBe(darkBgColor.backgroundColor);
  });

  test('Detailed color analysis for HabitTracker theme verification', async ({ page }) => {
    console.log('Performing detailed color analysis...');
    
    // Navigate to notes page for analysis
    await page.goto('http://localhost:3002/notes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [aria-label*="theme" i]').first();
    
    // Test Light Mode Colors
    if (await themeToggle.isVisible()) {
      // Ensure light mode
      const isDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') || 
               document.body.classList.contains('dark');
      });
      
      if (isDarkMode) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const lightModeAnalysis = await page.evaluate(() => {
      const elements = {
        body: document.body,
        main: document.querySelector('main'),
        background: document.querySelector('.bg-background, [class*="bg-background"]'),
        cards: document.querySelectorAll('.bg-card, [class*="bg-card"]')
      };
      
      const getComputedColor = (element: Element | null) => {
        if (!element) return null;
        const style = window.getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          classes: element.className
        };
      };
      
      return {
        body: getComputedColor(elements.body),
        main: getComputedColor(elements.main),
        background: getComputedColor(elements.background),
        cards: Array.from(elements.cards).map(card => getComputedColor(card))
      };
    });
    
    console.log('Light mode analysis:', JSON.stringify(lightModeAnalysis, null, 2));
    
    // Test Dark Mode Colors
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    const darkModeAnalysis = await page.evaluate(() => {
      const elements = {
        body: document.body,
        main: document.querySelector('main'),
        background: document.querySelector('.bg-background, [class*="bg-background"]'),
        cards: document.querySelectorAll('.bg-card, [class*="bg-card"]')
      };
      
      const getComputedColor = (element: Element | null) => {
        if (!element) return null;
        const style = window.getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          classes: element.className
        };
      };
      
      return {
        body: getComputedColor(elements.body),
        main: getComputedColor(elements.main),
        background: getComputedColor(elements.background),
        cards: Array.from(elements.cards).map(card => getComputedColor(card))
      };
    });
    
    console.log('Dark mode analysis:', JSON.stringify(darkModeAnalysis, null, 2));
    
    // Store results for reporting
    await page.evaluate((results) => {
      (window as any).themeAnalysisResults = results;
    }, { lightMode: lightModeAnalysis, darkMode: darkModeAnalysis });
  });
});