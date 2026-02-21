import { expect, test } from '@playwright/test'
import { authenticateAdminContext } from './helpers/adminAuth'
import { resolveBaseUrl } from './helpers/adminUi'

test.describe('Админка UI: smoke', () => {
  test('Гость перенаправляется на /admin/auth', async ({ page }) => {
    await page.goto('/admin/projects')

    await expect(page).toHaveURL(/\/admin\/auth$/)
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in with Microsoft' })).toBeVisible()
  })

  test('Авторизованный администратор видит все разделы', async ({ context, page }, testInfo) => {
    await authenticateAdminContext(context, resolveBaseUrl(testInfo))
    await page.goto('/admin/projects')

    const sections = [
      { nav: 'Projects', url: '/admin/projects', title: 'Projects' },
      { nav: 'Lots', url: '/admin/lots', title: 'Lots' },
      { nav: 'Areas', url: '/admin/areas', title: 'Areas' },
      { nav: 'Cities', url: '/admin/cities', title: 'Cities' },
      { nav: 'Badges', url: '/admin/badges', title: 'Badges' },
      { nav: 'Infrastructures', url: '/admin/infrastructures', title: 'Infrastructures' },
      { nav: 'Developers', url: '/admin/developers', title: 'Developers' },
      { nav: 'Media', url: '/admin/media', title: 'Media' },
      { nav: 'Team', url: '/admin/team', title: 'Team' },
    ]

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

    for (const section of sections) {
      await page.getByRole('button', { name: section.nav, exact: true }).click()
      await expect(page).toHaveURL(section.url)
      await expect(page.getByRole('heading', { name: section.title, exact: true })).toBeVisible()
    }
  })
})
