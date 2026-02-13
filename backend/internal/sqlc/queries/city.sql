-- name: ListCities :many
SELECT id, slug, name, created_at, updated_at
FROM cities
WHERE deleted_at IS NULL
ORDER BY name;

-- name: GetCityBySlug :one
SELECT id, slug, name, created_at, updated_at
FROM cities
WHERE slug = $1 AND deleted_at IS NULL;

-- name: GetCityByID :one
SELECT id, slug, name, created_at, updated_at, deleted_at
FROM cities
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateCity :one
INSERT INTO cities (slug, name)
VALUES ($1, $2)
RETURNING id, created_at, updated_at;

-- name: UpdateCity :one
UPDATE cities
SET slug = $1, name = $2, updated_at = NOW()
WHERE id = $3 AND deleted_at IS NULL
RETURNING updated_at;

-- name: DeleteCity :exec
UPDATE cities
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAllCities :many
SELECT id, slug, name, created_at, updated_at, deleted_at
FROM cities
WHERE deleted_at IS NULL
ORDER BY name;

-- name: ListDeletedCities :many
SELECT id, slug, name, created_at, updated_at, deleted_at
FROM cities
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: GetCityByIDWithDeleted :one
SELECT id, slug, name, created_at, updated_at, deleted_at
FROM cities
WHERE id = $1;

-- name: RestoreCity :exec
UPDATE cities
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteCity :exec
DELETE FROM cities WHERE id = $1;
