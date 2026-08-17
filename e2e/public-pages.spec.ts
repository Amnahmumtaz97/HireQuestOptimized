import { expect, test } from '@playwright/test'

async function gotoReady(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('body')).toBeVisible()
}

test.describe('Public marketing pages', () => {
  test('landing page loads with HireQuest branding and nav', async ({ page }) => {
    await gotoReady(page, '/')

    await expect(page.getByRole('link', { name: /hirequest/i }).first()).toBeVisible()
    await expect(page.getByRole('navigation').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^features$/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^solutions$/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^pricing$/i }).first()).toBeVisible()
  })

  test('nav order places Features before Solutions', async ({ page }) => {
    await gotoReady(page, '/')

    const nav = page.getByRole('navigation').first()
    const features = nav.getByRole('link', { name: /^features$/i }).first()
    const solutions = nav.getByRole('link', { name: /^solutions$/i }).first()

    await expect(features).toBeVisible()
    await expect(solutions).toBeVisible()

    const featuresBox = await features.boundingBox()
    const solutionsBox = await solutions.boundingBox()
    expect(featuresBox && solutionsBox).toBeTruthy()
    if (featuresBox && solutionsBox) {
      expect(featuresBox.x).toBeLessThan(solutionsBox.x)
    }
  })

  test('product, features, solutions, and pricing routes render', async ({ page }) => {
    for (const path of ['/product', '/features', '/solutions', '/pricing'] as const) {
      await gotoReady(page, path)
      await expect(page.locator('main').first()).toBeVisible()
      await expect(page.getByRole('navigation').first()).toBeVisible()
    }
  })
})
