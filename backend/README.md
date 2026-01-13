# Rush Hour Backend

Go + Fiber + Postgres JSONB сервер для MVP портала недвижимости.

## Структура проекта

- `/cmd/server` - точка входа приложения
- `/cmd/migrate` - утилита для миграций
- `/internal/config` - конфигурация
- `/internal/domain` - доменные модели и enums
- `/internal/repo` - репозитории для работы с БД
- `/internal/services` - бизнес-логика
- `/internal/handlers` - HTTP handlers
- `/internal/dto` - DTO для запросов/ответов (legacy, не используется)
- `/internal/mappers` - мапперы между domain и generated типами
- `/internal/generated` - автогенерируемый код из OpenAPI
- `/internal/migrations` - SQL миграции
- `/api/openapi.yaml` - OpenAPI спецификация (источник истины)

## Запуск

### Локально (без Docker)

1. Установить зависимости:

```bash
go mod download
```

2. Установить golang-migrate:

```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

3. Запустить Postgres локально или использовать Docker:

```bash
docker run -d \
  --name rushhour-postgres \
  -e POSTGRES_USER=rushhour \
  -e POSTGRES_PASSWORD=rushhour_dev \
  -e POSTGRES_DB=rushhour_db \
  -p 5432:5432 \
  postgres:16-alpine
```

4. Применить миграции:

```bash
make migrate-up
# или
go run cmd/migrate/main.go -direction=up
```

5. Запустить сервер:

```bash
make dev
# или
go run cmd/server/main.go
```

### С Docker Compose

1. Запустить все сервисы (миграции применятся автоматически):

```bash
docker-compose -f docker-compose.dev.yml up
```

Миграции запускаются автоматически при старте через отдельный сервис `migrate`.

Для ручного запуска миграций:

```bash
make migrate-up    # применить миграции
make migrate-down   # откатить последнюю миграцию
```

## Миграции

- `make migrate-up` - применить миграции
- `make migrate-down` - откатить последнюю миграцию
- `make migrate-create name=migration_name` - создать новую миграцию

## Seed данных

Для заполнения БД тестовыми данными:

```bash
make seed
```

Команда запросит Database URL. Для dev используйте:

```
postgres://rushhour:rushhour_dev@localhost:5432/rushhour_db?sslmode=disable
```

Для продакшн укажите соответствующий URL при запросе

## Работа с API (OpenAPI-first)

Проект использует **OpenAPI-first подход**: сначала описываем API в `api/openapi.yaml`, затем генерируем код.

### Алгоритм изменения/добавления API

1. **Изменить OpenAPI спецификацию** (`api/openapi.yaml`):

   - Добавить/изменить эндпоинты в `paths`
   - Добавить/изменить схемы в `components/schemas`
   - Обновить параметры запросов/ответов

2. **Сгенерировать код**:

   ```bash
   make generate
   ```

   Это создаст/обновит:

   - Типы в `internal/generated/api.gen.go`
   - Интерфейс `ServerInterface` с методами для всех эндпоинтов
   - Параметры запросов (например, `ListAreasParams`, `ListLotsParams`)

3. **Обновить handlers**:

   - Компилятор покажет ошибки, если `Server` не реализует все методы из `generated.ServerInterface`
   - Добавить/обновить методы в соответствующих handlers:
     - `internal/handlers/areas.go` - для `/areas`
     - `internal/handlers/projects.go` - для `/projects`
     - `internal/handlers/lots.go` - для `/lots`
     - `internal/handlers/leads.go` - для `/leads`
   - Использовать generated типы для request/response (не создавать свои DTO)

4. **Реализовать методы в Server** (`cmd/server/main.go`):

   - `Server` должен реализовывать `generated.ServerInterface`
   - Методы Server делегируют вызовы соответствующим handlers

5. **Проверить компиляцию**:
   ```bash
   go build ./cmd/server
   ```
   Если есть ошибки - компилятор покажет что нужно исправить

### Пример: добавление нового эндпоинта

**1. Добавить в `api/openapi.yaml`:**

```yaml
paths:
  /developers:
    get:
      operationId: listDevelopers
      summary: Получить список застройщиков
      responses:
        "200":
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Developer"
```

**2. Запустить генерацию:**

```bash
make generate
```

**3. Компилятор покажет ошибку:**

```
cmd/server/main.go:XX:XX: cannot use server (type *Server) as generated.ServerInterface value:
Server does not implement generated.ServerInterface: missing method ListDevelopers
```

**4. Добавить handler** (`internal/handlers/developers.go`):

```go
func (h *DevelopersHandler) ListDevelopers(c *fiber.Ctx, params generated.ListDevelopersParams) error {
    // реализация
}
```

**5. Добавить метод в Server** (`cmd/server/main.go`):

```go
func (s *Server) ListDevelopers(c *fiber.Ctx, params generated.ListDevelopersParams) error {
    return s.developersHandler.ListDevelopers(c, params)
}
```

**6. Проверить компиляцию:**

```bash
go build ./cmd/server
```

### Важные моменты

- **Всегда запускайте `make generate` после изменения OpenAPI** - иначе код не синхронизирован
- **Используйте generated типы** - не создавайте свои DTO, они не синхронизируются с OpenAPI
- **Мапперы только на границе** - handlers используют generated типы, services/repo используют domain модели
- **Роуты регистрируются автоматически** - `generated.RegisterHandlers` создает роуты из OpenAPI, не нужно добавлять вручную

### Просмотр документации API

После запуска сервера:

- Swagger UI: http://localhost:8080/swagger
- OpenAPI файл: http://localhost:8080/api/openapi.yaml

## Переменные окружения

- `DB_HOST` - хост БД (по умолчанию: localhost)
- `DB_PORT` - порт БД (по умолчанию: 5432)
- `DB_USER` - пользователь БД (по умолчанию: rushhour)
- `DB_PASSWORD` - пароль БД (по умолчанию: rushhour_dev)
- `DB_NAME` - имя БД (по умолчанию: rushhour_db)
- `DB_SSLMODE` - SSL режим (по умолчанию: disable)
- `PORT` - порт сервера (по умолчанию: 8080)

## Важно!

После обновления кода с изменениями в seed:
- Остановите контейнеры: `docker-compose -f docker-compose.dev.yml down -v`
- Запустите заново: `docker-compose -f docker-compose.dev.yml up -d`
- Без `-v` новые seed данные не загрузятся

Или используй скрипт reset-dev.sh для сброса среды разработки со свежими исходными данными.

bash
./reset-dev.sh
Что он делает: останавливает все запущенные контейнеры, удаляет объем базы данных (необходимый для загрузки новых исходных данных), запускает новые контейнеры с обновленными исходными данными.

Когда это следует использовать: после внесения изменений, обновляющих seed.sql; когда база данных находится в несогласованном состоянии.
