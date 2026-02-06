import { test, expect } from '@playwright/test';
import { query } from '../_helpers/db';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

test('POST /api/admin/areas → area is created and saved in DB', async ({ request }) => {
  const apiUrl = '/api/admin/areas';

  const suffix = uniq();
  const name = `test-area-name-${suffix}`;
  const slug = `test-area-slug-${suffix}`;
  const city = `Test City ${suffix}`;
  const lat = 25.2048;
  const lng = 55.2708;

  let areaId: string;

  await test.step('POST /api/admin/areas → create area', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name,
        city,
        lat,
        lng,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    areaId = body.id;

    expect(areaId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.slug).toBe(slug);
    expect(body.city).toBe(city);
    expect(body.status).toBe('active');
    expect(body.deletedAt).toBeNull();
    expect(body.lat).toBeCloseTo(lat, 4);
    expect(body.lng).toBeCloseTo(lng, 4);
  });

  await test.step('DB → areas record exists and is correct', async () => {
    const dbResult = await query(
      `
      SELECT
        id,
        slug,
        name,
        city,
        lat,
        lng,
        status,
        data,
        deleted_at
      FROM areas
      WHERE id = $1
      `,
      [areaId]
    );

    expect(dbResult.length).toBe(1);

    const dbArea = dbResult[0];
    expect(dbArea.id).toBe(areaId);
    expect(dbArea.slug).toBe(slug);
    expect(dbArea.name).toBe(name);
    expect(dbArea.city).toBe(city);
    expect(dbArea.status).toBe('active');
    expect(dbArea.deleted_at).toBeNull();
    expect(Number(dbArea.lat)).toBeCloseTo(lat, 4);
    expect(Number(dbArea.lng)).toBeCloseTo(lng, 4);
    expect(dbArea.data).toMatchObject({});
  });
});

test('POST /api/admin/areas → duplicate slug is rejected (DB unique constraint)', async ({ request }) => {
  const apiUrl = '/api/admin/areas';

  const suffix = uniq();
  const slug = `test-area-dup-slug-${suffix}`;
  const city = `Test City ${suffix}`;
  const lat = 25.2048;
  const lng = 55.2708;

  await test.step('POST /api/admin/areas → create first area', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-area-first-${suffix}`,
        city,
        lat,
        lng,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);
  });

  await test.step('POST /api/admin/areas → create second area with same slug should fail', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-area-second-${suffix}`,
        city,
        lat,
        lng,
        status: 'active',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.error?.message).toContain('duplicate');
  });

  await test.step('DB → only one areas record exists for slug', async () => {
    const dbResult = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM areas
      WHERE slug = $1
      `,
      [slug]
    );

    expect(Number(dbResult[0].count)).toBe(1);
  });
});

