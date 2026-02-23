import { test, expect, type Page } from '@playwright/test'

type FilterOption = {
  value: string
  label: string
}

type FilterOptionsResponse = {
  cities?: FilterOption[]
  statuses?: FilterOption[]
}

async function selectOptionInDropdown(
  page: Page,
  triggerText: string | RegExp,
  optionText: string
) {
  await page.getByRole('button', { name: triggerText }).click()

  const dropdown = page.locator('[id^="dropdown-"]').last()
  await expect(dropdown).toBeVisible()
  await dropdown.getByText(optionText, { exact: true }).click()
}

async function openCatalogAndLoadFilterOptions(page: Page): Promise<FilterOptionsResponse> {
  const filterOptionsResponsePromise = page.waitForResponse(response => {
    return response.url().includes('/api/filters/options') && response.request().method() === 'GET'
  })

  await page.goto('/catalog/projects')
  const filterOptionsResponse = await filterOptionsResponsePromise

  expect(filterOptionsResponse.ok()).toBeTruthy()
  return (await filterOptionsResponse.json()) as FilterOptionsResponse
}

test.describe('Фильтры каталога', () => {
  test('Фильтр по локации добавляет параметр `city` в URL', async ({ page }) => {
    let cityOption: FilterOption | undefined

    await test.step('Открыть каталог и получить доступные опции фильтров', async () => {
      const options = await openCatalogAndLoadFilterOptions(page)
      cityOption = options.cities?.find(option => option.value && option.label)

      test.skip(!cityOption, 'В API фильтров нет доступных опций города')
    })

    await test.step('Выбрать первую доступную локацию в фильтре "Location"', async () => {
      if (!cityOption) {
        return
      }

      await selectOptionInDropdown(page, 'Location', cityOption.label)
      await expect(page).toHaveURL(new RegExp(`city=${encodeURIComponent(cityOption.value)}`))
    })
  })

  test('Фильтр статуса добавляет параметр `status` в URL', async ({ page }) => {
    let statusOption: FilterOption | undefined

    await test.step('Открыть каталог и получить доступные статусы', async () => {
      const options = await openCatalogAndLoadFilterOptions(page)
      statusOption = options.statuses?.find(option => option.value && option.value !== 'all')

      test.skip(!statusOption, 'В API фильтров нет доступных статусов кроме "all"')
    })

    await test.step('Выбрать первый доступный статус в фильтре "Sale Status"', async () => {
      if (!statusOption) {
        return
      }

      await selectOptionInDropdown(page, /Sale Status/, statusOption.label)
      await expect(page).toHaveURL(new RegExp(`status=${encodeURIComponent(statusOption.value)}`))
    })
  })

  test('Кнопка "Clear filters" сбрасывает фильтры и очищает URL', async ({ page }) => {
    await test.step('Открыть каталог и применить поисковый фильтр', async () => {
      await page.goto('/catalog/projects')
      await page.getByPlaceholder('Search by project name').fill('Palm')
      await expect(page).toHaveURL(/\/catalog\/projects\?search=Palm/)
      await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()
    })

    await test.step('Сбросить фильтры и проверить URL без query-параметров', async () => {
      await page.getByPlaceholder('Search by project name').blur()
      await page.getByRole('button', { name: 'Clear filters' }).click()
      await expect(page).toHaveURL('/catalog/projects')
      await expect(page.getByPlaceholder('Search by project name')).toHaveValue('')
    })
  })
})
