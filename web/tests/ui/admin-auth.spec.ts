import { expect, test, type TestInfo } from '@playwright/test'
import { authenticateAdminContext } from './helpers/adminAuth'

function resolveBaseUrl(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL
  if (!baseURL || typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL is required for admin auth UI tests')
  }
  return baseURL
}

test.describe('Админка UI: авторизация', () => {
  test('Гость перенаправляется на страницу логина', async ({ page }) => {
    await page.goto('/admin/projects')

    await expect(page).toHaveURL(/\/admin\/auth$/)
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in with Microsoft' })).toBeVisible()
  })

  test('Тест сам создает сессию и открывает админку', async ({ context, page }, testInfo) => {
    await authenticateAdminContext(context, resolveBaseUrl(testInfo))

    await page.goto('/admin/projects')

    await expect(page).toHaveURL('/admin/projects')
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
  })

  test('Logout очищает сессию и возвращает на логин', async ({ context, page }, testInfo) => {
    await authenticateAdminContext(context, resolveBaseUrl(testInfo))

    await page.goto('/admin/projects')
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

    await page.getByRole('button', { name: 'Logout', exact: true }).click()

    await expect(page).toHaveURL(/\/admin\/auth$/)
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
  })
})
