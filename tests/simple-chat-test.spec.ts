import { test, expect } from '@playwright/test'

test('check chat input visibility after manual login', async ({ page }) => {
  // Set longer timeout for this test
  test.setTimeout(60000)

  // Listen for console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()))
  page.on('pageerror', error => console.log('PAGE ERROR:', error))

  // Go directly to home page
  await page.goto('http://localhost:3000')
  await page.waitForTimeout(2000)

  // Click "Sign in instead" link (use first one since there are mobile and desktop versions)
  const signInLink = page.locator('text=Sign in instead').first()
  await signInLink.click()
  await page.waitForTimeout(1000)

  // Fill in credentials
  await page.fill('input[type="email"]', 'dinohorn9@gmail.com')
  await page.fill('input[type="password"]', 'dinodino')

  // Click submit
  await page.click('button[type="submit"]')

  // Wait for navigation with longer timeout
  await page.waitForURL('**/tasks', { timeout: 20000 })
  console.log('Current URL after login:', page.url())
  await page.waitForTimeout(3000)

  // Take a full page screenshot
  await page.screenshot({ path: 'tests/screenshots/tasks-page-full.png', fullPage: true })

  // Get the page HTML
  const html = await page.content()
  console.log('Page HTML length:', html.length)
  console.log('Page title:', await page.title())

  // Check if there's any visible content
  const body = await page.locator('body').innerHTML()
  console.log('Body HTML preview:', body.substring(0, 500))

  // Find the AI Assistant section
  const aiAssistant = page.locator('text=AI Assistant')
  const aiAssistantCount = await aiAssistant.count()
  console.log('AI Assistant elements found:', aiAssistantCount)

  if (aiAssistantCount === 0) {
    console.log('AI Assistant not found, dumping page structure...')
    // Look for any text on the page
    const pageText = await page.locator('body').textContent()
    console.log('Page text:', pageText)
  }

  await expect(aiAssistant).toBeVisible()

  // Look for the chat input
  const chatInput = page.locator('textarea[placeholder*="Ask AI"], input[placeholder*="Ask AI"]').first()

  // Check if it exists
  const exists = await chatInput.count()
  console.log('Chat input count:', exists)

  if (exists > 0) {
    // Get its bounding box
    const box = await chatInput.boundingBox()
    console.log('Chat input bounding box:', box)

    // Get viewport
    const viewport = page.viewportSize()
    console.log('Viewport:', viewport)

    // Check visibility
    const isVisible = await chatInput.isVisible()
    console.log('Is visible:', isVisible)

    // Try to screenshot just the chat area
    const chatContainer = page.locator('div:has(text("AI Assistant"))').first()
    await chatContainer.screenshot({ path: 'tests/screenshots/ai-chat-section.png' })
  }

  // Keep browser open to inspect
  await page.waitForTimeout(5000)
})
