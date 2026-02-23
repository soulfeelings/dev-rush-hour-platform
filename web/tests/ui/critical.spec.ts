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

  test('Каталог: переключение режима карты/списка работает', async ({ page }) => {
    await test.step('Открыть каталог и проверить кнопку переключения режима', async () => {
      await page.goto('/catalog/projects')
      const toggle = page.getByRole('button', { name: /Show map|Show list/ })
      await expect(toggle).toBeVisible()
    })

    await test.step('Нажать кнопку переключения и проверить смену подписи', async () => {
      const showMapButton = page.getByRole('button', { name: 'Show map' })
      const showListButton = page.getByRole('button', { name: 'Show list' })

      if (await showMapButton.isVisible()) {
        await showMapButton.click()
        await expect(showListButton).toBeVisible()
      } else {
        await showListButton.click()
        await expect(showMapButton).toBeVisible()
      }
    })
  })
})
