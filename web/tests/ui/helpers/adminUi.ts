import { expect, type APIRequestContext, type Locator, type Page, type TestInfo } from '@playwright/test'
import { buildAdminCookieHeader } from './adminAuth'

export function resolveBaseUrl(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL
  if (!baseURL || typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL is required for admin UI tests')
  }
  return baseURL
}

export function uniq(prefix: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${ts}-${rand}`
}

export function rowWithText(page: Page, text: string): Locator {
  return page.locator('tbody tr').filter({ hasText: text }).first()
}

export function formatPriceAed(value: number): string {
  return `${new Intl.NumberFormat('en-US').format(value)} AED`
}

export async function selectOptionInDropdown(page: Page, label: string, optionText: string): Promise<void> {
  await page.getByLabel(label, { exact: true }).click()
  const dropdown = page.locator('[id^="dropdown-"]').last()
  await expect(dropdown).toBeVisible()
  await dropdown.getByText(optionText, { exact: true }).click()
}

export async function clickRowAction(
  page: Page,
  rowText: string,
  action: 'Edit' | 'Delete'
): Promise<void> {
  const row = rowWithText(page, rowText)
  await expect(row).toBeVisible()
  await row.hover()
  await row.getByRole('button', { name: action, exact: true }).click()
}

export async function confirmDeleteModal(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible()
  await page.getByRole('button', { name: /^Delete$/ }).click()
}

async function adminPostJson<T>(
  request: APIRequestContext,
  path: string,
  payload: Record<string, unknown>
): Promise<T> {
  const response = await request.post(path, {
    headers: buildAdminCookieHeader(),
    data: payload,
  })

  const rawBody = await response.text()
  expect(
    response.ok(),
    `Seed request failed for ${path}: ${response.status()} ${rawBody}`
  ).toBeTruthy()

  return JSON.parse(rawBody) as T
}

export async function createSeedCity(
  request: APIRequestContext,
  suffix: string
): Promise<{ id: string; name: string; slug: string }> {
  const name = `UI City ${suffix}`
  const slug = `ui-city-${suffix}`

  return adminPostJson<{ id: string; name: string; slug: string }>(request, '/api/admin/cities', {
    name,
    slug,
  })
}

export async function createSeedProject(
  request: APIRequestContext,
  suffix: string
): Promise<{ id: string; name: string; slug: string }> {
  const name = `UI Project ${suffix}`
  const slug = `ui-project-${suffix}`

  return adminPostJson<{ id: string; name: string; slug: string }>(request, '/api/admin/projects', {
    name,
    slug,
    sale: 'sale',
  })
}
