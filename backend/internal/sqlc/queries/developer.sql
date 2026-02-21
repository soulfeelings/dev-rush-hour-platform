-- name: CreateDeveloper :one
INSERT INTO developers (slug, name, status, logo_url)
VALUES ($1, $2, $3, $4)
RETURNING id, created_at, updated_at, deleted_at;

-- name: UpdateDeveloper :one
UPDATE developers
SET slug = $1, name = $2, status = $3, logo_url = $4, updated_at = NOW()
WHERE id = $5 AND deleted_at IS NULL
RETURNING updated_at;

-- name: GetDeveloperByID :one
SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
FROM developers
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetDeveloperByIDWithDeleted :one
SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
FROM developers
WHERE id = $1;

-- name: ListDevelopers :many
SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
FROM developers
WHERE deleted_at IS NULL
ORDER BY name;

-- name: ListDeletedDevelopers :many
SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
FROM developers
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: ListWithDeletedDevelopers :many
SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
FROM developers
ORDER BY name;

-- name: DeleteDeveloper :exec
UPDATE developers
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: RestoreDeveloper :exec
UPDATE developers
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteDeveloper :exec
DELETE FROM developers WHERE id = $1;
