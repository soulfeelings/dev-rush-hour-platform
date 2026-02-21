import { test, expect } from '@playwright/test'

test.describe('UI регресс', () => {
  test('Каталог: поисковый запрос сохраняется после перезагрузки страницы', async ({ page }) => {
    await test.step('Открыть каталог и применить поиск', async () => {
      await page.goto('/catalog/projects')
      const searchInput = page.getByPlaceholder('Search by project name')

      await expect(searchInput).toBeVisible()
      await searchInput.fill('Palm')
      await expect(page).toHaveURL(/\/catalog\/projects\?search=Palm/)
    })

    await test.step('Перезагрузить страницу и проверить сохранение состояния', async () => {
      await page.reload()
      await expect(page).toHaveURL(/\/catalog\/projects\?search=Palm/)
      await expect(page.getByPlaceholder('Search by project name')).toHaveValue('Palm')
    })
  })

  test('Каталог: переключение Projects/Lots не сбрасывает активные фильтры', async ({
    page,
  }) => {
    await test.step('Открыть каталог и установить фильтр поиска', async () => {
      await page.goto('/catalog/projects')
      const searchInput = page.getByPlaceholder('Search by project name')
      await searchInput.fill('Palm')
      await searchInput.blur()
      await expect(page).toHaveURL(/search=Palm/)
    })

    await test.step('Переключиться на вкладку Lots и проверить, что фильтр сохранился', async () => {
      await page.getByRole('button', { name: 'Lots', exact: true }).click()
      await expect(page.getByPlaceholder('Search by project name')).toHaveValue('Palm')
      await expect(page).toHaveURL(/search=Palm/)
    })

    await test.step('Вернуться на вкладку Projects и проверить сохранение фильтра', async () => {
      await page.getByRole('button', { name: 'Projects', exact: true }).click()
      await expect(page.getByPlaceholder('Search by project name')).toHaveValue('Palm')
      await expect(page).toHaveURL(/search=Palm/)
    })
  })

  test('Каталог: переход в карточку проекта и возврат назад работает стабильно', async ({
    page,
  }) => {
    let firstHref: string | null = null

    await test.step('Открыть каталог и взять первую карточку проекта', async () => {
      await page.goto('/catalog/projects')
      const projectLinks = page.locator('a[href^="/project/"]')
      const count = await projectLinks.count()

      test.skip(count === 0, 'В каталоге нет проектов для проверки перехода')
      firstHref = await projectLinks.first().getAttribute('href')
      await expect(projectLinks.first()).toBeVisible()
    })

    await test.step('Открыть страницу проекта', async () => {
      const projectLinks = page.locator('a[href^="/project/"]')
      await projectLinks.first().click()
      await expect(page).toHaveURL(/\/project\//)

      if (firstHref) {
        await expect(page).toHaveURL(new RegExp(firstHref.replace('/', '\\/')))
      }
    })

    await test.step('Вернуться назад и убедиться, что снова открыт каталог', async () => {
      await page.goBack()
      await expect(page).toHaveURL(/\/catalog\/projects/)
      await expect(page.getByPlaceholder('Search by project name')).toBeVisible()
    })
  })
})
