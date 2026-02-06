import { test, expect } from '@playwright/test';
import { query } from '../_helpers/db';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

test('POST /api/admin/cities → city is created and saved in DB', async ({ request }) => {
  const apiUrl = '/api/admin/cities';

  const suffix = uniq();
  const name = `test-city-name-${suffix}`;
  const slug = `test-city-slug-${suffix}`;

  let cityId: string;

  await test.step('POST /api/admin/cities → create city', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    cityId = body.id;

    expect(cityId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.slug).toBe(slug);
    expect(body.status).toBe('active');
  });

  await test.step('DB → cities record exists and is correct', async () => {
    const dbResult = await query(
      `
      SELECT id, name, slug, status, deleted_at
      FROM cities
      WHERE id = $1
      `,
      [cityId]
    );

    expect(dbResult.length).toBe(1);

    const dbCity = dbResult[0];
    expect(dbCity.id).toBe(cityId);
    expect(dbCity.name).toBe(name);
    expect(dbCity.slug).toBe(slug);
    expect(dbCity.status).toBe('active');
    expect(dbCity.deleted_at).toBeNull();
  });
});

test('POST /api/admin/cities → duplicate slug is rejected (DB unique constraint)', async ({ request }) => {
  const apiUrl = '/api/admin/cities';

  const suffix = uniq();
  const slug = `test-city-dup-slug-${suffix}`;

  await test.step('POST /api/admin/cities → create first city', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-city-first-${suffix}`,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);
  });

  await test.step('POST /api/admin/cities → create second city with same slug should fail', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-city-second-${suffix}`,
        status: 'active',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.error?.message).toContain('duplicate');
  });

  await test.step('DB → only one cities record exists for slug', async () => {
    const dbResult = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM cities
      WHERE slug = $1
      `,
      [slug]
    );

    expect(Number(dbResult[0].count)).toBe(1);
  });
});

