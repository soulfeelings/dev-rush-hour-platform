# Backend Agent Instructions

## Tech Stack
- Go + Fiber (HTTP framework) + pgx/v5 (PostgreSQL driver)
- sqlc (SQL → type-safe Go code generation)
- OpenAPI-first approach with oapi-codegen

## Code Generation

Two code generators are used. Always run them after relevant changes:

- **`make generate`** — regenerates Go types/handlers from `api/openapi.yaml`
- **`make sqlc`** — regenerates Go query code from `internal/sqlc/queries/*.sql`

## Database Layer Architecture

### sqlc (static queries)
- SQL queries live in `internal/sqlc/queries/<entity>.sql` with annotations like `-- name: GetCityByID :one`
- `sqlc generate` validates queries against the DB schema (from `internal/migrations/`) and produces type-safe Go code in `internal/sqlc/sqlcgen/`
- **Never edit files in `internal/sqlc/sqlcgen/`** — they are auto-generated

### Repo layer (`internal/repo/`)
- Each repo struct has `queries *sqlcgen.Queries` for sqlc-generated methods
- Repos with dynamic queries or transactions also have `pool *pgxpool.Pool`
- Constructor: `func NewXxxRepo(pool *pgxpool.Pool) *XxxRepo`
- Not found: `errors.Is(err, pgx.ErrNoRows)` → return `nil, nil`
- Type conversions (pgtype ↔ Go): use helpers from `internal/repo/convert.go`
- Each repo has `sqlcXxxToDomain()` converter functions

### Dynamic queries
- `ProjectRepo.List()` and `LotRepo.List()` have complex conditional WHERE clauses
- These stay hand-written in Go using `pool.Query()` directly — sqlc doesn't support dynamic query building

## Adding a New Query

1. Write SQL in `internal/sqlc/queries/<entity>.sql`
2. Run `make sqlc`
3. Call the generated method from the repo file: `r.queries.MethodName(ctx, params)`

## Adding a New Entity

1. Create migration in `internal/migrations/`
2. Create `internal/sqlc/queries/<entity>.sql` with all queries
3. Run `make sqlc`
4. Create `internal/repo/<entity>.go` with repo struct, constructor, and converter
5. Create `internal/domain/<entity>.go` with domain model
6. Wire in `cmd/server/main.go`

## Key Files
- `internal/repo/convert.go` — pgtype ↔ Go type conversion helpers
- `internal/repo/db.go` — pgxpool connection setup
- `cmd/server/main.go` — wiring (repos → services → handlers)
- `sqlc.yaml` — sqlc configuration

## Conventions
- Domain models in `internal/domain/` — no database-specific types
- Handlers use generated OpenAPI types, services/repos use domain types
- Mappers between generated ↔ domain types live in `internal/mappers/`
- Soft delete: `deleted_at IS NULL` filter in queries, `DeleteXxx` sets timestamp, `HardDeleteXxx` actually removes
