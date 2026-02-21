import { createHmac } from 'node:crypto'
import {
  test,
  expect,
  type APIRequestContext,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test'

const ADMIN_COOKIE_NAME = 'rh_admin_jwt'
const DEFAULT_ADMIN_EMAIL = 'ui-tests@local'
const DEFAULT_ADMIN_ROLE = 'superadmin'
const DEFAULT_JWT_TTL_SECONDS = 15 * 60
const DEV_DEFAULT_JWT_SECRET = 'dev-secret-change-in-production'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z6qkAAAAASUVORK5CYII=',
  'base64'
)

function resolveBaseUrl(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL
  if (!baseURL || typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL is required for admin UI tests')
  }
  return baseURL
}

function asPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function signHs256(headerPart: string, payloadPart: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest('base64url')
}

function buildAdminJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' }

  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = asPositiveInt(process.env.API_ADMIN_JWT_TTL_SECONDS, DEFAULT_JWT_TTL_SECONDS)
  const payload = {
    sub: process.env.API_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL,
    iat: now,
    exp: now + ttlSeconds,
    role: process.env.API_ADMIN_ROLE ?? DEFAULT_ADMIN_ROLE,
    permissions: [] as string[],
  }

  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const secret = process.env.API_ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? DEV_DEFAULT_JWT_SECRET
  const signature = signHs256(encodedHeader, encodedPayload, secret)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function getAdminJwtToken(): string {
  return process.env.API_ADMIN_JWT ?? buildAdminJwt()
}

function buildAdminCookieHeader(): Record<string, string> {
  return { Cookie: `${ADMIN_COOKIE_NAME}=${getAdminJwtToken()}` }
}

