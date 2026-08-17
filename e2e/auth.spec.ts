import { expect, test } from '@playwright/test'

test.describe('Auth entry', () => {
  test('login link opens the auth page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('link', { name: /^login$/i }).first()).toBeVisible()

    await page.getByRole('link', { name: /^login$/i }).first().click()
    await expect(page).toHaveURL(/\/auth/)
    await expect(page.locator('body')).toBeVisible()
  })
})
