import { test } from './fixtures/test';
import { expectJsonByType } from './helpers/assertions';

const endpoints = [
  { path: '/api/projects', type: 'array' as const },
  { path: '/api/lots', type: 'object' as const },
  { path: '/api/filters/options', type: 'object' as const },
  { path: '/api/areas', type: 'array' as const },
  { path: '/api/cities', type: 'array' as const },
];

test.describe('API smoke (public core GET)', () => {
  for (const e of endpoints) {
    // Проверяем, что public GET-эндпоинт доступен и возвращает ожидаемый тип тела.
    test(`GET ${e.path}`, async ({ request }) => {
      const resp = await request.get(e.path);
      await expectJsonByType(resp, e.path, e.type);
    });
  }
});
