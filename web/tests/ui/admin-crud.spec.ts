import { expect, test } from '@playwright/test'
import { authenticateAdminContext } from './helpers/adminAuth'
import {
  clickRowAction,
  confirmDeleteModal,
  createSeedCity,
  createSeedProject,
  formatPriceAed,
  resolveBaseUrl,
  rowWithText,
  selectOptionInDropdown,
  uniq,
} from './helpers/adminUi'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z6qkAAAAASUVORK5CYII=',
  'base64'
)

test.describe('Админка UI: CRUD', () => {
  test.beforeEach(async ({ context }, testInfo) => {
    await authenticateAdminContext(context, resolveBaseUrl(testInfo))
  })

  test('Cities: create/read/update/delete', async ({ page }) => {
    const suffix = uniq('city')
    const name = `UI City ${suffix}`
    const editedName = `${name} Edited`

    await page.goto('/admin/cities')

    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByLabel('Name', { exact: true }).fill(name)
    await page.getByRole('button', { name: 'Create City', exact: true }).click()

    await expect(rowWithText(page, name)).toBeVisible()

    await clickRowAction(page, name, 'Edit')
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Cities' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Developers: create/read/update/delete', async ({ page }) => {
    const suffix = uniq('developer')
    const name = `UI Developer ${suffix}`
    const editedName = `${name} Edited`

    await page.goto('/admin/developers')

    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByLabel('Name', { exact: true }).fill(name)
    await page.getByRole('button', { name: 'Create Developer', exact: true }).click()

    await expect(rowWithText(page, name)).toBeVisible()

    await clickRowAction(page, name, 'Edit')
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Developers' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Badges: create/read/update/delete', async ({ page }) => {
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
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Badges' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Infrastructures: create/read/update/delete', async ({ page }) => {
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
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Infrastructures' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Areas: create/read/update/delete', async ({ page, request }) => {
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
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(areaName)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Areas' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Projects: create/read/update/delete', async ({ page }) => {
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
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name)
    await page.getByLabel('Name', { exact: true }).fill(editedName)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, editedName)).toBeVisible()

    await clickRowAction(page, editedName, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Projects' })).toBeVisible()
    await expect(rowWithText(page, editedName)).toBeVisible()
  })

  test('Lots: create/read/update/delete', async ({ page, request }) => {
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
    await expect(page.getByLabel('Our Price (AED)', { exact: true })).toHaveValue(String(priceFromUs))
    await page.getByLabel('Our Price (AED)', { exact: true }).fill(String(updatedPriceFromUs))
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(rowWithText(page, updatedPriceLabel)).toBeVisible()

    await clickRowAction(page, updatedPriceLabel, 'Delete')
    await confirmDeleteModal(page)
    await expect(page.getByRole('heading', { name: 'Deleted Lots' })).toBeVisible()
    await expect(rowWithText(page, updatedPriceLabel)).toBeVisible()
  })

  test('Media: upload/delete', async ({ page }) => {
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

  test('Team: invite/update/remove', async ({ page }) => {
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
