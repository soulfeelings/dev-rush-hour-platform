import { test, expect } from '../fixtures/test';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

test.describe('admin/projects', () => {
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
        status: 'active',
        sale: saleValue
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      projectId = body.id;

      expect(projectId).toBeTruthy();
      expect(body.name).toBe(nameRandom);
      expect(body.slug).toBe(slugRandom);
      expect(body.status).toBe('active');
      expect(body.data).toBeDefined();
      expect(body.data.isFeatured).toBe(false);
      expect(body.data.isRecommended).toBe(false);
      expect(body.deletedAt).toBeNull();
    });

    await test.step('DB → projects record exists and is correct', async () => {
      const dbResult = await db.query(
        `
        SELECT
          id,
          name,
          slug,
          status,
          sale,
          data,
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
      expect(dbProject.status).toBe('active');
      expect(dbProject.sale).toBe(saleValue);
      expect(dbProject.deleted_at).toBeNull();

      // jsonb check
      expect(dbProject.data).toMatchObject({
        isFeatured: false,
        isRecommended: false
      });
    });
  });
});
