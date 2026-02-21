import { test, expect } from '@playwright/test'

test.describe('Критичные UI-сценарии', () => {
  test('Каталог открывается и поиск синхронизируется с URL', async ({ page }) => {
    await test.step('Открыть каталог и проверить наличие поля поиска', async () => {
      await page.goto('/catalog/projects')
      await expect(page.getByPlaceholder('Search by project name')).toBeVisible()
    })

    await test.step('Ввести поисковый запрос и проверить query-параметр в URL', async () => {
      await page.getByPlaceholder('Search by project name').fill('Palm')
      await expect(page).toHaveURL(/\/catalog\/projects\?search=Palm/)
      await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()
    })
  })

  test('Переход из карточки каталога открывает страницу проекта', async ({ page }) => {
    await test.step('Открыть каталог и проверить наличие карточек проектов', async () => {
      await page.goto('/catalog/projects')

      const projectLinks = page.locator('a[href^="/project/"]')
      const count = await projectLinks.count()

      test.skip(count === 0, 'В каталоге нет проектов для проверки перехода')
      await expect(projectLinks.first()).toBeVisible()
    })

    await test.step('Кликнуть по первой карточке и проверить переход', async () => {
      const projectLinks = page.locator('a[href^="/project/"]')
      const firstHref = await projectLinks.first().getAttribute('href')

      await projectLinks.first().click()

      await expect(page).toHaveURL(/\/project\//)
      if (firstHref) {
        await expect(page).toHaveURL(new RegExp(firstHref.replace('/', '\\/')))
      }
    })
  })

  test('Админка требует авторизацию, показывает ошибку и поддерживает выход', async ({
    page,
  }) => {
    await test.step('Открыть защищённый раздел админки и проверить форму входа', async () => {
      await page.goto('/admin/projects')
      await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
    })

    await test.step('Проверить ошибку при неверных учётных данных', async () => {
      await page.getByPlaceholder('Enter username').fill('wrong-user')
      await page.getByPlaceholder('Enter password').fill('wrong-password')
      await page.getByRole('button', { name: 'Login' }).click()
      await expect(page.getByRole('alert')).toHaveText('Invalid username or password')
    })

    await test.step('Авторизоваться валидными данными и попасть в админ-панель', async () => {
      await page.getByPlaceholder('Enter username').fill('admin')
      await page.getByPlaceholder('Enter password').fill('admin')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page).toHaveURL('/admin/projects')
      await expect(page.getByText('Admin Panel')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    })

    await test.step('Выполнить logout и вернуться к форме авторизации', async () => {
      await page.getByRole('button', { name: 'Logout' }).click()
      await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
    })
  })
})
