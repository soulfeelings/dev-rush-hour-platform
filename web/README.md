# Rush Hour Platform

## Rules of the project development:

1. Names of colors in code should be like in design, but with "$color-" prefix. For example:

- in design "Yellow", in code "$color-yellow"
- in design "Charcoal_Grey70", in code "$color-charcoal-grey-70"

## Автотесты (Playwright)

Автотесты пока в процессе написания. Сейчас есть локальная настройка, структура и конфиги для запуска UI и API тестов.

### Структура

- tests/ui - UI e2e тесты (Playwright page)
- tests/api - API тесты (Playwright request)
- tests/_helpers - общие хелперы (например, для БД)

### Конфигурация

- playwright.config.ts - проекты ui и api, базовые URL
- WEB_BASE_URL (по умолчанию http://localhost:5173)
- API_BASE_URL (по умолчанию http://localhost:8080/api)

### База данных (для API тестов)

- DATABASE_URL или DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
- DB_SSLMODE (по умолчанию disable)

### Запуск (из папки web)

- pnpm test:e2e - прогон всех тестов
- pnpm test:ui - только UI тесты
- pnpm test:api - только API тесты
- pnpm test:api:smoke - быстрый smoke (public)
- pnpm test:api:smoke:admin - быстрый smoke (admin)
- pnpm test:api:regress - полный прогон всех API/GET

### Локально

- Для UI тестов нужен запущенный фронтенд (Vite).
- Для API тестов нужны запущенные backend и Postgres.
