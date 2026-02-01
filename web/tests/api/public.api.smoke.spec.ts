import { test, expect } from '@playwright/test';

const endpoints = [
  { path: '/api/projects', type: 'array' as const},
  { path: '/api/lots', type: 'object' as const },
  { path: '/api/filters/options', type: 'object' as const }
];

for (const e of endpoints) {
  test(`GET ${e.path}`, async ({ request }) => {
    const response = await request.get(e.path);
    expect(response.status()).toBe(200);

    const body = await response.json();

    if (e.type === 'array') {
      expect(Array.isArray(body)).toBe(true);
    } else {
      expect(body).toBeTruthy();
      expect(Array.isArray(body)).toBe(false);
      expect(typeof body).toBe('object');
    }
  });
}
