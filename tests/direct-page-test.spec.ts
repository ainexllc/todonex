import { test, expect } from '@playwright/test';

test.describe('Direct Page Theme Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set a larger viewport for better screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('Direct notes page theme test', async ({ page }) => {
    console.log('Testing Notes page directly...');
    
    // Navigate directly to notes page
    await page.goto('http://localhost:3002/notes');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(3000);
    
    // Test Light Mode first
    console.log('Testing light mode...');
    
    // Try to find and click theme toggle to ensure light mode
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [role="switch"], .theme-toggle').first();
    
    if (await themeToggle.isVisible()) {
      // Check current theme state
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               document.body.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });
      
      console.log('Current dark mode state:', isDark);
      
      // If in dark mode, click to switch to light
      if (isDark) {
        console.log('Switching to light mode...');
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('Theme toggle not found, proceeding with current theme');
    }
    
    // Capture light mode screenshot
    console.log('Capturing light mode screenshot...');
    await page.screenshot({ 
      path: 'notes-light-direct.png',
      fullPage: true
    });
    
    // Analyze light mode colors
    const lightModeColors = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main') || document.querySelector('[class*="bg-background"]');
      const background = document.querySelector('.bg-background') || body;
      
      const getStyles = (element: Element) => {
        const styles = window.getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: element.className
        };
      };
      
      return {
        body: getStyles(body),
        main: main ? getStyles(main) : null,
        background: getStyles(background),
        hasBackgroundClass: !!document.querySelector('.bg-background'),
        themeClasses: {
          htmlDark: document.documentElement.classList.contains('dark'),
          bodyDark: document.body.classList.contains('dark'),
          themeAttribute: document.documentElement.getAttribute('data-theme')
        }
      };
    });
    
    console.log('Light mode analysis:', JSON.stringify(lightModeColors, null, 2));
    
    // Test Dark Mode
    if (await themeToggle.isVisible()) {
      console.log('Switching to dark mode...');
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Capture dark mode screenshot
    console.log('Capturing dark mode screenshot...');
    await page.screenshot({ 
      path: 'notes-dark-direct.png',
      fullPage: true
    });
    
    // Analyze dark mode colors
    const darkModeColors = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main') || document.querySelector('[class*="bg-background"]');
      const background = document.querySelector('.bg-background') || body;
      
      const getStyles = (element: Element) => {
        const styles = window.getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: element.className
        };
      };
      
      return {
        body: getStyles(body),
        main: main ? getStyles(main) : null,
        background: getStyles(background),
        hasBackgroundClass: !!document.querySelector('.bg-background'),
        themeClasses: {
          htmlDark: document.documentElement.classList.contains('dark'),
          bodyDark: document.body.classList.contains('dark'),
          themeAttribute: document.documentElement.getAttribute('data-theme')
        }
      };
    });
    
    console.log('Dark mode analysis:', JSON.stringify(darkModeColors, null, 2));
    
    // Store results
    await page.evaluate((results) => {
      (window as any).notesPageResults = results;
    }, { light: lightModeColors, dark: darkModeColors });
  });

  test('Direct subscriptions page theme test', async ({ page }) => {
    console.log('Testing Subscriptions page directly...');
    
    // Navigate directly to subscriptions page
    await page.goto('http://localhost:3002/subscriptions');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(3000);
    
    // Test Light Mode first
    console.log('Testing light mode...');
    
    // Try to find and click theme toggle to ensure light mode
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [role="switch"], .theme-toggle').first();
    
    if (await themeToggle.isVisible()) {
      // Check current theme state
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               document.body.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });
      
      console.log('Current dark mode state:', isDark);
      
      // If in dark mode, click to switch to light
      if (isDark) {
        console.log('Switching to light mode...');
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('Theme toggle not found, proceeding with current theme');
    }
    
    // Capture light mode screenshot
    console.log('Capturing light mode screenshot...');
    await page.screenshot({ 
      path: 'subscriptions-light-direct.png',
      fullPage: true
    });
    
    // Analyze light mode colors
    const lightModeColors = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main') || document.querySelector('[class*="bg-background"]');
      const background = document.querySelector('.bg-background') || body;
      
      const getStyles = (element: Element) => {
        const styles = window.getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: element.className
        };
      };
      
      return {
        body: getStyles(body),
        main: main ? getStyles(main) : null,
        background: getStyles(background),
        hasBackgroundClass: !!document.querySelector('.bg-background'),
        themeClasses: {
          htmlDark: document.documentElement.classList.contains('dark'),
          bodyDark: document.body.classList.contains('dark'),
          themeAttribute: document.documentElement.getAttribute('data-theme')
        }
      };
    });
    
    console.log('Light mode analysis:', JSON.stringify(lightModeColors, null, 2));
    
    // Test Dark Mode
    if (await themeToggle.isVisible()) {
      console.log('Switching to dark mode...');
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Capture dark mode screenshot
    console.log('Capturing dark mode screenshot...');
    await page.screenshot({ 
      path: 'subscriptions-dark-direct.png',
      fullPage: true
    });
    
    // Analyze dark mode colors
    const darkModeColors = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main') || document.querySelector('[class*="bg-background"]');
      const background = document.querySelector('.bg-background') || body;
      
      const getStyles = (element: Element) => {
        const styles = window.getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: element.className
        };
      };
      
      return {
        body: getStyles(body),
        main: main ? getStyles(main) : null,
        background: getStyles(background),
        hasBackgroundClass: !!document.querySelector('.bg-background'),
        themeClasses: {
          htmlDark: document.documentElement.classList.contains('dark'),
          bodyDark: document.body.classList.contains('dark'),
          themeAttribute: document.documentElement.getAttribute('data-theme')
        }
      };
    });
    
    console.log('Dark mode analysis:', JSON.stringify(darkModeColors, null, 2));
    
    // Store results
    await page.evaluate((results) => {
      (window as any).subscriptionsPageResults = results;
    }, { light: lightModeColors, dark: darkModeColors });
  });

  test('CSS variables analysis', async ({ page }) => {
    console.log('Analyzing CSS variables...');
    
    await page.goto('http://localhost:3002/notes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get CSS variable values for both themes
    const cssAnalysis = await page.evaluate(() => {
      const getThemeColors = () => {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
          background: computedStyle.getPropertyValue('--background').trim(),
          foreground: computedStyle.getPropertyValue('--foreground').trim(),
          card: computedStyle.getPropertyValue('--card').trim(),
          cardForeground: computedStyle.getPropertyValue('--card-foreground').trim(),
          muted: computedStyle.getPropertyValue('--muted').trim(),
          mutedForeground: computedStyle.getPropertyValue('--muted-foreground').trim(),
          border: computedStyle.getPropertyValue('--border').trim(),
          input: computedStyle.getPropertyValue('--input').trim(),
          primary: computedStyle.getPropertyValue('--primary').trim(),
          primaryForeground: computedStyle.getPropertyValue('--primary-foreground').trim()
        };
      };
      
      return {
        lightMode: getThemeColors(),
        isDarkModeActive: document.documentElement.classList.contains('dark')
      };
    });
    
    console.log('CSS Variables Analysis:', JSON.stringify(cssAnalysis, null, 2));
    
    // Try to toggle theme and get dark mode values
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [role="switch"], .theme-toggle').first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      const darkModeAnalysis = await page.evaluate(() => {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
          background: computedStyle.getPropertyValue('--background').trim(),
          foreground: computedStyle.getPropertyValue('--foreground').trim(),
          card: computedStyle.getPropertyValue('--card').trim(),
          cardForeground: computedStyle.getPropertyValue('--card-foreground').trim(),
          muted: computedStyle.getPropertyValue('--muted').trim(),
          mutedForeground: computedStyle.getPropertyValue('--muted-foreground').trim(),
          border: computedStyle.getPropertyValue('--border').trim(),
          input: computedStyle.getPropertyValue('--input').trim(),
          primary: computedStyle.getPropertyValue('--primary').trim(),
          primaryForeground: computedStyle.getPropertyValue('--primary-foreground').trim(),
          isDarkModeActive: document.documentElement.classList.contains('dark')
        };
      });
      
      console.log('Dark Mode CSS Variables:', JSON.stringify(darkModeAnalysis, null, 2));
    }
  });
});