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

Все тесты:

```bash
cd web
pnpm exec playwright test
```

Только API:

```bash
cd web
pnpm exec playwright test --project=api
```

Smoke public:

```bash
cd web
pnpm run test:api:smoke
```

Smoke admin:

```bash
cd web
pnpm run test:api:smoke:admin
```

Regress GET:

```bash
cd web
pnpm run test:api:regress
```

Только UI:

```bash
cd web
pnpm exec playwright test --project=ui
```

HTML отчёт:

```bash
cd web
pnpm exec playwright show-report
```

## Важно
- Playwright ищет тесты внутри `./tests`.
- Для detail-эндпоинтов пустой список данных приводит к `skipped` — это корректное поведение.
