-- name: GetLotByID :one
SELECT
	l.id, l.status, l.project_id, l.type, l.bedrooms, l.bathrooms,
	l.area_sqm, l.floor, l.price_from_us, l.price_from_developer, l.roi, l.bonus_keys, l.badge_ids, l.data, l.created_at, l.updated_at, l.deleted_at,
	p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.media, p.is_featured, p.payment_plan, p.created_at, p.updated_at,
	d.slug, d.name, d.created_at, d.updated_at,
	a.slug, a.name, a.lat, a.lng, a.created_at, a.updated_at
FROM lots l
LEFT JOIN projects p ON l.project_id = p.id
LEFT JOIN developers d ON p.developer_id = d.id
LEFT JOIN areas a ON p.area_id = a.id
WHERE l.id = $1 AND l.deleted_at IS NULL;

-- name: CreateLot :one
INSERT INTO lots (status, project_id, type, bedrooms, bathrooms, area_sqm, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING id, created_at, updated_at;

-- name: UpdateLot :one
UPDATE lots
SET status = $1, project_id = $2, type = $3, bedrooms = $4, bathrooms = $5, area_sqm = $6, floor = $7, price_from_us = $8, price_from_developer = $9, roi = $10, bonus_keys = $11, badge_ids = $12, data = $13, updated_at = NOW()
WHERE id = $14 AND deleted_at IS NULL
RETURNING updated_at;

-- name: GetLotsByProjectID :many
SELECT id, status, project_id, type, bedrooms, bathrooms,
       area_sqm, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data, created_at, updated_at
FROM lots
WHERE project_id = $1 AND status = 'active'
ORDER BY created_at DESC
LIMIT $2;

-- name: DeleteLot :exec
UPDATE lots
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAllLots :many
SELECT id, status, project_id, type, bedrooms, bathrooms,
       area_sqm, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
FROM lots
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: ListDeletedLots :many
SELECT id, status, project_id, type, bedrooms, bathrooms,
       area_sqm, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
FROM lots
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- name: GetLotByIDWithDeleted :one
SELECT id, status, project_id, type, bedrooms, bathrooms,
       area_sqm, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
FROM lots
WHERE id = $1;

-- name: RestoreLot :exec
UPDATE lots
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteLot :exec
DELETE FROM lots WHERE id = $1;
