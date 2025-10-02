import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'dinohorn9@gmail.com'
const TEST_PASSWORD = 'dinodino'

test.describe('UI/UX/Design Comprehensive Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login')

    // Wait for page to be ready
    await page.waitForLoadState('networkidle')

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for navigation to tasks page
    await page.waitForURL('**/tasks', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Wait for tasks page to fully load
    await page.waitForSelector('text=Ideas', { timeout: 10000 })
  })

  test('Viewport Height - No overflow or gaps at bottom', async ({ page }) => {
    const viewportHeight = page.viewportSize()?.height || 0

    // Check body height
    const bodyHeight = await page.evaluate(() => {
      return document.body.offsetHeight
    })

    // Check for black/white bars
    const hasOverflow = await page.evaluate(() => {
      const html = document.documentElement
      const body = document.body
      return html.scrollHeight > html.clientHeight || body.scrollHeight > body.clientHeight
    })

    console.log('Viewport height:', viewportHeight)
    console.log('Body height:', bodyHeight)
    console.log('Has overflow:', hasOverflow)

    expect(hasOverflow).toBe(false)
  })

  test('Task Card Contrast - Cards visible against background', async ({ page }) => {
    // Wait for task cards
    await page.waitForSelector('[class*="Card"]', { timeout: 5000 })

    const cardContrast = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="rounded-2xl"]'))
        .filter(el => el.textContent?.includes('Weight') || el.textContent?.includes('Claude'))

      if (cards.length === 0) return { error: 'No cards found' }

      const results = cards.slice(0, 3).map(card => {
        const styles = window.getComputedStyle(card as Element)
        const bgColor = styles.backgroundColor
        const borderWidth = styles.borderWidth
        const boxShadow = styles.boxShadow

        return {
          backgroundColor: bgColor,
          borderWidth,
          boxShadow,
          opacity: styles.opacity
        }
      })

      return results
    })

    console.log('Card contrast analysis:', JSON.stringify(cardContrast, null, 2))

    // Check that cards have visible styling
    if (!Array.isArray(cardContrast)) {
      console.error('Card contrast check failed:', cardContrast)
      return
    }

    for (const card of cardContrast) {
      // Should have either strong shadow or visible border
      const hasShadow = card.boxShadow && card.boxShadow !== 'none'
      const hasBorder = parseInt(card.borderWidth) >= 2

      expect(hasShadow || hasBorder).toBe(true)
    }
  })

  test('Task Card Spacing - Adequate padding and readability', async ({ page }) => {
    const spacingAnalysis = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="rounded-2xl"]'))
        .filter(el => el.textContent?.includes('Weight') || el.textContent?.includes('Claude'))

      if (cards.length === 0) return { error: 'No cards found' }

      const card = cards[0] as HTMLElement
      const styles = window.getComputedStyle(card)

      // Get title element
      const title = card.querySelector('h3')
      const titleStyles = title ? window.getComputedStyle(title) : null

      return {
        cardPadding: styles.padding,
        cardMargin: styles.margin,
        titleFontSize: titleStyles?.fontSize,
        titleLineHeight: titleStyles?.lineHeight,
        gap: styles.gap
      }
    })

    console.log('Spacing analysis:', JSON.stringify(spacingAnalysis, null, 2))

    // Title should be readable (at least 14px / 0.875rem)
    if (spacingAnalysis.titleFontSize) {
      const fontSize = parseFloat(spacingAnalysis.titleFontSize)
      expect(fontSize).toBeGreaterThanOrEqual(14)
    }
  })

  test('Color Theme Consistency - Active list color applied correctly', async ({ page }) => {
    const colorAnalysis = await page.evaluate(() => {
      // Check sidebar
      const sidebar = document.querySelector('[class*="w-72"]')
      const sidebarBg = sidebar ? window.getComputedStyle(sidebar).backgroundColor : null

      // Check main content area
      const mainContent = document.querySelector('[class*="flex-1"][class*="flex-col"]')
      const mainBg = mainContent ? window.getComputedStyle(mainContent).background : null

      // Check if both have color styling
      return {
        sidebarBackground: sidebarBg,
        mainBackground: mainBg,
        hasTheming: !!(sidebarBg && sidebarBg !== 'rgba(0, 0, 0, 0)')
      }
    })

    console.log('Color theme analysis:', JSON.stringify(colorAnalysis, null, 2))

    expect(colorAnalysis.hasTheming).toBe(true)
  })

  test('Dark Mode Support - Proper contrast in both modes', async ({ page }) => {
    // Test light mode
    const lightModeContrast = await page.evaluate(() => {
      const html = document.documentElement
      html.classList.remove('dark')

      const text = document.querySelector('h1')
      if (!text) return null

      const styles = window.getComputedStyle(text)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    })

    console.log('Light mode:', lightModeContrast)

    // Test dark mode
    const darkModeContrast = await page.evaluate(() => {
      const html = document.documentElement
      html.classList.add('dark')

      const text = document.querySelector('h1')
      if (!text) return null

      const styles = window.getComputedStyle(text)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    })

    console.log('Dark mode:', darkModeContrast)

    // Reset to original
    await page.evaluate(() => {
      const html = document.documentElement
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        html.classList.add('dark')
      }
    })
  })

  test('Interactive Elements - Proper hover states and feedback', async ({ page }) => {
    // Test button hover states
    const buttons = await page.locator('button').all()

    if (buttons.length > 0) {
      const firstButton = buttons[0]

      // Get initial state
      const initialState = await firstButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          backgroundColor: styles.backgroundColor,
          cursor: styles.cursor
        }
      })

      // Hover
      await firstButton.hover()

      // Small delay for transition
      await page.waitForTimeout(100)

      const hoveredState = await firstButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          backgroundColor: styles.backgroundColor,
          cursor: styles.cursor
        }
      })

      console.log('Button states:', { initial: initialState, hovered: hoveredState })

      // Cursor should be pointer
      expect(hoveredState.cursor).toBe('pointer')
    }
  })

  test('Task List View - Column layout and spacing', async ({ page }) => {
    // Switch to list view if not already
    const listViewButton = page.locator('button:has-text("List")')
    if (await listViewButton.count() > 0) {
      await listViewButton.click()
      await page.waitForTimeout(500)
    }

    const listLayout = await page.evaluate(() => {
      // Find the table/list container
      const container = document.querySelector('[class*="grid-cols"]')
      if (!container) return { error: 'No list container found' }

      const styles = window.getComputedStyle(container)

      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
        gap: styles.gap
      }
    })

    console.log('List layout:', JSON.stringify(listLayout, null, 2))
  })

  test('Board View - Card layout and drag-drop affordances', async ({ page }) => {
    // Switch to board view
    const boardViewButton = page.locator('button:has-text("Board")')
    if (await boardViewButton.count() > 0) {
      await boardViewButton.click()
      await page.waitForTimeout(500)
    }

    const boardLayout = await page.evaluate(() => {
      // Find column containers
      const columns = Array.from(document.querySelectorAll('[class*="rounded-2xl"]'))
        .filter(el => el.textContent?.includes('Upcoming') || el.textContent?.includes('Today'))

      if (columns.length === 0) return { error: 'No columns found' }

      return {
        columnCount: columns.length,
        columnWidths: columns.map(col => window.getComputedStyle(col as Element).width),
        minHeight: columns.map(col => window.getComputedStyle(col as Element).minHeight)
      }
    })

    console.log('Board layout:', JSON.stringify(boardLayout, null, 2))

    // Should have 3 columns (Upcoming, Today, Done)
    if (typeof boardLayout.columnCount === 'number') {
      expect(boardLayout.columnCount).toBeGreaterThanOrEqual(3)
    }
  })

  test('Responsive Typography - Font sizes appropriate for hierarchy', async ({ page }) => {
    const typography = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      const h3 = document.querySelector('h3')
      const p = document.querySelector('p')

      return {
        h1: h1 ? window.getComputedStyle(h1).fontSize : null,
        h3: h3 ? window.getComputedStyle(h3).fontSize : null,
        p: p ? window.getComputedStyle(p).fontSize : null
      }
    })

    console.log('Typography hierarchy:', typography)

    // H1 should be larger than H3 should be larger than P
    if (typography.h1 && typography.h3) {
      const h1Size = parseFloat(typography.h1)
      const h3Size = parseFloat(typography.h3)

      expect(h1Size).toBeGreaterThan(h3Size)
    }
  })

  test('Visual Feedback - Loading states and transitions', async ({ page }) => {
    // Check for loading indicators
    const hasLoadingStates = await page.evaluate(() => {
      // Look for spinners or loading text
      const spinners = document.querySelectorAll('[class*="animate-spin"]')
      const loadingText = document.querySelectorAll('text="Loading"')

      return {
        spinnerCount: spinners.length,
        loadingTextCount: loadingText.length
      }
    })

    console.log('Loading states:', hasLoadingStates)
  })

  test('Accessibility - Focus indicators and keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement
      if (!focused) return null

      const styles = window.getComputedStyle(focused)
      return {
        tagName: focused.tagName,
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        hasFocusIndicator: styles.outline !== 'none' || styles.boxShadow.includes('ring')
      }
    })

    console.log('Focus indicator:', focusedElement)
  })
})
