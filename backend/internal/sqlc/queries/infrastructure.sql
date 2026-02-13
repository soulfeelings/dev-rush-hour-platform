-- name: ListAllInfrastructures :many
SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
FROM infrastructures
WHERE deleted_at IS NULL
ORDER BY sort_order, name;

-- name: ListDeletedInfrastructures :many
SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
FROM infrastructures
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: GetInfrastructureByID :one
SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
FROM infrastructures
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetInfrastructureByIDWithDeleted :one
SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
FROM infrastructures
WHERE id = $1;

-- name: CreateInfrastructure :one
INSERT INTO infrastructures (slug, name, background_color, text_color, icon, sort_order)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, created_at, updated_at;

-- name: UpdateInfrastructure :one
UPDATE infrastructures
SET slug = $1, name = $2, background_color = $3, text_color = $4, icon = $5, sort_order = $6, updated_at = NOW()
WHERE id = $7 AND deleted_at IS NULL
RETURNING updated_at;

-- name: DeleteInfrastructure :exec
UPDATE infrastructures
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: RestoreInfrastructure :exec
UPDATE infrastructures
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteInfrastructure :exec
DELETE FROM infrastructures WHERE id = $1;
