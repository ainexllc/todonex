const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing environment variables in browser...');
  
  try {
    await page.goto('http://localhost:3002/auth');
    await page.waitForLoadState('networkidle');
    
    // Execute JavaScript in the browser to check environment variables
    const envCheck = await page.evaluate(() => {
      // Check if we can access process.env in the browser (should be undefined)
      // and check what's actually in the window object
      
      return {
        hasProcess: typeof process !== 'undefined',
        hasProcessEnv: typeof process !== 'undefined' && typeof process.env !== 'undefined',
        nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'process undefined',
        // Try to access Next.js injected environment variables
        nextPublicVars: typeof window !== 'undefined' ? Object.keys(window).filter(key => key.includes('NEXT_PUBLIC') || key.includes('firebase')) : [],
        // Check if there are any global Firebase objects
        hasFirebase: typeof window !== 'undefined' && 'firebase' in window,
        // Check what's in the window object that might be Firebase related
        windowKeys: typeof window !== 'undefined' ? Object.keys(window).filter(key => 
          key.toLowerCase().includes('firebase') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('config')
        ) : []
      };
    });
    
    console.log('🌐 Browser environment check:', JSON.stringify(envCheck, null, 2));
    
    // Check the actual error in more detail
    const errorInfo = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[data-nextjs-dialog-overlay]');
      if (errorElements.length > 0) {
        const errorText = errorElements[0].textContent;
        return { hasErrorOverlay: true, errorText };
      }
      return { hasErrorOverlay: false };
    });
    
    console.log('❌ Error details:', JSON.stringify(errorInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();