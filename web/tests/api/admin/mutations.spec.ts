import type { AdminClients, AdminResourceClient } from '../clients/admin';
import { test, expect } from '../fixtures/test';
import {
  asCollectionItems,
  expectApiErrorResponse,
  expectRequiredFieldRejections,
  invalidTypeValue,
  uniq,
} from '../helpers/assertions';

type LifecycleContext = {
  admin: AdminClients;
  suffix: string;
};

type UpdateSpec = {
  payload: Record<string, unknown>;
  responseField: string;
  expectedValue: unknown;
  dbColumn: string;
};

type AdminLifecycleCase = {
  name: string;
  titleRu: string;
  table: string;
  client: (admin: AdminClients) => AdminResourceClient;
  buildCreatePayload: (ctx: LifecycleContext) => Promise<Record<string, unknown>>;
  buildUpdateSpec: (ctx: LifecycleContext) => Promise<UpdateSpec>;
  restoreStatus?: 200 | 204;
};

function expectValue(actual: unknown, expected: unknown): void {
  if (typeof expected === 'number') {
    expect(Number(actual)).toBeCloseTo(expected, 2);
    return;
  }

  expect(actual).toBe(expected);
}

async function createProject(admin: AdminClients, suffix: string): Promise<string> {
  const response = await admin.projects.create({
    slug: `mutations-project-slug-${suffix}`,
    name: `mutations-project-name-${suffix}`,
    sale: 'sale',
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body?.id).toBeTruthy();

  return body.id as string;
}

const lifecycleCases: AdminLifecycleCase[] = [
  {
    name: 'developers',
    titleRu: 'Застройщики',
    table: 'developers',
    client: (admin) => admin.developers,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-dev-slug-${suffix}`,
      name: `mut-dev-name-${suffix}`,
      status: 'active',
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-dev-updated-${suffix}`;
      return {
        payload: { name: expectedValue },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
    restoreStatus: 200,
  },
  {
    name: 'areas',
    titleRu: 'Районы',
    table: 'areas',
    client: (admin) => admin.areas,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-area-slug-${suffix}`,
      name: `mut-area-name-${suffix}`,
      city: `Mutation City ${suffix}`,
      lat: 25.2048,
      lng: 55.2708,
      status: 'active',
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-area-updated-${suffix}`;
      return {
        payload: { name: expectedValue, city: `Mutation City Updated ${suffix}` },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
  },
  {
    name: 'cities',
    titleRu: 'Города',
    table: 'cities',
    client: (admin) => admin.cities,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-city-slug-${suffix}`,
      name: `mut-city-name-${suffix}`,
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-city-updated-${suffix}`;
      return {
        payload: { name: expectedValue },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
  },
  {
    name: 'projects',
    titleRu: 'Проекты',
    table: 'projects',
    client: (admin) => admin.projects,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-project-slug-${suffix}`,
      name: `mut-project-name-${suffix}`,
      sale: 'sale',
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-project-updated-${suffix}`;
      return {
        payload: { name: expectedValue },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
  },
  {
    name: 'lots',
    titleRu: 'Лоты',
    table: 'lots',
    client: (admin) => admin.lots,
    buildCreatePayload: async ({ admin, suffix }) => {
      const projectId = await createProject(admin, `${suffix}-lot-parent`);

      return {
        projectId,
        type: 'apartment',
        priceAmount: 1_050_000,
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 53,
        floor: 3,
      };
    },
    buildUpdateSpec: async () => ({
      payload: { priceAmount: 1_150_000 },
      responseField: 'priceAmount',
      expectedValue: 1_150_000,
      dbColumn: 'price_amount',
    }),
  },
  {
    name: 'badges',
    titleRu: 'Бейджи',
    table: 'badges',
    client: (admin) => admin.badges,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-badge-slug-${suffix}`,
      name: `mut-badge-name-${suffix}`,
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-badge-updated-${suffix}`;
      return {
        payload: { name: expectedValue },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
  },
  {
    name: 'infrastructures',
    titleRu: 'Инфраструктуры',
    table: 'infrastructures',
    client: (admin) => admin.infrastructures,
    buildCreatePayload: async ({ suffix }) => ({
      slug: `mut-infra-slug-${suffix}`,
      name: `mut-infra-name-${suffix}`,
    }),
    buildUpdateSpec: async ({ suffix }) => {
      const expectedValue = `mut-infra-updated-${suffix}`;
      return {
        payload: { name: expectedValue, sortOrder: 10 },
        responseField: 'name',
        expectedValue,
        dbColumn: 'name',
      };
    },
  },
];

test.describe('Жизненный цикл мутаций админ-API', () => {
  for (const resource of lifecycleCases) {
    // Проверяем полный жизненный цикл ресурса: create/get/list/update/delete/restore/hard-delete.
    test(`${resource.titleRu} → поддерживается полный жизненный цикл`, async ({ api, db }) => {
      const suffix = `${resource.name}-${uniq()}`;
      const ctx: LifecycleContext = { admin: api.admin, suffix };
      const client = resource.client(api.admin);

      let entityId = '';

      await test.step('POST /create: создать сущность', async () => {
        const response = await client.create(await resource.buildCreatePayload(ctx));
        expect(response.status()).toBe(201);

        const body = await response.json();
        entityId = String(body.id);

        expect(entityId).toBeTruthy();
      });

      await test.step('GET /list и GET /{id}: сущность доступна', async () => {
        const listResponse = await client.list();
        expect(listResponse.status()).toBe(200);

        const getResponse = await client.get(entityId);
        expect(getResponse.status()).toBe(200);

        const getBody = await getResponse.json();
        expect(String(getBody.id)).toBe(entityId);
      });

      await test.step('PATCH /{id}: обновить сущность', async () => {
        const updateSpec = await resource.buildUpdateSpec(ctx);
        const response = await client.update(entityId, updateSpec.payload);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expectValue(body[updateSpec.responseField], updateSpec.expectedValue);

        const dbRows = await db.query<Record<string, unknown>>(
          `
          SELECT id, deleted_at, ${updateSpec.dbColumn} AS updated_value
          FROM ${resource.table}
          WHERE id = $1
          `,
          [entityId]
        );

        expect(dbRows.length).toBe(1);
        expect(dbRows[0].deleted_at).toBeNull();
        expectValue(dbRows[0].updated_value, updateSpec.expectedValue);
      });

      await test.step('DELETE /{id}: выполнить мягкое удаление', async () => {
        const response = await client.delete(entityId);
        expect(response.status()).toBe(204);

        const dbRows = await db.query<{ deleted_at: string | null }>(
          `
          SELECT deleted_at
          FROM ${resource.table}
          WHERE id = $1
          `,
          [entityId]
        );

        expect(dbRows.length).toBe(1);
        expect(dbRows[0].deleted_at).toBeTruthy();
      });

      await test.step('GET /deleted: сущность присутствует в списке удалённых', async () => {
        const response = await client.listDeleted();
        expect(response.status()).toBe(200);

        const body = await response.json();
        const items = asCollectionItems(body);

        const exists = items.some((item) => String(item?.id) === entityId);
        expect(exists).toBe(true);
      });

      await test.step('POST /{id}/restore: восстановить сущность', async () => {
        const restoreStatus = resource.restoreStatus ?? 204;
        const response = await client.restore(entityId);
        expect(response.status()).toBe(restoreStatus);

        if (restoreStatus === 200) {
          const body = await response.json();
          expect(String(body.id)).toBe(entityId);
        }

        const dbRows = await db.query<{ deleted_at: string | null }>(
          `
          SELECT deleted_at
          FROM ${resource.table}
          WHERE id = $1
          `,
          [entityId]
        );

        expect(dbRows.length).toBe(1);
        expect(dbRows[0].deleted_at).toBeNull();
      });

      await test.step('DELETE /{id}/hard-delete: удалить сущность навсегда', async () => {
        const softDeleteResponse = await client.delete(entityId);
        expect(softDeleteResponse.status()).toBe(204);

        const hardDeleteResponse = await client.hardDelete(entityId);
        expect(hardDeleteResponse.status()).toBe(204);

        const dbRows = await db.query<{ count: number }>(
          `
          SELECT COUNT(*)::int AS count
          FROM ${resource.table}
          WHERE id = $1
          `,
          [entityId]
        );

        expect(Number(dbRows[0].count)).toBe(0);

        const getResponse = await client.get(entityId);
        await expectApiErrorResponse(getResponse, {
          expectedStatus: 404,
          allowedCodes: ['not_found'],
        });
      });
    });
  }

  // Проверяем обязательные поля create для инфраструктуры, чтобы закрыть валидацию нового admin-ресурса.
  test('Создание инфраструктуры: обязательные поля валидируются', async ({ api }) => {
    const suffix = uniq();
    const validPayload = {
      slug: `required-infra-slug-${suffix}`,
      name: `required-infra-name-${suffix}`,
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/admin/infrastructures',
      create: (payload) => api.admin.infrastructures.create(payload),
      cases: [
        { field: 'slug', payload: { ...validPayload, slug: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
      ],
    });
  });
});
