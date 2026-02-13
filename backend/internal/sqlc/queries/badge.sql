-- name: ListBadges :many
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at
FROM badges
WHERE deleted_at IS NULL
ORDER BY sort_order, name;

-- name: ListAllBadges :many
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at, deleted_at
FROM badges
WHERE deleted_at IS NULL
ORDER BY sort_order, name;

-- name: GetBadgeByID :one
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at, deleted_at
FROM badges
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetBadgeBySlug :one
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at
FROM badges
WHERE slug = $1 AND deleted_at IS NULL;

-- name: CreateBadge :one
INSERT INTO badges (slug, name, background_color, text_color, icon, icon_color, sort_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, created_at, updated_at;

-- name: UpdateBadge :one
UPDATE badges
SET slug = $1, name = $2, background_color = $3, text_color = $4, icon = $5, icon_color = $6, sort_order = $7, updated_at = NOW()
WHERE id = $8 AND deleted_at IS NULL
RETURNING updated_at;

-- name: DeleteBadge :exec
UPDATE badges
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetProjectBadges :many
SELECT b.id, b.slug, b.name, b.background_color, b.text_color, b.icon, b.icon_color, b.sort_order, b.created_at, b.updated_at
FROM badges b
INNER JOIN project_badges pb ON b.id = pb.badge_id
WHERE pb.project_id = $1 AND b.deleted_at IS NULL
ORDER BY pb.sort_order, b.sort_order;

-- name: DeleteProjectBadges :exec
DELETE FROM project_badges WHERE project_id = $1;

-- name: InsertProjectBadge :exec
INSERT INTO project_badges (project_id, badge_id, sort_order)
VALUES ($1, $2, $3);

-- name: ListDeletedBadges :many
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at, deleted_at
FROM badges
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: GetBadgeByIDWithDeleted :one
SELECT id, slug, name, background_color, text_color, icon, icon_color, sort_order, created_at, updated_at, deleted_at
FROM badges
WHERE id = $1;

-- name: RestoreBadge :exec
UPDATE badges
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteBadge :exec
DELETE FROM badges WHERE id = $1;
