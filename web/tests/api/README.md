# Playwright API Tests

## Что покрыто
- `tests/api/smoke.api.spec.ts` — быстрый smoke public GET.
- `tests/api/admin/smoke.spec.ts` — быстрый smoke admin GET.
- `tests/api/all_gets.api.spec.ts` — регресс GET, включая detail-эндпоинты.
- `tests/api/admin/*.spec.ts` — create-сценарии admin-ресурсов + проверки обязательных полей.
- `tests/api/admin/mutations.spec.ts` — lifecycle admin-методов: `PATCH`, `DELETE`, `GET /deleted`, `POST /restore`, `DELETE /hard-delete`.
- `tests/api/leads.spec.ts` — public `POST /api/leads` + admin `PATCH/DELETE` для лидов.

## Масштабирование тестов
- Общие проверки вынесены в `tests/api/helpers/assertions.ts`.
- `expectJsonByType` — единая проверка контрактного типа ответа для GET smoke/regress.
- `expectApiErrorResponse` — единая проверка структуры API-ошибки.
- `expectRequiredFieldRejections` — табличные проверки обязательных полей в create-сценариях.
- `asCollectionItems` — единый разбор списков (`[]`, `{ items: [] }`, `{ data: [] }`).
- В каждом тесте добавлен короткий комментарий, что именно проверяется.

## Практики Playwright (по документации)
- Используем `test.step` для читаемого отчёта.
- Переиспользуем `fixtures` (`tests/api/fixtures/test.ts`) вместо дублирования setup.
- Генерацию однотипных smoke/regress тестов делаем через массив endpoint-конфигураций.
- Для detail-эндпоинтов используем `testInfo.skip(...)`, если нет данных в списке.

Официальная документация:
- https://playwright.dev/docs/test-annotations
- https://playwright.dev/docs/api/class-test
- https://playwright.dev/docs/test-fixtures
- https://playwright.dev/docs/test-assertions

## Запуск

Установка зависимостей:

```bash
cd web
pnpm install
```

Основные команды (из папки `web`):

```bash
pnpm run test:e2e
```

- только API:

```bash
pnpm run test:api
```

- smoke public:

```bash
pnpm run test:api:smoke
```

- smoke admin:

```bash
pnpm run test:api:smoke:admin
```

- regress GET:

```bash
pnpm run test:api:regress
```

- проверить discoverability (без прогона):

```bash
pnpm exec playwright test --project=api --list
```

- HTML отчёт:

```bash
pnpm exec playwright show-report
```

## Важно
- Playwright ищет тесты внутри `./tests`.
- Для detail-эндпоинтов пустой список данных приводит к `skipped` — это корректное поведение.
- Базовый URL берётся из `WEB_BASE_URL` (по умолчанию `http://localhost:5173`).
- Для DB-фикстур нужны `DATABASE_URL` или `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`.
