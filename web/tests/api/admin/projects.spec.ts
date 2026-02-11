import { test, expect } from '../fixtures/test';
import { expectRequiredFieldRejections, invalidTypeValue, uniq } from '../helpers/assertions';

test.describe('admin/projects', () => {
  // Проверяем успешное создание проекта и сохранение данных в БД.
  test('create → project is created and saved in DB', async ({ api, db }) => {
    const suffix = uniq();
    const nameRandom = `testName-${suffix}`;
    const slugRandom = `testSlug-${suffix}`;
    const saleValue = 'sale';

    let projectId: string;

    await test.step('POST /api/admin/projects → create project', async () => {
      const response = await api.admin.projects.create({
        slug: slugRandom,
        name: nameRandom,
        sale: saleValue
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      projectId = body.id;

      expect(projectId).toBeTruthy();
      expect(body.name).toBe(nameRandom);
      expect(body.slug).toBe(slugRandom);
      expect(body.deletedAt).toBeNull();
    });

    await test.step('DB → projects record exists and is correct', async () => {
      const dbResult = await db.query(
        `
        SELECT
          id,
          name,
          slug,
          sale,
          deleted_at
        FROM projects
        WHERE id = $1
        `,
        [projectId]
      );

      expect(dbResult.length).toBe(1);

      const dbProject = dbResult[0];

      expect(dbProject.id).toBe(projectId);
      expect(dbProject.name).toBe(nameRandom);
      expect(dbProject.slug).toBe(slugRandom);
      expect(dbProject.sale).toBe(saleValue);
      expect(dbProject.deleted_at).toBeNull();
    });
  });

  // Проверяем, что API отклоняет некорректные значения обязательных полей проекта.
  test('create → required fields are validated', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-project-slug-${suffix}`,
      name: `required-project-name-${suffix}`,
      sale: 'sale',
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/projects',
      create: (payload) => api.admin.projects.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
      ],
    });
  });
});
