import { test, expect } from '../fixtures/test';
import {
  expectApiErrorResponse,
  expectRequiredFieldRejections,
  invalidTypeValue,
  uniq,
} from '../helpers/assertions';

test.describe('Админка / Районы', () => {
  // Проверяем успешное создание района и сохранение в БД.
  test('Создание: район создаётся и сохраняется в БД', async ({ api, db }) => {
    const suffix = uniq();
    const name = `test-area-name-${suffix}`;
    const slug = `test-area-slug-${suffix}`;
    const city = `Test City ${suffix}`;
    const lat = 25.2048;
    const lng = 55.2708;

    let areaId: string;

    await test.step('POST /api/admin/areas: создать район', async () => {
      const response = await api.admin.areas.create({
        slug,
        name,
        city,
        lat,
        lng,
        status: 'active',
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

    await test.step('Проверить в БД, что запись района создана корректно', async () => {
      const dbResult = await db.query(
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

  // Проверяем, что API не допускает дублирование slug для района.
  test('Создание: дублирующийся slug района отклоняется (ограничение уникальности)', async ({ api, db }) => {
    const suffix = uniq();
    const slug = `test-area-dup-slug-${suffix}`;
    const city = `Test City ${suffix}`;
    const lat = 25.2048;
    const lng = 55.2708;

    await test.step('POST /api/admin/areas: создать первый район', async () => {
      const response = await api.admin.areas.create({
        slug,
        name: `test-area-first-${suffix}`,
        city,
        lat,
        lng,
        status: 'active',
      });

      expect(response.status()).toBe(201);
    });

    await test.step('POST /api/admin/areas: создать второй район с тем же slug и получить ошибку', async () => {
      const response = await api.admin.areas.create({
        slug,
        name: `test-area-second-${suffix}`,
        city,
        lat,
        lng,
        status: 'active',
      });

      await expectApiErrorResponse(response, {
        minStatus: 400,
        messageIncludes: 'duplicate',
      });
    });

    await test.step('Проверить в БД, что для slug существует только одна запись', async () => {
      const dbResult = await db.query(
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

  // Проверяем, что API отклоняет некорректные значения обязательных полей района.
  test('Создание: обязательные поля района валидируются', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-area-slug-${suffix}`,
      name: `required-area-name-${suffix}`,
      city: `Required Area City ${suffix}`,
      lat: 25.2048,
      lng: 55.2708,
      status: 'active',
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/areas',
      create: (payload) => api.admin.areas.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
        { field: 'city', payload: { ...validPayload, city: invalidTypeValue() } },
        { field: 'lat', payload: { ...validPayload, lat: invalidTypeValue() } },
        { field: 'lng', payload: { ...validPayload, lng: invalidTypeValue() } },
      ],
    });
  });
});
