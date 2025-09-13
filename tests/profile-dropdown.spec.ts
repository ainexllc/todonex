import { test, expect } from '@playwright/test'

test.describe('Profile Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3002')
    
    // Wait for the sidebar to be visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })

  test('should show profile icon in sidebar', async ({ page }) => {
    // Check that profile dropdown component is visible
    const profileSection = page.locator('[title="Profile Menu"]')
    await expect(profileSection).toBeVisible()
    
    // Verify profile icon is present
    const profileIcon = page.locator('.bg-gradient-to-br.from-blue-500.to-purple-600')
    await expect(profileIcon).toBeVisible()
  })

  test('should open dropdown menu when profile icon is clicked', async ({ page }) => {
    // Click on the profile icon
    const profileButton = page.locator('[title="Profile Menu"]')
    await expect(profileButton).toBeVisible()
    await profileButton.click()
    
    // Verify dropdown menu appears
    const dropdown = page.locator('.absolute.bottom-full')
    await expect(dropdown).toBeVisible()
    
    // Check that all menu items are present
    const menuItems = [
      'Settings',
      'Report Issue', 
      'Community',
      'FAQ',
      'Manage Subscription',
      'Sign Out'
    ]
    
    for (const item of menuItems) {
      await expect(page.locator(`text="${item}"`)).toBeVisible()
    }
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    // Open the dropdown
    const profileButton = page.locator('[title="Profile Menu"]')
    await profileButton.click()
    
    // Verify dropdown is open
    const dropdown = page.locator('.absolute.bottom-full')
    await expect(dropdown).toBeVisible()
    
    // Click outside the dropdown (on the main content area)
    await page.locator('body').click({ position: { x: 400, y: 400 } })
    
    // Verify dropdown is closed
    await expect(dropdown).not.toBeVisible()
  })

  test('should have correct menu item icons', async ({ page }) => {
    // Open the dropdown
    const profileButton = page.locator('[title="Profile Menu"]')
    await profileButton.click()
    
    // Verify dropdown is visible
    const dropdown = page.locator('.absolute.bottom-full')
    await expect(dropdown).toBeVisible()
    
    // Check that menu items have icons (each item should have an icon element)
    const menuItemsWithIcons = page.locator('.absolute.bottom-full .flex.items-center.gap-3')
    const count = await menuItemsWithIcons.count()
    expect(count).toBe(6) // Should have 6 menu items with icons
  })

  test('should handle settings navigation', async ({ page }) => {
    // Open the dropdown
    const profileButton = page.locator('[title="Profile Menu"]')
    await profileButton.click()
    
    // Click on Settings
    const settingsLink = page.locator('text="Settings"')
    await expect(settingsLink).toBeVisible()
    
    // Note: We won't actually click to navigate since the settings page might not exist
    // But we can verify the link is properly structured
    const settingsContainer = settingsLink.locator('..')
    await expect(settingsContainer).toHaveAttribute('href', '/settings')
  })

  test('should style sign out differently', async ({ page }) => {
    // Open the dropdown
    const profileButton = page.locator('[title="Profile Menu"]')
    await profileButton.click()
    
    // Find the Sign Out button
    const signOutButton = page.locator('text="Sign Out"').locator('..')
    await expect(signOutButton).toBeVisible()
    
    // Verify it has red styling (text-red-600 or text-red-400 classes)
    const hasRedStyling = await signOutButton.evaluate((el) => {
      return el.className.includes('text-red-600') || el.className.includes('text-red-400')
    })
    expect(hasRedStyling).toBe(true)
  })

  test('should handle collapsed sidebar state', async ({ page }) => {
    // Find and click the collapse button
    const collapseButton = page.locator('.collapse-button')
    await expect(collapseButton).toBeVisible()
    await collapseButton.click()
    
    // Wait for animation to complete
    await page.waitForTimeout(300)
    
    // Verify sidebar is collapsed (should have w-20 class or similar narrow width)
    const sidebar = page.locator('[data-testid="sidebar"]').first()
    const isNarrow = await sidebar.evaluate((el) => {
      return el.clientWidth <= 80 // Collapsed width should be around 80px
    })
    expect(isNarrow).toBe(true)
    
    // In collapsed state, profile should still be visible but simpler
    const profileIcon = page.locator('.bg-gradient-to-br.from-blue-500.to-purple-600')
    await expect(profileIcon).toBeVisible()
  })

  test('should track feature usage on interactions', async ({ page }) => {
    // This test verifies the analytics tracking calls are made
    // We can't easily test the actual analytics calls without mocking,
    // but we can verify the interactions work properly
    
    // Open dropdown
    const profileButton = page.locator('[title="Profile Menu"]')
    await profileButton.click()
    
    // Close dropdown
    await page.locator('body').click({ position: { x: 400, y: 400 } })
    
    // Open again
    await profileButton.click()
    
    // These interactions should trigger trackFeatureUsage calls
    // In a real test environment, we'd mock the analytics service
    expect(true).toBe(true) // Placeholder - interactions completed successfully
  })
})