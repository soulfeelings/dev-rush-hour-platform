import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Public API клиенты.
 * Выделены отдельно, чтобы не смешивать admin/public контракты.
 */
export class PublicClients {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Создание лида через публичный endpoint.
   */
  async createLead(data: unknown): Promise<APIResponse> {
    return this.request.post('/api/leads', { data });
  }
}
