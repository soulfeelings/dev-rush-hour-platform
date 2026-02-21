import { test, expect } from './fixtures/test';
import { expectJsonByType } from './helpers/assertions';

type Endpoint = {
  path: string;
  type: 'array' | 'object';
  // for detail endpoints provide listPath and param (e.g. 'id' or 'slug')
  listPath?: string;
  paramName?: string;
  // optional: where to take list from if list response is wrapped (e.g. { items: [] } or { data: [] })
  listSelector?: (body: any) => any[];
};

const asListDefault = (body: any): any[] => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  return [];
};

const skipNoListDataMessage = (listPath: string, detailPath: string, paramName: string) =>
  [
    `Тестовый случай не сообщил никаких выходных данных: список "${listPath}" вернул 0 элементов.`,
    `Скорее всего, в базе данных нет записей для данного ресурса, поэтому невозможно получить параметр "{${paramName}}"`,
    `и выполнить проверку детального эндпоинта "${detailPath}".`,
    `Чтобы тест выполнялся, необходимо предварительно создать запись (через API или напрямую в БД).`,
  ].join(' ');

const skipNoParamMessage = (listPath: string, detailPath: string, paramName: string) =>
  [
    `Тестовый случай не сообщил корректных выходных данных: первый элемент из "${listPath}" не содержит поле "${paramName}".`,
    `Невозможно сформировать запрос к "${detailPath}". Проверь название поля (id/_id/uuid/slug) или формат ответа.`,
  ].join(' ');

const endpoints: Endpoint[] = [
  // public collection endpoints
  { path: '/api/areas', type: 'array' },
  { path: '/api/cities', type: 'array' },
  { path: '/api/filters/options', type: 'object' },
  { path: '/api/projects', type: 'array' },
  // NOTE: /api/lots often returns wrapped object; keep 'object' + selector if needed
  { path: '/api/lots', type: 'object' },
  { path: '/api/developers', type: 'array' },

  // public detail endpoints (resolved from collection)
  { path: '/api/areas/{slug}', type: 'object', listPath: '/api/areas', paramName: 'slug' },
  { path: '/api/projects/{slug}', type: 'object', listPath: '/api/projects', paramName: 'slug' },

  // If /api/lots returns { items: [...] } (or { data: [...] }) — this will work.
  // If it returns plain array — also works (asListDefault handles both).
  { path: '/api/lots/{id}', type: 'object', listPath: '/api/lots', paramName: 'id', listSelector: asListDefault },

  // admin collections
  { path: '/api/admin/developers', type: 'array' },
  { path: '/api/admin/areas', type: 'array' },
  { path: '/api/admin/cities', type: 'array' },
  { path: '/api/admin/projects', type: 'array' },
  { path: '/api/admin/lots', type: 'object' },
  { path: '/api/admin/leads', type: 'array' },
  { path: '/api/admin/badges', type: 'array' },
  { path: '/api/admin/infrastructures', type: 'array' },

  // admin deleted collections
  { path: '/api/admin/developers/deleted', type: 'array' },
  { path: '/api/admin/areas/deleted', type: 'array' },
  { path: '/api/admin/cities/deleted', type: 'array' },
  { path: '/api/admin/projects/deleted', type: 'array' },
  { path: '/api/admin/lots/deleted', type: 'object' },
  { path: '/api/admin/badges/deleted', type: 'array' },
  { path: '/api/admin/infrastructures/deleted', type: 'array' },

  // admin detail endpoints
  { path: '/api/admin/developers/{id}', type: 'object', listPath: '/api/admin/developers', paramName: 'id' },
  { path: '/api/admin/areas/{id}', type: 'object', listPath: '/api/admin/areas', paramName: 'id' },
  { path: '/api/admin/cities/{id}', type: 'object', listPath: '/api/admin/cities', paramName: 'id' },
  { path: '/api/admin/projects/{id}', type: 'object', listPath: '/api/admin/projects', paramName: 'id' },

  // /api/admin/lots may be wrapped too — selector helps
  { path: '/api/admin/lots/{id}', type: 'object', listPath: '/api/admin/lots', paramName: 'id', listSelector: asListDefault },

  { path: '/api/admin/leads/{id}', type: 'object', listPath: '/api/admin/leads', paramName: 'id' },
  { path: '/api/admin/badges/{id}', type: 'object', listPath: '/api/admin/badges', paramName: 'id' },
  { path: '/api/admin/infrastructures/{id}', type: 'object', listPath: '/api/admin/infrastructures', paramName: 'id' },
];

test.describe('Регресс API (все GET-эндпоинты)', () => {
  for (const e of endpoints) {
    // Detail endpoints: resolve param from list endpoint
    if (e.listPath && e.paramName) {
      // Проверяем детальный endpoint: берём параметр из списка и валидируем тип ответа.
      test(`GET ${e.path} возвращает контрактный тип`, async ({ request }, testInfo) => {
        let resolvedPath = '';

        await test.step(`Получить данные из списка ${e.listPath}`, async () => {
          const listResp = await request.get(e.listPath!);
          expect(listResp.ok(), `list ${e.listPath} should be OK`).toBeTruthy();

          const listBody = await listResp.json();
          const list = (e.listSelector ?? asListDefault)(listBody);

          // If no data to resolve {param} -> skip with clear reason
          if (list.length === 0) {
            testInfo.skip(true, skipNoListDataMessage(e.listPath!, e.path, e.paramName!));
          }

          const first = list[0];
          const param = first?.[e.paramName!];

          // If list has items but field is missing -> skip with clear reason
          if (param === undefined || param === null || param === '') {
            testInfo.skip(true, skipNoParamMessage(e.listPath!, e.path, e.paramName!));
          }

          resolvedPath = e.path.replace(
            `{${e.paramName}}`,
            encodeURIComponent(String(param))
          );
        });

        await test.step(`Проверить детальный endpoint ${e.path}`, async () => {
          const resp = await request.get(resolvedPath);
          await expectJsonByType(resp, resolvedPath, e.type);
        });
      });

      continue;
    }

    // Collection endpoints: simple validation by declared type
    // Проверяем коллекционный endpoint на доступность и контрактный тип ответа.
    test(`GET ${e.path} возвращает контрактный тип`, async ({ request }) => {
      await test.step(`Отправить GET-запрос к ${e.path}`, async () => {
        const resp = await request.get(e.path);
        await expectJsonByType(resp, e.path, e.type);
      });
    });
  }
});
