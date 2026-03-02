-- name: GetAreaBySlug :one
SELECT a.id, a.slug, a.name, a.city, a.city_id, a.status, a.data, a.created_at, a.updated_at
FROM areas a
WHERE a.slug = $1 AND a.deleted_at IS NULL;

-- name: ListAreas :many
SELECT id, slug, name, city, city_id, status, data, created_at, updated_at
FROM areas
WHERE status = 'active' AND deleted_at IS NULL
ORDER BY name;

-- name: GetAreaIDBySlug :one
SELECT id FROM areas WHERE slug = $1 AND deleted_at IS NULL;

-- name: CreateArea :one
INSERT INTO areas (slug, name, city, city_id, status, data)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, created_at, updated_at;

-- name: UpdateArea :one
UPDATE areas
SET slug = $1, name = $2, city = $3, status = $4, data = $5, updated_at = NOW()
WHERE id = $6 AND deleted_at IS NULL
RETURNING updated_at;

-- name: GetAreaByID :one
SELECT id, slug, name, city, status, data, created_at, updated_at, deleted_at
FROM areas
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAllAreas :many
SELECT id, slug, name, city, status, data, created_at, updated_at, deleted_at
FROM areas
WHERE deleted_at IS NULL
ORDER BY name;

-- name: DeleteArea :exec
UPDATE areas
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListDeletedAreas :many
SELECT id, slug, name, city, status, data, created_at, updated_at, deleted_at
FROM areas
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: GetAreaByIDWithDeleted :one
SELECT id, slug, name, city, status, data, created_at, updated_at, deleted_at
FROM areas
WHERE id = $1;

-- name: RestoreArea :exec
UPDATE areas
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteArea :exec
DELETE FROM areas WHERE id = $1;
