# Rush Hour MVP — Server Plan (Go + Fiber + Postgres JSONB)

Цель: поднять MVP-сервер для публичного портала недвижимости (без кабинета юзеров), где контент (Projects/Lots/Areas/Developers) добавляем мы, а пользователи оставляют заявки (Leads). Хранилище: Postgres + JSONB, но ключевые поля для фильтров — в колонках.

---

## 0) Decisions / Guardrails

- ✅ Framework: **Fiber**
- ✅ DB: **Postgres**
- ✅ "Документность": поле `data jsonb` для вложенного/гибкого, **но** все поля под фильтры/сортировки — в **колонках**
- ✅ Публичные эндпоинты: `GET` (листинги/проекты/районы) + `POST /leads`
- ❌ Админ-эндпоинты (закрытые): CRUD для Areas/Developers/Projects/Lots + просмотр Leads
- ✅ Карта районов: `areas.data.boundary` хранит **GeoJSON Polygon** (координаты `[lng, lat]`) + `center`, `zoom`, `bbox`

---

## 1) Repository & Project Structure

### 1.1 Скелет папок

- ✅ `/cmd/server` — entrypoint (вместо `/cmd/api`)
- ✅ `/internal/config` — env config
- ⚠️ `/internal/http` — Fiber app setup в `/cmd/server/main.go` (не отдельная папка)
- ✅ `/internal/handlers` — HTTP handlers (тонкие)
- ✅ `/internal/services` — бизнес-логика
- ✅ `/internal/repo` — доступ к БД (SQL)
- ✅ `/internal/domain` — модели/enum/валидация
- ✅ `/internal/dto` — request/response DTO (используются generated типы)
- ✅ `/internal/migrations` — миграции
- ✅ `/pkg/logger` — логгер (папка есть)
- ✅ `/pkg/errs` — стандарт ошибок + маппинг в HTTP (папка есть)

### 1.2 Инфраструктура

- ✅ docker-compose для Postgres
- ✅ миграции: **golang-migrate** (выбран и зафиксирован)
- ✅ Makefile: `make dev`, `make migrate-up`, `make migrate-down` (есть, но нет `make test` и `make run`)

---

## 2) Database Schema (JSONB + columns)

Создать таблицы:

- ✅ `developers`
- ✅ `areas`
- ✅ `projects`
- ✅ `lots`
- ✅ `leads`

### 2.1 Правило "one source of truth"

- ✅ Если поле в **колонке**, его **не дублируем** в `data`.
- ✅ `data jsonb` хранит только вложенные/контентные части (media, описание, amenities, paymentPlan, boundary и т.д.).

### 2.2 Таблицы и ключевые поля

#### developers

✅ Колонки: `id, slug (unique), name, status, data jsonb, created_at, updated_at`

#### areas

✅ Колонки: `id, slug (unique), name, city, lat, lng, status, data jsonb`
✅ `data` содержит:

- ✅ `boundary` GeoJSON Geometry Polygon
- ✅ `center` {lat,lng}, `zoom`, `bbox` {southWest, northEast}
- ✅ (опц.) seo

#### projects

✅ Колонки: `id, slug (unique), name, status, developer_id (fk), area_id (fk), lat, lng, data jsonb`
✅ `data` содержит:

- ✅ `description` (string или i18n map)
- ✅ `specs` (floorToCeilingHeight, unitsPerFloor)
- ✅ `featuresAmenities` (list)
- ✅ `media` (cover, gallery)

#### lots

✅ Колонки (под фильтры/сортировки):

- ✅ `id, status`
- ✅ `project_id (fk), developer_id (fk), area_id (fk)`
- ✅ `type, bedrooms, bathrooms`
- ✅ `area_sqm, floor`
- ✅ `price_currency, price_amount`
- ✅ `bonus_keys text[]` (для фильтра "есть бонус")
- ✅ `data jsonb`
  ✅ `data` содержит:
- ✅ `media` (photos, floorPlanImages, cover)
- ✅ `paymentPlan` (schedule)
- ✅ `bonuses` (title/style/description)
- ✅ `floorPosition` (label/x/y)
- ✅ `tags`

#### leads

✅ Колонки: `id, status, type, source, project_id?, lot_id?, name, phone, email, data jsonb`
✅ `data` содержит:

- ✅ `preferred`, `comment`
- ✅ `pageUrl`, `utm`

---

## 3) Indexes (must-have)

### lots

- ✅ `project_id`, `area_id`, `status`, `type`, `bedrooms`
- ✅ `price_amount`, `area_sqm`
- ✅ `GIN(bonus_keys)`
- ✅ Композитный под список: `(status, area_id, type, bedrooms, price_amount)`
- ✅ `GIN(data jsonb_path_ops)` — опционально, если будет поиск по jsonb

### projects

- ✅ `developer_id`, `area_id`, `status`
- ✅ `slug unique` (в схеме таблицы)

### areas

- ✅ `slug unique` (в схеме таблицы), `city`

### leads

- ✅ `status`, `project_id`, `lot_id`, `created_at desc`

---

## 4) Domain Enums / Constraints