async function authenticateAdmin(context: BrowserContext, baseURL: string): Promise<void> {
  await context.addCookies([
    {
      name: ADMIN_COOKIE_NAME,
      value: getAdminJwtToken(),
      url: baseURL,
    },
  ])
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

async function createSeedCity(
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

async function createSeedProject(
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

function uniq(prefix: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${ts}-${rand}`
}

function rowWithText(page: Page, text: string): Locator {
  return page.locator('tbody tr').filter({ hasText: text }).first()
}

function formatPriceAed(value: number): string {
  return `${new Intl.NumberFormat('en-US').format(value)} AED`
}

async function selectOptionInDropdown(page: Page, label: string, optionText: string): Promise<void> {
  await page.getByLabel(label, { exact: true }).click()
  const dropdown = page.locator('[id^="dropdown-"]').last()
  await expect(dropdown).toBeVisible()
  await dropdown.getByText(optionText, { exact: true }).click()
}

async function clickRowAction(
  page: Page,
  rowText: string,
  action: 'Edit' | 'Delete'
): Promise<void> {
  const row = rowWithText(page, rowText)
  await expect(row).toBeVisible()
  await row.hover()
  await row.getByRole('button', { name: action, exact: true }).click()
}

async function confirmDeleteModal(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible()
  await page.getByRole('button', { name: /^Delete$/ }).click()
}

test.describe('Админка UI', () => {
  test('Гость перенаправляется на /admin/auth', async ({ page }) => {
    await page.goto('/admin/projects')

    await expect(page).toHaveURL(/\/admin\/auth$/)
    await expect(page.getByRole('heading', { name: 'Admin Access' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in with Microsoft' })).toBeVisible()
  })

  test.describe('Авторизованный администратор', () => {
    test.beforeEach(async ({ context }, testInfo) => {
      await authenticateAdmin(context, resolveBaseUrl(testInfo))
    })

    test('Навигация: все разделы админки доступны', async ({ page }) => {
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

      await page.goto('/admin/projects')
      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

      for (const section of sections) {
        await page.getByRole('button', { name: section.nav, exact: true }).click()
        await expect(page).toHaveURL(section.url)
        await expect(page.getByRole('heading', { name: section.title, exact: true })).toBeVisible()
      }
    })

    test('Cities: создание, редактирование и удаление', async ({ page }) => {
      const suffix = uniq('city')
      const name = `UI City ${suffix}`
      const editedName = `${name} Edited`

      await page.goto('/admin/cities')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(name)
      await page.getByRole('button', { name: 'Create City', exact: true }).click()

      await expect(rowWithText(page, name)).toBeVisible()

      await clickRowAction(page, name, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Cities' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Developers: создание, редактирование и удаление', async ({ page }) => {
      const suffix = uniq('developer')
      const name = `UI Developer ${suffix}`
      const editedName = `${name} Edited`

      await page.goto('/admin/developers')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(name)
      await page.getByRole('button', { name: 'Create Developer', exact: true }).click()

      await expect(rowWithText(page, name)).toBeVisible()

      await clickRowAction(page, name, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Developers' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Badges: создание, редактирование и удаление', async ({ page }) => {
      const suffix = uniq('badge')
      const name = `UI Badge ${suffix}`
      const editedName = `${name} Edited`

      await page.goto('/admin/badges')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(name)
      await page.getByLabel('Sort Order', { exact: true }).fill('10')
      await page.getByRole('button', { name: 'Create Badge', exact: true }).click()

      await expect(rowWithText(page, name)).toBeVisible()

      await clickRowAction(page, name, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Badges' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Infrastructures: создание, редактирование и удаление', async ({ page }) => {
      const suffix = uniq('infrastructure')
      const name = `UI Infrastructure ${suffix}`
      const editedName = `${name} Edited`

      await page.goto('/admin/infrastructures')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(name)
      await page.getByLabel('Sort Order', { exact: true }).fill('10')
      await page.getByRole('button', { name: 'Create Infrastructure', exact: true }).click()

      await expect(rowWithText(page, name)).toBeVisible()

      await clickRowAction(page, name, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Infrastructures' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Areas: создание, редактирование и удаление', async ({ page, request }) => {
      const suffix = uniq('area')
      const areaName = `UI Area ${suffix}`
      const editedName = `${areaName} Edited`
      const seedCity = await createSeedCity(request, suffix)

      await page.goto('/admin/areas')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(areaName)
      await selectOptionInDropdown(page, 'City', seedCity.name)

      const map = page.locator('.leaflet-container').last()
      await expect(map).toBeVisible()
      await map.click({ position: { x: 80, y: 80 } })
      await map.click({ position: { x: 180, y: 80 } })
      await map.click({ position: { x: 130, y: 170 } })

      await expect(page.getByText('Boundary polygon (3 points)')).toBeVisible()
      await page.getByRole('button', { name: 'Create Area', exact: true }).click()

      await expect(rowWithText(page, areaName)).toBeVisible()

      await clickRowAction(page, areaName, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Areas' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Projects: создание, редактирование и удаление', async ({ page }) => {
      const suffix = uniq('project')
      const name = `UI Project ${suffix}`
      const editedName = `${name} Edited`

      await page.goto('/admin/projects')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await page.getByLabel('Name', { exact: true }).fill(name)
      await selectOptionInDropdown(page, 'Status', 'Active')
      await selectOptionInDropdown(page, 'Sale Status', 'Sale')
      await page
        .getByLabel('Hover Image URL', { exact: true })
        .fill(`https://example.com/ui-hover-${suffix}.png`)
      await page.getByRole('button', { name: 'Create Project', exact: true }).click()

      await expect(rowWithText(page, name)).toBeVisible()

      await clickRowAction(page, name, 'Edit')
      await page.getByLabel('Name', { exact: true }).fill(editedName)
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, editedName)).toBeVisible()

      await clickRowAction(page, editedName, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Projects' })).toBeVisible()
      await expect(rowWithText(page, editedName)).toBeVisible()
    })

    test('Lots: создание, редактирование и удаление', async ({ page, request }) => {
      const suffix = uniq('lot')
      const seedProject = await createSeedProject(request, suffix)
      const priceFromUs = 1_110_000
      const updatedPriceFromUs = 1_150_000
      const createdPriceLabel = formatPriceAed(priceFromUs)
      const updatedPriceLabel = formatPriceAed(updatedPriceFromUs)

      await page.goto('/admin/lots')

      await page.getByRole('button', { name: 'New', exact: true }).click()
      await selectOptionInDropdown(page, 'Project', seedProject.name)
      await selectOptionInDropdown(page, 'Type', 'Apartment')
      await selectOptionInDropdown(page, 'Status', 'Active')
      await page.getByLabel('Our Price (AED)', { exact: true }).fill(String(priceFromUs))
      await page.getByRole('button', { name: 'Create Lot', exact: true }).click()

      await expect(rowWithText(page, createdPriceLabel)).toBeVisible()

      await clickRowAction(page, createdPriceLabel, 'Edit')
      await page.getByLabel('Our Price (AED)', { exact: true }).fill(String(updatedPriceFromUs))
      await page.getByRole('button', { name: 'Save', exact: true }).click()

      await expect(rowWithText(page, updatedPriceLabel)).toBeVisible()

      await clickRowAction(page, updatedPriceLabel, 'Delete')
      await confirmDeleteModal(page)

      await expect(page.getByRole('heading', { name: 'Deleted Lots' })).toBeVisible()
      await expect(rowWithText(page, updatedPriceLabel)).toBeVisible()
    })

    test('Media: upload и удаление файла', async ({ page }) => {
      const suffix = uniq('media')
      const fileName = `ui-media-${suffix}.png`

      await page.goto('/admin/media')
      await expect(page.getByRole('heading', { name: 'Media' })).toBeVisible()

      await page.locator('input[type="file"]').setInputFiles({
        name: fileName,
        mimeType: 'image/png',
        buffer: ONE_PIXEL_PNG,
      })

      await expect(page.getByText(fileName)).toBeVisible({ timeout: 15_000 })

      const mediaCard = page
        .locator('div')
        .filter({ has: page.locator(`img[alt="${fileName}"]`) })
        .first()
      await mediaCard.getByRole('checkbox').click()
      await page.getByRole('button', { name: /Delete \(1\)/ }).click()

      await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible()
      await page.getByRole('button', { name: /^Delete$/ }).click()

      await expect(page.getByText(fileName)).toHaveCount(0)
    })

    test('Team: invite, edit permissions и remove', async ({ page }) => {
      const suffix = uniq('team')
      const email = `ui-team-${suffix}@example.com`

      await page.goto('/admin/team')
      await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible()

      await page.getByRole('button', { name: 'Invite', exact: true }).click()
      await page.getByLabel('Email', { exact: true }).fill(email)
      await page.getByRole('button', { name: /^Invite$/ }).click()

      await expect(rowWithText(page, email)).toBeVisible()

      const createdRow = rowWithText(page, email)
      await createdRow.locator('button[title="Edit permissions"]').click()

      await expect(page.getByRole('heading', { name: /Edit permissions/ })).toBeVisible()
      const citiesViewCheckbox = page.getByRole('checkbox', { name: 'cities:view' })
      if (!(await citiesViewCheckbox.isChecked())) {
        await citiesViewCheckbox.check()
      }
      await page.getByRole('button', { name: /^Save$/ }).click()

      await expect(rowWithText(page, email)).toContainText(/permission/)

      const updatedRow = rowWithText(page, email)
      await updatedRow.locator('button[title="Remove access"]').click()

      await expect(page.getByRole('heading', { name: 'Remove access' })).toBeVisible()
      await page.getByRole('button', { name: /^Remove$/ }).click()

      await expect(rowWithText(page, email)).toHaveCount(0)
    })
  })
})
