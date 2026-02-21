import { test, expect } from '../fixtures/test';
import {
  expectApiErrorResponse,
  expectRequiredFieldRejections,
  invalidTypeValue,
  uniq,
} from '../helpers/assertions';

test.describe('Админка / Города', () => {
  // Проверяем успешное создание города и сохранение в БД.
  test('Создание: город создаётся и сохраняется в БД', async ({ api, db }) => {
    const suffix = uniq();
    const name = `test-city-name-${suffix}`;
    const slug = `test-city-slug-${suffix}`;

    let cityId: string;

    await test.step('POST /api/admin/cities: создать город', async () => {
      const response = await api.admin.cities.create({
        slug,
        name
      });

      expect(response.status()).toBe(201);

      const body = await response.json();
      cityId = body.id;

      expect(cityId).toBeTruthy();
      expect(body.name).toBe(name);
      expect(body.slug).toBe(slug);
    });

    await test.step('Проверить в БД, что запись города создана корректно', async () => {
      const dbResult = await db.query(
        `
        SELECT id, name, slug, deleted_at
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
      expect(dbCity.deleted_at).toBeNull();
    });
  });

  // Проверяем, что API не допускает дублирование slug для города.
  test('Создание: дублирующийся slug города отклоняется (ограничение уникальности)', async ({ api, db }) => {
    const suffix = uniq();
    const slug = `test-city-dup-slug-${suffix}`;

    await test.step('POST /api/admin/cities: создать первый город', async () => {
      const response = await api.admin.cities.create({
        slug,
        name: `test-city-first-${suffix}`,
      });

      expect(response.status()).toBe(201);
    });

    await test.step('POST /api/admin/cities: создать второй город с тем же slug и получить ошибку', async () => {
      const response = await api.admin.cities.create({
        slug,
        name: `test-city-second-${suffix}`,
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
        FROM cities
        WHERE slug = $1
        `,
        [slug]
      );

      expect(Number(dbResult[0].count)).toBe(1);
    });
  });

  // Проверяем, что API отклоняет некорректные значения обязательных полей города.
  test('Создание: обязательные поля города валидируются', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-city-slug-${suffix}`,
      name: `required-city-name-${suffix}`,
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/cities',
      create: (payload) => api.admin.cities.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
      ],
    });
  });
});
