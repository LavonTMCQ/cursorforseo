import { test, expect } from '@playwright/test'

test.describe('MetricsGrid Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard page where MetricsGrid is displayed
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="metrics-grid"]')
  })

  test('should display all metric cards', async ({ page }) => {
    // Check that all 4 metric cards are present
    const metricsGrid = page.locator('[data-testid="metrics-grid"]')
    await expect(metricsGrid).toBeVisible()

    // Verify each metric card exists
    await expect(page.locator('[data-testid="metric-card-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-card-keywords"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-card-avg-position"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-card-rankings"]')).toBeVisible()
  })

  test('should show loading state correctly', async ({ page }) => {
    // Intercept API calls to simulate loading state
    await page.route('/api/trpc/user.getStats*', async route => {
      // Delay response to test loading state
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    await page.reload()
    
    // Check loading indicators are present
    const loadingElements = page.locator('.animate-pulse')
    await expect(loadingElements.first()).toBeVisible()
    
    // Check that loading text is displayed
    await expect(page.locator('text=Loading...')).toBeVisible()
  })

  test('should display correct metric values', async ({ page }) => {
    // Wait for data to load
    await page.waitForFunction(() => {
      const projectValue = document.querySelector('[data-testid="metric-value-projects"]')
      return projectValue && projectValue.textContent !== '...'
    })

    // Check that metric values are displayed (not loading state)
    const projectValue = page.locator('[data-testid="metric-value-projects"]')
    const keywordValue = page.locator('[data-testid="metric-value-keywords"]')
    const positionValue = page.locator('[data-testid="metric-value-avg-position"]')
    const rankingsValue = page.locator('[data-testid="metric-value-rankings"]')

    await expect(projectValue).not.toHaveText('...')
    await expect(keywordValue).not.toHaveText('...')
    await expect(positionValue).not.toHaveText('...')
    await expect(rankingsValue).not.toHaveText('...')
  })

  test('should show appropriate change indicators', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="metric-change-projects"]')

    // Check that change indicators are present
    const projectChange = page.locator('[data-testid="metric-change-projects"]')
    const keywordChange = page.locator('[data-testid="metric-change-keywords"]')
    const positionChange = page.locator('[data-testid="metric-change-avg-position"]')
    const rankingsChange = page.locator('[data-testid="metric-change-rankings"]')

    await expect(projectChange).toBeVisible()
    await expect(keywordChange).toBeVisible()
    await expect(positionChange).toBeVisible()
    await expect(rankingsChange).toBeVisible()
  })

  test('should have proper responsive design', async ({ page }) => {
    // Test desktop layout (4 columns)
    await page.setViewportSize({ width: 1200, height: 800 })
    const grid = page.locator('[data-testid="metrics-grid"]')
    await expect(grid).toHaveClass(/lg:grid-cols-4/)

    // Test tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(grid).toHaveClass(/md:grid-cols-2/)

    // Test mobile layout (1 column)
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(grid).toHaveClass(/grid-cols-1/)
  })

  test('should have hover effects on metric cards', async ({ page }) => {
    const firstCard = page.locator('[data-testid="metric-card-projects"]')
    
    // Check initial state
    await expect(firstCard).toBeVisible()
    
    // Hover over the card
    await firstCard.hover()
    
    // Check that hover effects are applied (scale and shadow changes)
    await expect(firstCard).toHaveClass(/hover:scale-\[1\.02\]/)
    await expect(firstCard).toHaveClass(/hover:shadow-xl/)
  })

  test('should animate cards on load', async ({ page }) => {
    // Reload page to test animation
    await page.reload()
    
    // Check that cards have animation classes
    const cards = page.locator('[data-testid^="metric-card-"]')
    
    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i)
      await expect(card).toHaveClass(/transition-all/)
    }
  })

  test('should display icons correctly', async ({ page }) => {
    // Check that each card has an icon
    const projectIcon = page.locator('[data-testid="metric-card-projects"] svg')
    const keywordIcon = page.locator('[data-testid="metric-card-keywords"] svg')
    const positionIcon = page.locator('[data-testid="metric-card-avg-position"] svg')
    const rankingsIcon = page.locator('[data-testid="metric-card-rankings"] svg')

    await expect(projectIcon).toBeVisible()
    await expect(keywordIcon).toBeVisible()
    await expect(positionIcon).toBeVisible()
    await expect(rankingsIcon).toBeVisible()
  })

  test('should handle empty state correctly', async ({ page }) => {
    // Mock empty user stats
    await page.route('/api/trpc/user.getStats*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: {
              projectCount: 0,
              keywordCount: 0,
              avgPosition: null,
              totalRankings: 0
            }
          }
        })
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="metrics-grid"]')

    // Check that empty state messages are displayed
    await expect(page.locator('text=Create your first project')).toBeVisible()
    await expect(page.locator('text=Add keywords to track')).toBeVisible()
    await expect(page.locator('text=Start tracking rankings')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper ARIA labels and semantic structure
    const cards = page.locator('[data-testid^="metric-card-"]')
    
    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i)
      
      // Check that cards are focusable
      await card.focus()
      await expect(card).toBeFocused()
      
      // Check for proper heading structure
      const title = card.locator('h3, [role="heading"]')
      await expect(title).toBeVisible()
    }
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/trpc/user.getStats*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.reload()
    
    // Should still display the grid structure
    await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible()
    
    // Should show fallback values
    await expect(page.locator('[data-testid="metric-value-projects"]')).toHaveText('0')
  })
})
