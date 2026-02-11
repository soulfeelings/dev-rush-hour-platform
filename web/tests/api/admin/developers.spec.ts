import { test, expect } from '../fixtures/test';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

test.describe('admin/developers', () => {
  test('create → developer is created and saved in DB', async ({ api, db }) => {
    const suffix = uniq();
    const nameRandom = `testName-${suffix}`;
    const slugRandom = `testSlug-${suffix}`;

    let developerId: string;

    await test.step('POST /api/admin/developers → create developer', async () => {
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

    await test.step('DB → developer record exists and is correct', async () => {
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
});
