import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

// Helper: register and login a test user
async function loginUser(page: any, email: string) {
  await page.goto(`${BASE_URL}/register`)
  await page.fill('input[type="text"]', 'Test User')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
}

test.describe('Dashboard E2E', () => {
  test('quick input: type expense and verify it appears in list', async ({ page }) => {
    await loginUser(page, `expense-${Date.now()}@test.com`)

    const input = page.locator('input[placeholder*="coffee"]')
    await input.fill('coffee : 15000')
    await page.keyboard.press('Enter')

    await expect(page.locator('text=coffee')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=15.000').first()).toBeVisible({ timeout: 5000 })
  })

  test('quick input: type income and verify it appears in income list', async ({ page }) => {
    await loginUser(page, `income-${Date.now()}@test.com`)

    const input = page.locator('input[placeholder*="coffee"]')
    await input.fill('income freelance : 500000')
    await page.keyboard.press('Enter')

    await expect(page.locator('text=freelance')).toBeVisible({ timeout: 5000 })
  })

  test('balance shows in red when expenses exceed salary', async ({ page }) => {
    await loginUser(page, `balance-${Date.now()}@test.com`)

    // Set a small salary
    const input = page.locator('input[placeholder*="coffee"]')
    await input.fill('salary 100000')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Add a large expense
    await input.fill('rent : 200000')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Balance should be negative and red
    const balance = page.locator('text=Balance').locator('..').locator('.text-red-600')
    await expect(balance).toBeVisible({ timeout: 5000 })
  })

  test('period navigation: switch month shows different expenses', async ({ page }) => {
    await loginUser(page, `period-${Date.now()}@test.com`)

    // Add expense in current month
    const input = page.locator('input[placeholder*="coffee"]')
    await input.fill('current month expense : 10000')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Navigate to previous month
    await page.click('button:has-text("<")')
    await page.waitForTimeout(500)

    // Current month expense should not be visible
    await expect(page.locator('text=current month expense')).not.toBeVisible()
  })

  test('salary prompt shown when salary not set', async ({ page }) => {
    await loginUser(page, `nosalay-${Date.now()}@test.com`)

    await expect(page.locator('text=Salary not set')).toBeVisible({ timeout: 5000 })
  })
})
