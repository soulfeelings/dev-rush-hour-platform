import { test, expect } from '@playwright/test';

const endpoints = [
  { path: '/api/projects', type: 'array' as const },
  { path: '/api/lots', type: 'object' as const },
  { path: '/api/filters/options', type: 'object' as const },
  { path: '/api/areas', type: 'array' as const },
  { path: '/api/cities', type: 'array' as const },
];

test.describe('API smoke (public core GET)', () => {
  for (const e of endpoints) {
    test(`GET ${e.path}`, async ({ request }) => {
      const resp = await request.get(e.path);
      expect(resp.ok(), `${e.path} should be OK`).toBeTruthy();

      const body = await resp.json();

      if (e.type === 'array') {
        expect(Array.isArray(body), `${e.path} should return array`).toBe(true);
      } else {
        expect(body, `${e.path} should return body`).toBeTruthy();
        expect(Array.isArray(body), `${e.path} should not return array`).toBe(false);
        expect(typeof body, `${e.path} should return object`).toBe('object');
      }
    });
  }
});
