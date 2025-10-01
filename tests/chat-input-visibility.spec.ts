import { test, expect } from '@playwright/test'

test.describe('Chat Input Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')

    // Wait for the page to load
    await page.waitForTimeout(2000)

    // Check if we're on the login page
    const currentUrl = page.url()
    if (currentUrl.includes('localhost:3000') && !currentUrl.includes('/tasks')) {
      // Look for "Already have an account" or "Sign in" link to switch to sign in mode
      const signInLink = page.locator('text=/Already have an account|Sign in/i').first()
      const isLinkVisible = await signInLink.isVisible().catch(() => false)

      if (isLinkVisible) {
        await signInLink.click()
        await page.waitForTimeout(1000)
      }

      // Fill in login credentials
      const emailInput = page.locator('input[type="email"]').first()
      const passwordInput = page.locator('input[type="password"]').first()

      // Wait for inputs to be visible
      await emailInput.waitFor({ state: 'visible', timeout: 5000 })
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 })

      await emailInput.fill('dinohorn9@gmail.com')
      await passwordInput.fill('dinodino')

      // Click the sign in/submit button
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()

      // Wait for redirect to /tasks
      await page.waitForURL('**/tasks', { timeout: 15000 })
    }

    // Wait for the tasks page to fully load
    await page.waitForTimeout(2000)
  })

  test('chat input should be fully visible', async ({ page }) => {
    // Wait for the AI chat section to be present
    const aiChatSection = page.locator('text=AI Assistant').first()
    await expect(aiChatSection).toBeVisible()

    // Find the chat input (textarea or input)
    const chatInput = page.locator('textarea, input[placeholder*="Ask AI"], input[placeholder*="AI"]').last()

    // Check if input exists
    await expect(chatInput).toBeAttached()

    // Get the bounding box of the input
    const boundingBox = await chatInput.boundingBox()

    console.log('Chat input bounding box:', boundingBox)

    // Check if the input is visible
    const isVisible = await chatInput.isVisible()
    console.log('Chat input is visible:', isVisible)

    // Get viewport size
    const viewportSize = page.viewportSize()
    console.log('Viewport size:', viewportSize)

    // Check if input is within viewport
    if (boundingBox && viewportSize) {
      const isInViewport = boundingBox.y + boundingBox.height <= viewportSize.height
      console.log('Input is in viewport:', isInViewport)
      console.log('Input bottom position:', boundingBox.y + boundingBox.height)
      console.log('Viewport height:', viewportSize.height)

      // The input should be fully visible in viewport
      expect(boundingBox.y + boundingBox.height).toBeLessThanOrEqual(viewportSize.height)
      expect(boundingBox.height).toBeGreaterThan(20) // Should have reasonable height
    }

    // Try to focus and type in the input
    await chatInput.click()
    await chatInput.fill('Test message')

    const inputValue = await chatInput.inputValue()
    expect(inputValue).toBe('Test message')

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/chat-input-visibility.png', fullPage: true })
  })

  test('AI chat panel should be anchored to bottom', async ({ page }) => {
    // Find the AI chat container
    const aiChatContainer = page.locator('[class*="CompactAIChat"], div:has(text("AI Assistant"))').first()

    const boundingBox = await aiChatContainer.boundingBox()
    const viewportSize = page.viewportSize()

    console.log('AI chat container bounding box:', boundingBox)
    console.log('Viewport size:', viewportSize)

    if (boundingBox && viewportSize) {
      // The bottom of the chat container should be at or near the bottom of viewport
      const distanceFromBottom = viewportSize.height - (boundingBox.y + boundingBox.height)
      console.log('Distance from bottom of viewport:', distanceFromBottom)

      // Should be very close to bottom (within 5px tolerance)
      expect(distanceFromBottom).toBeLessThanOrEqual(5)
    }
  })

  test('check CompactAIChat component structure', async ({ page }) => {
    // Log the entire AI chat section structure
    const aiChatSection = page.locator('div:has(text("AI Assistant"))').first()

    // Get all child elements
    const children = await aiChatSection.evaluate((el) => {
      const getElementInfo = (element: Element, depth = 0): any => {
        const styles = window.getComputedStyle(element)
        return {
          tag: element.tagName,
          classes: element.className,
          depth,
          styles: {
            height: styles.height,
            minHeight: styles.minHeight,
            maxHeight: styles.maxHeight,
            overflow: styles.overflow,
            display: styles.display,
            flexBasis: styles.flexBasis,
            flexGrow: styles.flexGrow,
            flexShrink: styles.flexShrink,
          },
          children: Array.from(element.children).map(child => getElementInfo(child, depth + 1))
        }
      }
      return getElementInfo(el)
    })

    console.log('AI Chat Section Structure:', JSON.stringify(children, null, 2))
  })
})
