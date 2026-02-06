import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { query } from '../_helpers/db';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

async function createProject(request: any, suffix: string): Promise<string> {
  const response = await request.post('/api/admin/projects', {
    data: {
      slug: `test-project-slug-${suffix}`,
      name: `test-project-name-${suffix}`,
      status: 'active',
      sale: 'sale',
    },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body?.id).toBeTruthy();

  return body.id;
}

test('POST /api/admin/lots → lot is created and saved in DB', async ({ request }) => {
  const apiUrl = '/api/admin/lots';

  const suffix = uniq();
  const projectId = await createProject(request, suffix);

  const bedrooms = 1;
  const bathrooms = 1;
  const areaSqm = 50;
  const floor = 3;
  const priceAmount = 1_000_000;
  const priceCurrency = 'AED';
  const type = 'apartment';

  let lotId: string;

  await test.step('POST /api/admin/lots → create lot', async () => {
    const response = await request.post(apiUrl, {
      data: {
        projectId,
        type,
        bedrooms,
        bathrooms,
        areaSqm,
        floor,
        priceCurrency,
        priceAmount,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    lotId = body.id;

    expect(lotId).toBeTruthy();
    expect(body.projectId).toBe(projectId);
    expect(body.type).toBe(type);
    expect(body.status).toBe('active');
    expect(body.deletedAt).toBeNull();
    expect(body.priceCurrency).toBe(priceCurrency);
    expect(body.priceAmount).toBeCloseTo(priceAmount, 2);
    expect(body.bedrooms).toBe(bedrooms);
    expect(body.bathrooms).toBe(bathrooms);
    expect(body.areaSqm).toBeCloseTo(areaSqm, 2);
    expect(body.floor).toBe(floor);
  });

  await test.step('DB → lots record exists and is correct', async () => {
    const dbResult = await query(
      `
      SELECT
        id,
        project_id,
        type,
        status,
        bedrooms,
        bathrooms,
        area_sqm,
        floor,
        price_currency,
        price_amount,
        bonus_keys,
        data,
        deleted_at
      FROM lots
      WHERE id = $1
      `,
      [lotId]
    );

    expect(dbResult.length).toBe(1);

    const dbLot = dbResult[0];
    expect(dbLot.id).toBe(lotId);
    expect(dbLot.project_id).toBe(projectId);
    expect(dbLot.type).toBe(type);
    expect(dbLot.status).toBe('active');
    expect(dbLot.bedrooms).toBe(bedrooms);
    expect(dbLot.bathrooms).toBe(bathrooms);
    expect(Number(dbLot.area_sqm)).toBeCloseTo(areaSqm, 2);
    expect(dbLot.floor).toBe(floor);
    expect(dbLot.price_currency).toBe(priceCurrency);
    expect(Number(dbLot.price_amount)).toBeCloseTo(priceAmount, 2);
    expect(dbLot.bonus_keys).toEqual([]);
    expect(dbLot.data).toMatchObject({});
    expect(dbLot.deleted_at).toBeNull();
  });
});

test('POST /api/admin/lots → duplicate business key is rejected (DB unique index)', async ({ request }) => {
  const apiUrl = '/api/admin/lots';

  const suffix = uniq();
  const projectId = await createProject(request, suffix);

  const bedrooms = 2;
  const bathrooms = 2;
  const areaSqm = 60;
  const floor = 5;
  const priceAmount = 2_000_000;
  const priceCurrency = 'AED';
  const type = 'apartment';

  await test.step('POST /api/admin/lots → create first lot', async () => {
    const response = await request.post(apiUrl, {
      data: {
        projectId,
        type,
        bedrooms,
        bathrooms,
        areaSqm,
        floor,
        priceCurrency,
        priceAmount,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);
  });

  await test.step('POST /api/admin/lots → create second lot with same business key should fail', async () => {
    const response = await request.post(apiUrl, {
      data: {
        projectId,
        type,
        bedrooms,
        bathrooms,
        areaSqm,
        floor,
        priceCurrency,
        priceAmount,
        status: 'active',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.error?.message).toContain('uniq_lots_project_spec');
  });

  await test.step('DB → only one lots record exists for business key', async () => {
    const dbResult = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM lots
      WHERE project_id = $1
        AND type = $2
        AND bedrooms = $3
        AND bathrooms = $4
        AND area_sqm = $5
        AND floor = $6
        AND price_amount = $7
      `,
      [projectId, type, bedrooms, bathrooms, areaSqm, floor, priceAmount]
    );

    expect(Number(dbResult[0].count)).toBe(1);
  });
});

test('POST /api/admin/lots → invalid projectId is rejected (DB foreign key constraint)', async ({ request }) => {
  const apiUrl = '/api/admin/lots';

  const projectId = randomUUID();

  await test.step('POST /api/admin/lots → create lot with non-existent projectId should fail', async () => {
    const response = await request.post(apiUrl, {
      data: {
        projectId,
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 45,
        floor: 2,
        priceCurrency: 'AED',
        priceAmount: 900_000,
        status: 'active',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.error?.message).toContain('foreign key');
  });

  await test.step('DB → no lots record exists for non-existent projectId', async () => {
    const dbResult = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM lots
      WHERE project_id = $1
      `,
      [projectId]
    );

    expect(Number(dbResult[0].count)).toBe(0);
  });
});
