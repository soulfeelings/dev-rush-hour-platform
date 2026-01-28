import { test, expect } from '@playwright/test'
import { createDbPool } from '../_helpers/db'

test('GET /cities matches active cities in DB', async ({ request }) => {
  const response = await request.get('/cities')
  expect(response.ok()).toBeTruthy()

  const apiCities = (await response.json()) as Array<{ slug: string; name: string }>

  const db = createDbPool()
  try {
    const result = await db.query<{
      slug: string
      name: string
    }>(
      "SELECT slug, name FROM cities WHERE status = 'active' AND deleted_at IS NULL ORDER BY name"
    )

    expect(apiCities.length).toBe(result.rows.length)

    if (result.rows.length > 0) {
      expect(apiCities[0].slug).toBe(result.rows[0].slug)
      expect(apiCities[0].name).toBe(result.rows[0].name)
    }
  } finally {
    await db.end()
  }
})
