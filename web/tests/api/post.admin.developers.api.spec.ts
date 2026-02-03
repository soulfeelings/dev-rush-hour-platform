import { test, expect } from '@playwright/test';
import { query } from '../_helpers/db';

test('Create Aries Post API Test', async ({ request }) => {
  const apiDevelopmentUrl = '/api/admin/developers';

  const nameRandom = 'testName' + Math.floor(Math.random() * 1000);
  const slugRandom = 'testSlug' + Math.floor(Math.random() * 1000);

  let developerId: string;

  await test.step('POST /api/admin/developers → create developer', async () => {
    const response = await request.post(apiDevelopmentUrl, {
      data: {
        name: nameRandom,
        slug: slugRandom,
        status: 'active'
      }
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
    const dbResult = await query(
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