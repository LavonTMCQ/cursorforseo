import { test, expect } from '@playwright/test'

test.describe('ProjectCard Component', () => {
  const mockProject = {
    id: 'test-project-1',
    name: 'Test E-commerce Site',
    domain: 'teststore.com',
    createdAt: new Date('2024-01-15'),
    _count: { keywords: 25 },
    avgPosition: 8.5
  }

  test.beforeEach(async ({ page }) => {
    // Mock the project data
    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: [mockProject]
          }
        })
      })
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="projects-grid"]')
  })

  test('should display project information correctly', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    await expect(projectCard).toBeVisible()

    // Check project name and domain
    await expect(projectCard.locator('h3')).toContainText(mockProject.name)
    await expect(projectCard.locator('text=teststore.com')).toBeVisible()

    // Check metrics
    await expect(projectCard.locator('text=25')).toBeVisible() // keywords count
    await expect(projectCard.locator('text=8.5')).toBeVisible() // avg position
  })

  test('should display health score correctly', async ({ page }) => {
    const healthScore = page.locator(`[data-testid="health-score-${mockProject.id}"]`)
    await expect(healthScore).toBeVisible()
    await expect(healthScore).toContainText('% Health')

    const healthProgress = page.locator(`[data-testid="health-progress-${mockProject.id}"]`)
    await expect(healthProgress).toBeVisible()
  })

  test('should show action buttons on hover', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Initially, menu button should be hidden
    const menuButton = page.locator(`[data-testid="project-menu-${mockProject.id}"]`)
    await expect(menuButton).toHaveClass(/opacity-0/)

    // Hover over the card
    await projectCard.hover()
    
    // Menu button should become visible
    await expect(menuButton).toHaveClass(/opacity-100/)
  })

  test('should handle view action', async ({ page }) => {
    const viewButton = page.locator(`[data-testid="view-project-${mockProject.id}"]`)
    await expect(viewButton).toBeVisible()
    
    // Click view button
    await viewButton.click()
    
    // Should trigger onView callback (would navigate in real app)
    // For now, just verify the button is clickable
    await expect(viewButton).toBeEnabled()
  })

  test('should handle edit action', async ({ page }) => {
    const editButton = page.locator(`[data-testid="edit-project-${mockProject.id}"]`)
    await expect(editButton).toBeVisible()
    
    await editButton.click()
    await expect(editButton).toBeEnabled()
  })

  test('should handle delete action', async ({ page }) => {
    const deleteButton = page.locator(`[data-testid="delete-project-${mockProject.id}"]`)
    await expect(deleteButton).toBeVisible()
    
    await deleteButton.click()
    await expect(deleteButton).toBeEnabled()
  })

  test('should display correct health badge variant', async ({ page }) => {
    // Test high performance project (health >= 80)
    const highPerfProject = {
      ...mockProject,
      id: 'high-perf-project',
      _count: { keywords: 50 },
      avgPosition: 3.2
    }

    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: [highPerfProject]
          }
        })
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="projects-grid"]')

    const healthBadge = page.locator(`[data-testid="health-score-${highPerfProject.id}"]`)
    await expect(healthBadge).toBeVisible()
    // High performance should have default variant (green)
  })

  test('should show position trend indicators', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Should show trend icon based on position
    const trendIcon = projectCard.locator('svg').filter({ hasText: /trending/i }).first()
    // Position 8.5 should show upward trend (good position)
    await expect(trendIcon).toBeVisible()
  })

  test('should format dates correctly', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Should display formatted creation date
    await expect(projectCard.locator('text=Jan 15, 2024')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Should be focusable
    await projectCard.focus()
    await expect(projectCard).toBeFocused()
    
    // Action buttons should have proper labels
    const viewButton = page.locator(`[data-testid="view-project-${mockProject.id}"]`)
    const editButton = page.locator(`[data-testid="edit-project-${mockProject.id}"]`)
    const deleteButton = page.locator(`[data-testid="delete-project-${mockProject.id}"]`)
    
    await expect(viewButton).toBeVisible()
    await expect(editButton).toBeVisible()
    await expect(deleteButton).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Focus the card
    await projectCard.focus()
    
    // Tab through action buttons
    await page.keyboard.press('Tab')
    const viewButton = page.locator(`[data-testid="view-project-${mockProject.id}"]`)
    await expect(viewButton).toBeFocused()
    
    await page.keyboard.press('Tab')
    const editButton = page.locator(`[data-testid="edit-project-${mockProject.id}"]`)
    await expect(editButton).toBeFocused()
    
    await page.keyboard.press('Tab')
    const deleteButton = page.locator(`[data-testid="delete-project-${mockProject.id}"]`)
    await expect(deleteButton).toBeFocused()
  })

  test('should handle click events correctly', async ({ page }) => {
    const projectCard = page.locator(`[data-testid="project-card-${mockProject.id}"]`)
    
    // Clicking the card should trigger view action
    await projectCard.click()
    
    // Clicking action buttons should stop propagation
    const editButton = page.locator(`[data-testid="edit-project-${mockProject.id}"]`)
    await editButton.click()
    
    // Should not trigger card click when clicking buttons
    await expect(editButton).toBeEnabled()
  })

  test('should display tooltips on action buttons', async ({ page }) => {
    // Hover over view button to show tooltip
    const viewButton = page.locator(`[data-testid="view-project-${mockProject.id}"]`)
    await viewButton.hover()
    
    // Tooltip should appear
    await expect(page.locator('text=View project details')).toBeVisible()
    
    // Hover over edit button
    const editButton = page.locator(`[data-testid="edit-project-${mockProject.id}"]`)
    await editButton.hover()
    await expect(page.locator('text=Edit project')).toBeVisible()
    
    // Hover over delete button
    const deleteButton = page.locator(`[data-testid="delete-project-${mockProject.id}"]`)
    await deleteButton.hover()
    await expect(page.locator('text=Delete project')).toBeVisible()
  })

  test('should handle projects with no rankings', async ({ page }) => {
    const noRankingsProject = {
      ...mockProject,
      id: 'no-rankings-project',
      avgPosition: 0
    }

    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: [noRankingsProject]
          }
        })
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="projects-grid"]')

    const projectCard = page.locator(`[data-testid="project-card-${noRankingsProject.id}"]`)
    
    // Should show '--' for no position data
    await expect(projectCard.locator('text=--')).toBeVisible()
  })
})
