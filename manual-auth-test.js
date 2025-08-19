const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  console.log('🚀 Starting manual Google authentication test...');
  
  try {
    // Navigate to the app
    console.log('📍 Step 1: Navigating to http://localhost:3002');
    await page.goto('http://localhost:3002');
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial page
    await page.screenshot({ path: 'manual-initial-page.png', fullPage: true });
    console.log('📸 Screenshot of initial page saved');
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Navigate to auth page
    console.log('📍 Step 2: Navigating to /auth page');
    await page.goto('http://localhost:3002/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Take screenshot of auth page
    await page.screenshot({ path: 'manual-auth-page.png', fullPage: true });
    console.log('📸 Screenshot of auth page saved');
    
    // Check for any error messages
    const errorElements = await page.locator('text=/error|Error|ERROR/i').all();
    if (errorElements.length > 0) {
      console.log('❌ Errors detected on page:');
      for (let i = 0; i < errorElements.length; i++) {
        const errorText = await errorElements[i].textContent();
        console.log(`   Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Look for Google auth button
    console.log('🔍 Step 3: Looking for Google authentication elements...');
    
    const googleElements = await page.locator('text=/google|Google|GOOGLE/i').all();
    console.log(`Found ${googleElements.length} elements containing "Google"`);
    
    for (let i = 0; i < googleElements.length; i++) {
      const text = await googleElements[i].textContent();
      const tagName = await googleElements[i].evaluate(el => el.tagName);
      console.log(`   Google element ${i + 1}: <${tagName}> "${text}"`);
    }
    
    // Look for all buttons
    const buttons = await page.locator('button').all();
    console.log(`📊 Found ${buttons.length} buttons on the page:`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`   Button ${i + 1}: "${text}" (visible: ${isVisible})`);
    }
    
    // Check console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleLogs.length > 0) {
      console.log('📋 Console messages:');
      consoleLogs.forEach((log, index) => {
        console.log(`   ${index + 1}: ${log}`);
      });
    }
    
    console.log('✅ Manual test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during manual test:', error.message);
    await page.screenshot({ path: 'manual-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();