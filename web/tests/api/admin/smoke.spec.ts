import { test, expect } from '../fixtures/test';

const endpoints = [
  { path: '/api/admin/projects', type: 'array' as const },
  { path: '/api/admin/lots', type: 'object' as const },
  { path: '/api/admin/cities', type: 'array' as const },
  { path: '/api/admin/developers', type: 'array' as const },
  { path: '/api/admin/areas', type: 'array' as const },
  { path: '/api/admin/badges', type: 'array' as const },
];

test.describe('admin/smoke', { tag: '@smoke' }, () => {
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
