import type { APIResponse } from '@playwright/test';
import { test, expect } from './fixtures/test';
import {
  expectApiErrorResponse,
  expectRequiredFieldRejections,
  invalidTypeValue,
  uniq,
} from './helpers/assertions';

async function createLead(
  create: (payload: Record<string, unknown>) => Promise<APIResponse>,
  suffix: string
): Promise<string> {
  const phoneDigits = suffix.replace(/\D/g, '').slice(-9);

  const response = await create({
    type: 'callback',
    name: `Lead ${suffix}`,
    phone: `+1${phoneDigits}`,
    source: 'playwright-api',
    email: `lead-${suffix}@example.com`,
    data: {
      comment: `lead-comment-${suffix}`,
      preferred: 'telegram',
      pageUrl: '/test',
      utm: { campaign: `campaign-${suffix}` },
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body?.id).toBeTruthy();

  return body.id as string;
}

test.describe('leads', () => {
  // Проверяем создание публичного лида и сохранение обязательных значений в БД.
  test('public create → lead is created and saved in DB', async ({ api, db }) => {
    const suffix = uniq();

    let leadId = '';

    await test.step('POST /api/leads → create lead', async () => {
      leadId = await createLead((payload) => api.public.createLead(payload), suffix);
    });

    await test.step('DB → leads record exists and has default status', async () => {
      const dbRows = await db.query(
        `
        SELECT id, status, type, name, phone, source, deleted_at
        FROM leads
        WHERE id = $1
        `,
        [leadId]
      );

      expect(dbRows.length).toBe(1);
      expect(dbRows[0].id).toBe(leadId);
      expect(dbRows[0].status).toBe('new');
      expect(dbRows[0].type).toBe('callback');
      expect(dbRows[0].deleted_at).toBeNull();
      expect(dbRows[0].name).toContain('Lead');
      expect(dbRows[0].phone).toContain('+1');
      expect(dbRows[0].source).toBe('playwright-api');
    });
  });

  // Проверяем, что публичный endpoint лида отклоняет некорректные значения обязательных полей.
  test('public create → required fields are validated', async ({ api }) => {
    const suffix = uniq();
    const phoneDigits = suffix.replace(/\D/g, '').slice(-9);
    const validPayload = {
      type: 'callback',
      name: `Lead Required ${suffix}`,
      phone: `+1${phoneDigits}`,
    };

    await expectRequiredFieldRejections({
      endpoint: '/api/leads',
      create: (payload) => api.public.createLead(payload),
      cases: [
        { field: 'type', payload: { ...validPayload, type: invalidTypeValue() } },
        { field: 'name', payload: { ...validPayload, name: invalidTypeValue() } },
        { field: 'phone', payload: { ...validPayload, phone: invalidTypeValue() } },
      ],
    });
  });

  // Проверяем админский lifecycle лида: обновление статуса и мягкое удаление.
  test('admin update/delete → lead is updated and soft-deleted', async ({ api, db }) => {
    const suffix = uniq();
    const leadId = await createLead((payload) => api.public.createLead(payload), suffix);
    const updatedSource = `admin-updated-${suffix}`;

    await test.step('PATCH /api/admin/leads/{id} → update lead', async () => {
      const response = await api.admin.leads.update(leadId, {
        status: 'done',
        source: updatedSource,
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.id).toBe(leadId);
      expect(body.status).toBe('done');
      expect(body.source).toBe(updatedSource);
    });

    await test.step('DB → updated values are persisted', async () => {
      const dbRows = await db.query(
        `
        SELECT status, source, deleted_at
        FROM leads
        WHERE id = $1
        `,
        [leadId]
      );

      expect(dbRows.length).toBe(1);
      expect(dbRows[0].status).toBe('done');
      expect(dbRows[0].source).toBe(updatedSource);
      expect(dbRows[0].deleted_at).toBeNull();
    });

    await test.step('DELETE /api/admin/leads/{id} → soft-delete lead', async () => {
      const response = await api.admin.leads.delete(leadId);
      expect(response.status()).toBe(204);

      const dbRows = await db.query(
        `
        SELECT deleted_at
        FROM leads
        WHERE id = $1
        `,
        [leadId]
      );

      expect(dbRows.length).toBe(1);
      expect(dbRows[0].deleted_at).toBeTruthy();
    });

    await test.step('GET /api/admin/leads/{id} → deleted lead is not accessible', async () => {
      const response = await api.admin.leads.get(leadId);

      await expectApiErrorResponse(response, {
        expectedStatus: 404,
        allowedCodes: ['not_found'],
      });
    });
  });
});
