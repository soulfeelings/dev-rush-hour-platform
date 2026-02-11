import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Универсальный CRUD-клиент для одного Admin REST-ресурса.
 *
 * Назначение:
 * - Инкапсулировать работу с конкретным endpoint
 * - Убрать дублирование путей (/api/admin/...)
 * - Централизовать HTTP-логику
 *
 * Пример использования:
 * const admin = new AdminClients(request);
 * const project = await admin.projects.create<Project>(payload);
 */
export class AdminResourceClient {
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
  ) {}

  /**
   * Создание сущности (POST).
   *
   * @param data - тело запроса
   * @returns APIResponse
   */
  async create<T = unknown>(data: unknown): Promise<APIResponse> {
    return this.request.post(this.basePath, { data });
  }

  /**
   * Получение списка сущностей (GET).
   */
  async list(): Promise<APIResponse> {
    return this.request.get(this.basePath);
  }

  /**
   * Получение одной сущности по ID (GET).
   *
   * @param id - UUID сущности
   */
  async get(id: string): Promise<APIResponse> {
    return this.request.get(`${this.basePath}/${id}`);
  }

  /**
   * Обновление сущности (PATCH).
   *
   * @param id - UUID сущности
   * @param data - тело запроса
   */
  async update<T = unknown>(id: string, data: unknown): Promise<APIResponse> {
    return this.request.patch(`${this.basePath}/${id}`, { data });
  }

  /**
   * Удаление сущности (DELETE).
   *
   * @param id - UUID сущности
   */
  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.basePath}/${id}`);
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
  readonly leads: AdminResourceClient;

  constructor(request: APIRequestContext) {
    this.projects = new AdminResourceClient(request, '/api/admin/projects');
    this.lots = new AdminResourceClient(request, '/api/admin/lots');
    this.cities = new AdminResourceClient(request, '/api/admin/cities');
    this.developers = new AdminResourceClient(request, '/api/admin/developers');
    this.areas = new AdminResourceClient(request, '/api/admin/areas');
    this.badges = new AdminResourceClient(request, '/api/admin/badges');
    this.leads = new AdminResourceClient(request, '/api/admin/leads');
  }
}