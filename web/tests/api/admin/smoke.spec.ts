import { test } from '../fixtures/test';
import { expectJsonByType } from '../helpers/assertions';

const endpoints = [
  { path: '/api/admin/projects', type: 'array' as const },
  { path: '/api/admin/lots', type: 'object' as const },
  { path: '/api/admin/cities', type: 'array' as const },
  { path: '/api/admin/developers', type: 'array' as const },
  { path: '/api/admin/areas', type: 'array' as const },
  { path: '/api/admin/badges', type: 'array' as const },
  { path: '/api/admin/infrastructures', type: 'array' as const },
];

test.describe('Смоук админ-API', { tag: '@smoke' }, () => {
  for (const e of endpoints) {
    // Проверяем, что admin GET-эндпоинт доступен и возвращает ожидаемый тип тела.
    test(`GET ${e.path} возвращает контрактный тип`, async ({ request }) => {
      await test.step(`Отправить GET-запрос к ${e.path}`, async () => {
        const resp = await request.get(e.path);
        await expectJsonByType(resp, e.path, e.type);
      });
    });
  }
});
