# Playwright тесты (web)

## Конфигурация
В проекте используется Playwright со следующими настройками:

- `testDir`: `./tests`
- Проекты:
  - `api` → `./tests/api`
  - `ui` → `./tests/ui`
- `baseURL` берётся из переменной окружения `WEB_BASE_URL`
  - по умолчанию: `http://localhost:5173`
- Отчёты: `list` + `html`

---

## Предпосылки
- Запущены frontend и backend сервисы.
- В режиме разработки используется `vite` proxy (`/api` проксируется на backend).
- Установлены зависимости в папке `web`.

---

## Установка зависимостей
```bash
cd web
pnpm install
````

---

## Запуск тестов

### Запустить все тесты (API + UI)

```bash
cd web
pnpm exec playwright test
```

### Запустить только API тесты

```bash
cd web
pnpm exec playwright test --project=api
```

### Smoke (быстрый health-check, без detail)

```bash
cd web
pnpm run test:api:smoke
```

### Smoke (admin)

```bash
cd web
pnpm run test:api:smoke:admin
```

### Regress (полный прогон всех GET + detail)

```bash
cd web
pnpm run test:api:regress
```

### Запустить только UI тесты

```bash
cd web
pnpm exec playwright test --project=ui
```

### Запустить конкретный файл

```bash
cd web
pnpm exec playwright test tests/api/smoke.api.spec.ts
```

> Важно: Playwright ищет тесты только внутри папки `./tests`.
> Команды вида `pnpm exec playwright test all_gets.api.spec.ts` приведут к ошибке `No tests found`.

---

## Разделение smoke / regress

- `tests/api/smoke.api.spec.ts` — public smoke (core GET, без detail).
- `tests/api/admin/smoke.spec.ts` — admin smoke (core GET, без detail, без leads).
- `tests/api/all_gets.api.spec.ts` — regress (все GET-и, включая detail).

Важно: не запускайте smoke и regress в одном ночном прогоне — это лишняя нагрузка и дублирование.

---

## Скрипт для CI/CD

Из корня репозитория:

```bash
./scripts/api-tests.sh smoke
```

Доступные режимы: `smoke`, `admin`, `regress`, `all`.

---

## Запуск тестов на другом окружении

```bash
cd web
WEB_BASE_URL=https://staging.example.com pnpm exec playwright test --project=api
```

---

## HTML-отчёт

После выполнения тестов открыть HTML-отчёт:

```bash
cd web
pnpm exec playwright show-report
```

Отчёт будет доступен по адресу:

```
http://localhost:9323
```

---

## Примечание про skipped тесты

Детальные API-тесты вида `/api/.../{id}` сначала запрашивают список (`/api/...`) и используют первый элемент для получения `id`.

Если список пуст (в базе нет записей), тест:

* корректно помечается как `skipped`,
* в отчёте указывается причина пропуска,
* это не ошибка теста.

Пример ожидаемого результата:

```
34 passed
1 skipped
0 failed
```


```bash
pnpm install # или npm install
pnpm exec playwright test --project=api
```

Запустить регресс-файл с GET-тестами:

```bash
pnpm exec playwright test web/tests/api/all_gets.api.spec.ts
```

Примечания:

- Админ-эндпоинты включены в тесты для локальной проверки. Если в будущем потребуется передавать `X-Admin-Key`, можно установить переменную окружения `ADMIN_API_KEY` перед запуском.
- Тесты для detail-эндпоинтов (например, `/api/lots/{id}`) сначала запрашивают соответствующий список и используют первый элемент для получения детальной записи. Если список пуст — тест будет пропущен.
