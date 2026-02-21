import { test, expect } from '../fixtures/test';
import { expectRequiredFieldRejections, invalidTypeValue, uniq } from '../helpers/assertions';

test.describe('Админка / Застройщики', () => {
  // Проверяем успешное создание застройщика и сохранение в БД.
  test('Создание: застройщик создаётся и сохраняется в БД', async ({ api, db }) => {
    const suffix = uniq();
    const nameRandom = `testName-${suffix}`;
    const slugRandom = `testSlug-${suffix}`;

    let developerId: string;

    await test.step('POST /api/admin/developers: создать застройщика', async () => {
      const response = await api.admin.developers.create({
        name: nameRandom,
        slug: slugRandom,
        status: 'active'
      });

      expect(response.status()).toBe(201);

      const responseBody = await response.json();

      developerId = responseBody.id;

      expect(developerId).toBeTruthy();
      expect(responseBody.name).toBe(nameRandom);
      expect(responseBody.slug).toBe(slugRandom);
      expect(responseBody.status).toBe('active');
    });

    await test.step('Проверить в БД, что запись застройщика создана корректно', async () => {
      const dbResult = await db.query(
        `
        SELECT id, name, slug, status, deleted_at
        FROM developers
        WHERE id = $1
        `,
        [developerId]
      );

      expect(dbResult.length).toBe(1);

      const dbDeveloper = dbResult[0];
      expect(dbDeveloper.name).toBe(nameRandom);
      expect(dbDeveloper.slug).toBe(slugRandom);
      expect(dbDeveloper.status).toBe('active');
      expect(dbDeveloper.deleted_at).toBeNull();
    });
  });

  // Проверяем, что API отклоняет некорректные значения обязательных полей застройщика.
  test('Создание: обязательные поля застройщика валидируются', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-developer-slug-${suffix}`,
      name: `required-developer-name-${suffix}`,
      status: 'active',
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/developers',
      create: (payload) => api.admin.developers.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
      ],
    });
  });
});
