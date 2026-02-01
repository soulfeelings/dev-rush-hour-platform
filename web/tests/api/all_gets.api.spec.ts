import { test, expect } from '@playwright/test';

type Endpoint = {
  path: string;
  type: 'array' | 'object';
  // for detail endpoints provide listPath and param (e.g. 'id' or 'slug')
  listPath?: string;
  paramName?: string;
};

const endpoints: Endpoint[] = [
  // public collection endpoints
  { path: '/api/areas', type: 'array' },
  { path: '/api/cities', type: 'array' },
  { path: '/api/filters/options', type: 'object' },
  { path: '/api/projects', type: 'array' },
  { path: '/api/lots', type: 'object' },
  { path: '/api/developers', type: 'array' },

  // public detail endpoints (resolved from collection)
  { path: '/api/areas/{slug}', type: 'object', listPath: '/api/areas', paramName: 'slug' },
  { path: '/api/projects/{slug}', type: 'object', listPath: '/api/projects', paramName: 'slug' },
  { path: '/api/lots/{id}', type: 'object', listPath: '/api/lots', paramName: 'id' },

  // admin collections (included for local testing; will work without key in local dev)
  { path: '/api/admin/developers', type: 'array' },
  { path: '/api/admin/areas', type: 'array' },
  { path: '/api/admin/cities', type: 'array' },
  { path: '/api/admin/projects', type: 'array' },
  { path: '/api/admin/lots', type: 'array' },
  { path: '/api/admin/leads', type: 'array' },
  { path: '/api/admin/badges', type: 'array' },

  // admin detail endpoints
  { path: '/api/admin/developers/{id}', type: 'object', listPath: '/api/admin/developers', paramName: 'id' },
  { path: '/api/admin/areas/{id}', type: 'object', listPath: '/api/admin/areas', paramName: 'id' },
  { path: '/api/admin/cities/{id}', type: 'object', listPath: '/api/admin/cities', paramName: 'id' },
  { path: '/api/admin/projects/{id}', type: 'object', listPath: '/api/admin/projects', paramName: 'id' },
  { path: '/api/admin/lots/{id}', type: 'object', listPath: '/api/admin/lots', paramName: 'id' },
  { path: '/api/admin/leads/{id}', type: 'object', listPath: '/api/admin/leads', paramName: 'id' },
  { path: '/api/admin/badges/{id}', type: 'object', listPath: '/api/admin/badges', paramName: 'id' },
];

for (const e of endpoints) {
  if (e.listPath && e.paramName) {
    test(`GET ${e.path}`, async ({ request }) => {
      // get list to resolve parameter
      const listResp = await request.get(e.listPath!);
      expect(listResp.status()).toBe(200);
      const listBody = await listResp.json();

      if (!Array.isArray(listBody) || listBody.length === 0) {
        test.skip(true, `no items in ${e.listPath} to test ${e.path}`);
      }

      const first = listBody[0];
      const param = first[e.paramName!];
      if (!param) {
        test.skip(true, `first item from ${e.listPath} doesn't contain param ${e.paramName}`);
      }

      const path = e.path.replace(`{${e.paramName}}`, encodeURIComponent(String(param)));
      const resp = await request.get(path);
      expect(resp.status()).toBe(200);
      const body = await resp.json();
      expect(body).toBeTruthy();
      expect(typeof body).toBe('object');
    });
  } else {
    test(`GET ${e.path}`, async ({ request }) => {
      const resp = await request.get(e.path);
      expect(resp.status()).toBe(200);
      const body = await resp.json();
      if (e.type === 'array') {
        expect(Array.isArray(body)).toBe(true);
      } else {
        expect(body).toBeTruthy();
        expect(Array.isArray(body)).toBe(false);
        expect(typeof body).toBe('object');
      }
    });
  }
}