- ✅ `status`:
  - ✅ projects: `active|archived`
  - ✅ lots: `active|hidden|reserved|sold`
  - ✅ developers/areas: `active|inactive`
  - ✅ leads: `new|in_progress|done|spam`
- ✅ lot.type: `apartment|villa|townhouse|penthouse`
- ✅ lead.type: `callback|viewing|details`
- ✅ price currency: `AED` (MVP)

---

## 5) Public API (MVP)

### 5.1 Areas (для карты)

- ✅ `GET /api/areas`
  - ✅ query: `include=boundary` (если нужно отдавать границу)
  - ✅ returns: `[{id, slug, name, city, data.center, data.zoom, data.bbox, data.boundary?}]`
- ✅ `GET /api/areas/:slug`

### 5.2 Projects

- ✅ `GET /api/projects`
  - ✅ фильтр: `area=slug`
- ✅ `GET /api/projects/:slug`
  - ✅ returns: проект + первые N лотов (если указан параметр `includeLots`)

### 5.3 Lots (главный каталог)

- ✅ `GET /api/lots`
  - ✅ filters: `area=slug`, `project=slug`, `type`, `bedrooms`, `priceMin/priceMax`, `areaMin/areaMax`, `bonus=key`, `status=active`
  - ✅ sort: `price_asc|price_desc|area_desc|newest`
  - ✅ pagination: `page, limit`
- ✅ `GET /api/lots/:id`

### 5.4 Leads

- ✅ `POST /api/leads`
  - ✅ body: contact + `lotId?` + `projectId?` + preferred + comment + utm
  - ✅ rate-limit + basic anti-spam (минимум) — реализовано: 5 запросов в минуту с одного IP

---

## 6) Admin API (закрытый MVP)

✅ Защита: API Key header (`X-Admin-Key`) + allowlist IP (опционально) — реализовано через middleware

- ✅ `POST /admin/developers`, `PATCH /admin/developers/:id`, `GET /admin/developers`
- ✅ `POST /admin/areas`, `PATCH /admin/areas/:id`, `GET /admin/areas`
- ✅ `POST /admin/projects`, `PATCH /admin/projects/:id`, `GET /admin/projects`
- ✅ `POST /admin/lots`, `PATCH /admin/lots/:id`, `GET /admin/lots`
- ✅ `GET /admin/leads?status=new`

---

## 7) Media Strategy (MVP)

- ✅ Храним только ссылки и метаданные в `data.media`
- ✅ Загрузка:
  - ✅ MVP: `/api/admin/media/upload` (сервер принимает файл и сохраняет локально)
  - ⚠️ потом: presigned upload (не реализовано, можно добавить S3/R2/MinIO)
- ✅ В `data.media` хранить:
  - ✅ `cover`, `photos[]`, `floorPlanImages[]` как `{id, url}`

---

## 8) Validation & Error Handling

- ✅ Валидация входа:
  - ✅ обязательные поля (slug/name/type/price_amount/area_id/project_id) — через validator
  - ✅ GeoJSON polygon должен быть замкнутым — реализована валидация
  - ✅ Координаты boundary строго `[lng, lat]` — валидация проверяет формат и диапазон
- ✅ Единый формат ошибок:
  - ✅ `{ "error": { "code": "...", "message": "...", "details": ... } }`

---

## 9) Query Implementation Notes

- ✅ Фильтры/сортировки реализовать **через колонки** таблицы `lots`
- ✅ `area=slug` -> сначала получить `area_id` по slug
- ✅ `project=slug` -> получить `project_id` по slug
- ✅ `bonus=goldenVisa` -> `bonus_keys @> ARRAY['goldenVisa']`

---

## 10) Testing / Smoke

Минимум:

- ❌ unit: валидация DTO (lead create, lot create) — тестов нет
- ❌ integration: `GET /api/lots` с фильтрами + пагинация — тестов нет
- ✅ smoke: миграции поднимаются, эндпоинты отвечают (healthcheck есть)

---

## 11) Milestones (порядок выполнения)

1. ✅ Поднять Postgres + миграции, создать таблицы и индексы
2. ✅ Собрать базовый Fiber app + middlewares + healthcheck
3. ✅ Реализовать repo/services для Areas/Projects/Lots (read-only public)
4. ✅ Реализовать public API: areas/projects/lots
5. ⚠️ Реализовать leads (POST) + rate limit (leads есть, rate limit нет)
6. ❌ Реализовать admin API (API key) + CRUD для контента
7. ❌ Добавить media upload (или заглушку на URL)
8. ❌ Добавить базовые тесты и smoke сценарии
9. ✅ Документация API (OpenAPI/Swagger или md)

---

## 12) Done Criteria (Definition of Done)

- ⚠️ Можно:
  - ✅ создать Area с boundary (GeoJSON) и увидеть её в `/api/areas?include=boundary` (структура есть, но нет админки для создания)
  - ✅ создать Project и привязать к area/developer (структура есть, но нет админки)
  - ✅ создать Lots с бонусами и видеть фильтры по району/типу/спальням/цене/площади/бонусам (фильтры работают, но нет админки для создания)
  - ✅ оставлять Lead по лоту или по проекту
- ✅ Публичные списки работают быстро (индексы), ошибок 500 нет, валидация корректная

---
