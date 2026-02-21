import { test, expect } from '../fixtures/test';
import {
  expectApiErrorResponse,
  expectRequiredFieldRejections,
  invalidTypeValue,
  uniq,
} from '../helpers/assertions';

test.describe('Админка / Бейджи', () => {
  // Проверяем успешное создание бейджа и сохранение в БД.
  test('Создание: бейдж создаётся и сохраняется в БД', async ({ api, db }) => {
    const suffix = uniq();
    const name = `test-badge-name-${suffix}`;
    const slug = `test-badge-slug-${suffix}`;

    let badgeId: string;
    
    await test.step('POST /api/admin/badges: создать бейдж', async () => {
      const response = await api.admin.badges.create({
        slug,
        name
      });

      expect(response.status()).toBe(201);    

      const body = await response.json();
      badgeId = body.id;

      expect(badgeId).toBeTruthy();
      expect(body.name).toBe(name);
      expect(body.slug).toBe(slug);
      expect(body.backgroundColor).toBe('#000000');
      expect(body.textColor).toBe('#FFFFFF');
      expect(body.sortOrder).toBe(0);
    });

    await test.step('Проверить в БД, что запись бейджа создана корректно', async () => {
      const dbResult = await db.query(
        `
        SELECT
          id,
          slug,
          name,
          background_color,
          text_color,
          icon,
          sort_order,
          deleted_at
        FROM badges
        WHERE id = $1
        `,
        [badgeId]
      );

      expect(dbResult.length).toBe(1);

      const dbBadge = dbResult[0];
      expect(dbBadge.id).toBe(badgeId);
      expect(dbBadge.slug).toBe(slug);
      expect(dbBadge.name).toBe(name);
      expect(dbBadge.background_color).toBe('#000000');
      expect(dbBadge.text_color).toBe('#FFFFFF');
      expect(dbBadge.icon).toBeNull();
      expect(dbBadge.sort_order).toBe(0);
      expect(dbBadge.deleted_at).toBeNull();
    });
  });

  // Проверяем, что API не допускает дублирование slug для бейджа.
  test('Создание: дублирующийся slug бейджа отклоняется (ограничение уникальности)', async ({ api, db }) => {
    const suffix = uniq();
    const slug = `test-badge-dup-slug-${suffix}`;

    await test.step('POST /api/admin/badges: создать первый бейдж', async () => {
      const response = await api.admin.badges.create({
        slug,
        name: `test-badge-first-${suffix}`,
      });

      expect(response.status()).toBe(201);
    });

    await test.step('POST /api/admin/badges: создать второй бейдж с тем же slug и получить ошибку', async () => {
      const response = await api.admin.badges.create({
        slug,
        name: `test-badge-second-${suffix}`,
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
        FROM badges
        WHERE slug = $1
        `,
        [slug]
      );

      expect(Number(dbResult[0].count)).toBe(1);
    });
  });

  // Проверяем, что API отклоняет некорректные значения обязательных полей бейджа.
  test('Создание: обязательные поля бейджа валидируются', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-badge-slug-${suffix}`,
      name: `required-badge-name-${suffix}`,
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/badges',
      create: (payload) => api.admin.badges.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
      ],
    });
  });
});
