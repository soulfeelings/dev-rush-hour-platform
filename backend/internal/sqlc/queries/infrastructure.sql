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

-- name: GetProjectInfrastructures :many
SELECT i.id, i.slug, i.name, i.background_color, i.text_color, i.icon, i.sort_order, i.created_at, i.updated_at, i.deleted_at
FROM infrastructures i
INNER JOIN project_infrastructures pi ON i.id = pi.infrastructure_id
WHERE pi.project_id = $1 AND i.deleted_at IS NULL
ORDER BY pi.sort_order, i.sort_order;

-- name: DeleteProjectInfrastructures :exec
DELETE FROM project_infrastructures WHERE project_id = $1;

-- name: InsertProjectInfrastructure :exec
INSERT INTO project_infrastructures (project_id, infrastructure_id, sort_order)
VALUES ($1, $2, $3);
