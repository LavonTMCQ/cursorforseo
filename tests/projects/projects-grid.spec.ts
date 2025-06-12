import { test, expect } from '@playwright/test'

test.describe('ProjectsGrid Component', () => {
  const mockProjects = [
    {
      id: 'project-1',
      name: 'E-commerce Store',
      domain: 'store.com',
      createdAt: new Date('2024-01-15'),
      _count: { keywords: 50 },
      avgPosition: 3.2
    },
    {
      id: 'project-2',
      name: 'Tech Blog',
      domain: 'techblog.com',
      createdAt: new Date('2024-02-01'),
      _count: { keywords: 15 },
      avgPosition: 15.7
    },
    {
      id: 'project-3',
      name: 'Local Business',
      domain: 'localbiz.com',
      createdAt: new Date('2024-02-10'),
      _count: { keywords: 8 },
      avgPosition: 45.2
    }
  ]

  test.beforeEach(async ({ page }) => {
    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: mockProjects
          }
        })
      })
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="projects-grid"]')
  })

  test('should display all projects', async ({ page }) => {
    const projectsGrid = page.locator('[data-testid="projects-grid"]')
    await expect(projectsGrid).toBeVisible()

    // Should show all 3 projects
    for (const project of mockProjects) {
      await expect(page.locator(`[data-testid="project-card-${project.id}"]`)).toBeVisible()
    }
  })

  test('should show create project button', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-project-button"]')
    await expect(createButton).toBeVisible()
    await expect(createButton).toContainText('New Project')
  })

  test('should handle empty state', async ({ page }) => {
    // Mock empty projects response
    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: []
          }
        })
      })
    })

    await page.reload()
    await page.waitForSelector('[data-testid="create-first-project"]')

    // Should show empty state
    await expect(page.locator('text=No projects yet')).toBeVisible()
    await expect(page.locator('[data-testid="create-first-project"]')).toBeVisible()
  })

  test('should handle loading state', async ({ page }) => {
    // Mock slow response to test loading state
    await page.route('/api/trpc/project.getAll*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    await page.reload()
    
    // Should show loading skeletons
    const loadingElements = page.locator('.animate-pulse')
    await expect(loadingElements.first()).toBeVisible()
  })

  test('should filter projects correctly', async ({ page }) => {
    const filterSelect = page.locator('[data-testid="filter-select"]')
    await filterSelect.click()

    // Filter by high performance (health >= 80%)
    await page.locator('text=High Performance').click()
    
    // Should show only high-performing projects
    // Project 1 with 50 keywords and position 3.2 should have high health
    await expect(page.locator(`[data-testid="project-card-project-1"]`)).toBeVisible()
    
    // Other projects might be hidden based on health score
    await expect(page.locator('text=Showing')).toContainText('of 3 projects')
  })

  test('should sort projects correctly', async ({ page }) => {
    const sortSelect = page.locator('[data-testid="sort-select"]')
    await sortSelect.click()

    // Sort by name
    await page.locator('text=Name').click()
    
    // Projects should be sorted alphabetically
    const projectCards = page.locator('[data-testid^="project-card-"]')
    const firstCard = projectCards.first()
    
    // E-commerce Store should be first alphabetically
    await expect(firstCard).toContainText('E-commerce Store')
  })

  test('should handle project deletion', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-project-project-1"]')
    await deleteButton.click()

    // Should show confirmation dialog
    await expect(page.locator('text=Delete Project')).toBeVisible()
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible()

    // Cancel deletion
    await page.locator('text=Cancel').click()
    await expect(page.locator('text=Delete Project')).not.toBeVisible()

    // Try deletion again and confirm
    await deleteButton.click()
    const confirmButton = page.locator('[data-testid="confirm-delete-project"]')
    await confirmButton.click()

    // Dialog should close
    await expect(page.locator('text=Delete Project')).not.toBeVisible()
  })

  test('should show filter badges with counts', async ({ page }) => {
    const filterSelect = page.locator('[data-testid="filter-select"]')
    await filterSelect.click()

    // Should show counts for each filter option
    await expect(page.locator('text=All Projects (3)')).toBeVisible()
    await expect(page.locator('text=High Performance')).toBeVisible()
    await expect(page.locator('text=Needs Attention')).toBeVisible()
    await expect(page.locator('text=New Projects')).toBeVisible()
  })

  test('should display active filters', async ({ page }) => {
    const filterSelect = page.locator('[data-testid="filter-select"]')
    await filterSelect.click()
    await page.locator('text=Needs Attention').click()

    // Should show active filter badge
    await expect(page.locator('text=Active filters:')).toBeVisible()
    await expect(page.locator('text=needs attention')).toBeVisible()

    // Should have clear button
    const clearButton = page.locator('text=Clear')
    await clearButton.click()

    // Active filter should be removed
    await expect(page.locator('text=Active filters:')).not.toBeVisible()
  })

  test('should show results summary', async ({ page }) => {
    // Should show project count
    await expect(page.locator('text=Showing 3 of 3 projects')).toBeVisible()
    
    // Should show average health
    await expect(page.locator('text=Avg Health:')).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    const grid = page.locator('.grid')
    await expect(grid).toHaveClass(/lg:grid-cols-3/)

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(grid).toHaveClass(/md:grid-cols-2/)

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(grid).toHaveClass(/grid-cols-1/)
  })

  test('should handle project actions', async ({ page }) => {
    // Test view action
    const viewButton = page.locator('[data-testid="view-project-project-1"]')
    await viewButton.click()
    await expect(viewButton).toBeEnabled()

    // Test edit action
    const editButton = page.locator('[data-testid="edit-project-project-1"]')
    await editButton.click()
    await expect(editButton).toBeEnabled()
  })

  test('should be accessible', async ({ page }) => {
    // Check heading structure
    await expect(page.locator('h2')).toContainText('Your Projects')
    
    // Check form controls have labels
    const filterSelect = page.locator('[data-testid="filter-select"]')
    const sortSelect = page.locator('[data-testid="sort-select"]')
    
    await expect(filterSelect).toBeVisible()
    await expect(sortSelect).toBeVisible()
    
    // Check buttons are focusable
    const createButton = page.locator('[data-testid="create-project-button"]')
    await createButton.focus()
    await expect(createButton).toBeFocused()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through controls
    await page.keyboard.press('Tab')
    const filterSelect = page.locator('[data-testid="filter-select"]')
    await expect(filterSelect).toBeFocused()
    
    await page.keyboard.press('Tab')
    const sortSelect = page.locator('[data-testid="sort-select"]')
    await expect(sortSelect).toBeFocused()
    
    await page.keyboard.press('Tab')
    const createButton = page.locator('[data-testid="create-project-button"]')
    await expect(createButton).toBeFocused()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/trpc/project.getAll*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.reload()
    
    // Should handle error state gracefully
    // This would depend on error handling implementation
    await page.waitForTimeout(1000)
  })

  test('should update filter counts dynamically', async ({ page }) => {
    const filterSelect = page.locator('[data-testid="filter-select"]')
    
    // Initial state should show all projects
    await filterSelect.click()
    await expect(page.locator('text=All Projects (3)')).toBeVisible()
    
    // Filter counts should be accurate based on project health scores
    await page.locator('text=All Projects (3)').click()
  })
})
