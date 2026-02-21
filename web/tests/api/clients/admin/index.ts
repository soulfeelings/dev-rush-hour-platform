import type { APIRequestContext, APIResponse } from '@playwright/test';
import { buildAdminCookieHeader } from '../../helpers/admin-auth';

/**
 * Универсальный CRUD-клиент для одного Admin REST-ресурса.
 *
 * Назначение:
 * - Инкапсулировать работу с конкретным endpoint
 * - Убрать дублирование путей (/api/admin/...)
 * - Централизовать HTTP-логику
 * - Централизовать логирование запросов/ответов
 *
 * Пример использования:
 * const admin = new AdminClients(request);
 * const project = await admin.projects.create(payload);
 */
export class AdminResourceClient {
  private readonly verbose: boolean;
  private readonly logErrors: boolean;

  constructor(
    /**
     * Playwright APIRequestContext.
     * Передаётся один раз из теста.
     */
    private readonly request: APIRequestContext,

    /**
     * Базовый путь ресурса.
     * Например: '/api/admin/projects'
     */
    private readonly basePath: string
  ) {
    this.verbose = process.env.API_TEST_VERBOSE === '1';
    this.logErrors = process.env.API_TEST_LOG_ERRORS === '1';
  }

  /**
   * Универсальный HTTP-метод.
   *
   * Назначение:
   * - Централизовать отправку запросов
   * - Логировать request/response
   * - Обрабатывать ошибки единообразно
   */
  private async send(
    method: 'get' | 'post' | 'patch' | 'delete',
    url: string,
    data?: unknown
  ): Promise<APIResponse> {
    const fullUrl = url;

    // Подробные логи включаются только в debug-режиме.
    if (this.verbose) {
      console.log(`\n➡ ${method.toUpperCase()} ${fullUrl}`);

      if (data !== undefined) {
        console.log(
          'Request body:\n',
          JSON.stringify(data, null, 2)
        );
      }
    }

    const headers = buildAdminCookieHeader(fullUrl);
    const options =
      data !== undefined
        ? { data, ...(headers ? { headers } : {}) }
        : headers
          ? { headers }
          : undefined;

    const response = await this.request[method](fullUrl, options);

    if (this.verbose) {
      const responseText = await response.text();
      console.log(`⬅ ${response.status()} ${fullUrl}`);

      try {
        console.log(
          'Response body:\n',
          JSON.stringify(JSON.parse(responseText), null, 2)
        );
      } catch {
        console.log('Response body:\n', responseText);
      }
    }

    // Ошибки по умолчанию не печатаем: negative-тесты ожидают 4xx/5xx.
    if (!response.ok() && this.logErrors) {
      console.error(`❌ API ERROR ${response.status()} ${method.toUpperCase()} ${fullUrl}`);
    }

    return response;
  }

  /**
   * Создание сущности (POST).
   *
   * @param data - тело запроса
   */
  async create(data: unknown): Promise<APIResponse> {
    return this.send('post', this.basePath, data);
  }

  /**
   * Получение списка сущностей (GET).
   */
  async list(): Promise<APIResponse> {
    return this.send('get', this.basePath);
  }

  /**
   * Получение одной сущности по ID (GET).
   *
   * @param id - UUID сущности
   */
  async get(id: string): Promise<APIResponse> {
    return this.send('get', `${this.basePath}/${id}`);
  }

  /**
   * Обновление сущности (PATCH).
   *
   * @param id - UUID сущности
   * @param data - тело запроса
   */
  async update(id: string, data: unknown): Promise<APIResponse> {
    return this.send('patch', `${this.basePath}/${id}`, data);
  }

  /**
   * Мягкое удаление сущности (DELETE).
   *
   * @param id - UUID сущности
   */
  async delete(id: string): Promise<APIResponse> {
    return this.send('delete', `${this.basePath}/${id}`);
  }

  /**
   * Список мягко удалённых сущностей (GET /deleted).
   */
  async listDeleted(): Promise<APIResponse> {
    return this.send('get', `${this.basePath}/deleted`);
  }

  /**
   * Восстановление сущности (POST /{id}/restore).
   *
   * @param id - UUID сущности
   */
  async restore(id: string): Promise<APIResponse> {
    return this.send('post', `${this.basePath}/${id}/restore`);
  }

  /**
   * Полное удаление сущности (DELETE /{id}/hard-delete).
   *
   * @param id - UUID сущности
   */
  async hardDelete(id: string): Promise<APIResponse> {
    return this.send('delete', `${this.basePath}/${id}/hard-delete`);
  }
}

/**
 * Контейнер всех Admin-ресурсов.
 *
 * Назначение:
 * - Централизованная точка доступа к API admin-раздела
 * - Один request → много клиентов
 * - Упрощение тестов
 *
 * Пример:
 * const admin = new AdminClients(request);
 * await admin.projects.create(payload);
 * await admin.lots.list();
 */
export class AdminClients {
  readonly projects: AdminResourceClient;
  readonly lots: AdminResourceClient;
  readonly cities: AdminResourceClient;
  readonly developers: AdminResourceClient;
  readonly areas: AdminResourceClient;
  readonly badges: AdminResourceClient;
  readonly infrastructures: AdminResourceClient;
  readonly leads: AdminResourceClient;

  constructor(request: APIRequestContext) {
    this.projects = new AdminResourceClient(request, '/api/admin/projects');
    this.lots = new AdminResourceClient(request, '/api/admin/lots');
    this.cities = new AdminResourceClient(request, '/api/admin/cities');
    this.developers = new AdminResourceClient(request, '/api/admin/developers');
    this.areas = new AdminResourceClient(request, '/api/admin/areas');
    this.badges = new AdminResourceClient(request, '/api/admin/badges');
    this.infrastructures = new AdminResourceClient(request, '/api/admin/infrastructures');
    this.leads = new AdminResourceClient(request, '/api/admin/leads');
  }
}
