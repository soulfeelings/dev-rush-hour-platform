import { test, expect } from '@playwright/test';
import { query } from '../_helpers/db';

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

test('POST /api/admin/badges → badge is created and saved in DB', async ({ request }) => {
  const apiUrl = '/api/admin/badges';

  const suffix = uniq();
  const name = `test-badge-name-${suffix}`;
  const slug = `test-badge-slug-${suffix}`;

  let badgeId: string;

  await test.step('POST /api/admin/badges → create badge', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    badgeId = body.id;

    expect(badgeId).toBeTruthy();
    expect(body.name).toBe(name);
    expect(body.slug).toBe(slug);
    expect(body.status).toBe('active');
    expect(body.backgroundColor).toBe('#000000');
    expect(body.textColor).toBe('#FFFFFF');
    expect(body.sortOrder).toBe(0);
  });

  await test.step('DB → badges record exists and is correct', async () => {
    const dbResult = await query(
      `
      SELECT
        id,
        slug,
        name,
        background_color,
        text_color,
        icon,
        status,
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
    expect(dbBadge.status).toBe('active');
    expect(dbBadge.sort_order).toBe(0);
    expect(dbBadge.deleted_at).toBeNull();
  });
});

test('POST /api/admin/badges → duplicate slug is rejected (DB unique constraint)', async ({ request }) => {
  const apiUrl = '/api/admin/badges';

  const suffix = uniq();
  const slug = `test-badge-dup-slug-${suffix}`;

  await test.step('POST /api/admin/badges → create first badge', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-badge-first-${suffix}`,
        status: 'active',
      },
    });

    expect(response.status()).toBe(201);
  });

  await test.step('POST /api/admin/badges → create second badge with same slug should fail', async () => {
    const response = await request.post(apiUrl, {
      data: {
        slug,
        name: `test-badge-second-${suffix}`,
        status: 'active',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.error?.message).toContain('duplicate');
  });

  await test.step('DB → only one badges record exists for slug', async () => {
    const dbResult = await query(
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

