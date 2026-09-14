import { test, expect } from '../fixtures'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Campus/)
  await expect(page.getByRole('navigation')).toBeVisible()
})

test('login form is accessible before authenticating', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()
  await expect(page.getByTestId('main-cta')).toBeVisible()
})
