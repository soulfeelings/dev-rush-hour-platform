# Rush Hour Platform

## Rules of the project development:

1. Names of colors in code should be like in design, but with "$color-" prefix. For example:

- in design "Yellow", in code "$color-yellow"
- in design "Charcoal_Grey70", in code "$color-charcoal-grey-70"

## Автотесты (Playwright)

### Что есть в проекте

- `tests/ui` — UI E2E тесты (smoke, critical, regression, admin auth/smoke/crud)
- `tests/api` — API тесты (public/admin smoke, regress, create/mutations, leads)
- `playwright.config.ts` — два проекта: `ui` и `api`

### Требования

- Node.js `>= 18.12`
- `pnpm`
- Запущенные сервисы (`web`, `backend`, `postgres`)

Запуск dev-окружения:

```bash
docker compose -f ../docker-compose.dev.yml up -d
```

### Переменные окружения для тестов

Базовые:

- `WEB_BASE_URL` (по умолчанию `http://localhost:5173`)

Для API DB fixtures:

- `DATABASE_URL` **или** `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`
- `DB_SSLMODE` (`disable` по умолчанию)

Для admin-авторизации в UI/API тестах (JWT cookie):

- `API_ADMIN_EMAIL` (по умолчанию `ui-tests@local` для UI, `api-tests@local` для API)
- `API_ADMIN_ROLE` (по умолчанию `superadmin`)
- `API_ADMIN_JWT_SECRET` (по умолчанию `dev-secret-change-in-production`)
- `API_ADMIN_JWT` (опционально, если нужен готовый токен)
- `API_ADMIN_PERMISSIONS` (опционально, CSV)

Для автосоздания admin пользователя в UI-тестах:

- `ADMIN_TEST_DATABASE_URL` **или** `ADMIN_DB_HOST/ADMIN_DB_PORT/ADMIN_DB_USER/ADMIN_DB_PASSWORD/ADMIN_DB_NAME`

### Скрипты запуска (из папки `web`)

```bash
pnpm install
```

- `pnpm run test:e2e` — все Playwright тесты (`ui` + `api`)
- `pnpm run test:ui` — все UI тесты
- `pnpm run test:ui:admin` — только admin UI (`auth + smoke + crud`)
- `pnpm run test:ui:critical` — критичные UI + фильтры
- `pnpm run test:ui:regress` — регресс UI
- `pnpm run test:ui:final` — полный целевой UI прогон (smoke + critical + filters + admin)
- `pnpm run test:api` — все API тесты
- `pnpm run test:api:smoke` — public smoke API
- `pnpm run test:api:smoke:admin` — admin smoke API
- `pnpm run test:api:regress` — регресс GET API

### Быстрые проверки конфигурации

- Список UI тестов: `pnpm exec playwright test --project=ui --list`
- Список API тестов: `pnpm exec playwright test --project=api --list`
