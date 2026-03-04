-- name: GetProjectBySlug :one
SELECT p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng,
	p.description, p.media, p.features_amenities, p.tags, p.is_featured, p.youtube_url, p.google_maps_url,
	p.roi, p.price_from_us, p.price_from_developer, p.payment_plan, p.completion_date,
	p.currency, p.property_types, p.bedrooms, p.bathrooms, p.area_size, p.area_unit, p.prices_by_type,
	p.timeline_announcement, p.timeline_booking_started, p.timeline_construction_started,
	p.timeline_construction_progress, p.timeline_construction_progress_pct, p.timeline_expected_completion,
	p.created_at, p.updated_at,
	d.name as dev_name, d.logo_url as dev_logo_url,
	a.name as area_name, a.city as area_city
FROM projects p
LEFT JOIN developers d ON p.developer_id = d.id
LEFT JOIN areas a ON p.area_id = a.id
WHERE p.slug = $1 AND p.deleted_at IS NULL;

-- name: GetProjectIDBySlug :one
SELECT id FROM projects WHERE slug = $1 AND deleted_at IS NULL;

-- name: GetProjectByID :one
SELECT id, slug, name, status, sale, developer_id, area_id, lat, lng,
	description, media, features_amenities, tags, is_featured, youtube_url, google_maps_url,
	roi, price_from_us, price_from_developer, payment_plan, completion_date,
	currency, property_types, bedrooms, bathrooms, area_size, area_unit, prices_by_type,
	timeline_announcement, timeline_booking_started, timeline_construction_started,
	timeline_construction_progress, timeline_construction_progress_pct, timeline_expected_completion,
	created_at, updated_at, deleted_at
FROM projects
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateProject :one
INSERT INTO projects (slug, name, status, sale, developer_id, area_id, lat, lng,
	description, media, features_amenities, tags, is_featured, youtube_url, google_maps_url,
	roi, price_from_us, price_from_developer, payment_plan, completion_date,
	currency, property_types, bedrooms, bathrooms, area_size, area_unit, prices_by_type,
	timeline_announcement, timeline_booking_started, timeline_construction_started,
	timeline_construction_progress, timeline_construction_progress_pct, timeline_expected_completion)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
	$9, $10, $11, $12, $13, $14, $15,
	$16, $17, $18, $19, $20,
	$21, $22, $23, $24, $25, $26, $27,
	$28, $29, $30, $31, $32, $33)
RETURNING id, created_at, updated_at;

-- name: UpdateProject :one
UPDATE projects SET
	slug = $1, name = $2, status = $3, sale = $4, developer_id = $5, area_id = $6, lat = $7, lng = $8,
	description = $9, media = $10, features_amenities = $11, tags = $12, is_featured = $13, youtube_url = $14, google_maps_url = $15,
	roi = $16, price_from_us = $17, price_from_developer = $18, payment_plan = $19, completion_date = $20,
	currency = $21, property_types = $22, bedrooms = $23, bathrooms = $24, area_size = $25, area_unit = $26, prices_by_type = $27,
	timeline_announcement = $28, timeline_booking_started = $29, timeline_construction_started = $30,
	timeline_construction_progress = $31, timeline_construction_progress_pct = $32, timeline_expected_completion = $33,
	updated_at = NOW()
WHERE id = $34 AND deleted_at IS NULL
RETURNING updated_at;

-- name: DeleteProject :exec
UPDATE projects
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAllProjects :many
SELECT p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng,
	p.description, p.media, p.features_amenities, p.tags, p.is_featured, p.youtube_url, p.google_maps_url,
	p.roi, p.price_from_us, p.price_from_developer, p.payment_plan, p.completion_date,
	p.currency, p.property_types, p.bedrooms, p.bathrooms, p.area_size, p.area_unit, p.prices_by_type,
	p.timeline_announcement, p.timeline_booking_started, p.timeline_construction_started,
	p.timeline_construction_progress, p.timeline_construction_progress_pct, p.timeline_expected_completion,
	p.created_at, p.updated_at, p.deleted_at,
	d.name as dev_name, d.logo_url as dev_logo_url,
	a.name as area_name, a.city as area_city
FROM projects p
LEFT JOIN developers d ON p.developer_id = d.id
LEFT JOIN areas a ON p.area_id = a.id
WHERE p.deleted_at IS NULL
ORDER BY p.name;

-- name: ListDeletedProjects :many
SELECT p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng,
	p.description, p.media, p.features_amenities, p.tags, p.is_featured, p.youtube_url, p.google_maps_url,
	p.roi, p.price_from_us, p.price_from_developer, p.payment_plan, p.completion_date,
	p.currency, p.property_types, p.bedrooms, p.bathrooms, p.area_size, p.area_unit, p.prices_by_type,
	p.timeline_announcement, p.timeline_booking_started, p.timeline_construction_started,
	p.timeline_construction_progress, p.timeline_construction_progress_pct, p.timeline_expected_completion,
	p.created_at, p.updated_at, p.deleted_at,
	d.name as dev_name, d.logo_url as dev_logo_url,
	a.name as area_name, a.city as area_city
FROM projects p
LEFT JOIN developers d ON p.developer_id = d.id
LEFT JOIN areas a ON p.area_id = a.id
WHERE p.deleted_at IS NOT NULL
ORDER BY p.deleted_at DESC;

-- name: GetProjectByIDWithDeleted :one
SELECT id, slug, name, status, sale, developer_id, area_id, lat, lng,
	description, media, features_amenities, tags, is_featured, youtube_url, google_maps_url,
	roi, price_from_us, price_from_developer, payment_plan, completion_date,
	currency, property_types, bedrooms, bathrooms, area_size, area_unit, prices_by_type,
	timeline_announcement, timeline_booking_started, timeline_construction_started,
	timeline_construction_progress, timeline_construction_progress_pct, timeline_expected_completion,
	created_at, updated_at, deleted_at
FROM projects
WHERE id = $1;

-- name: RestoreProject :exec
UPDATE projects
SET deleted_at = NULL
WHERE id = $1 AND deleted_at IS NOT NULL;

-- name: HardDeleteProject :exec
DELETE FROM projects WHERE id = $1;

-- name: RecalculateProjectPrices :exec
UPDATE projects SET
	price_from_us = (SELECT MIN(l.price_from_us) FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL),
	price_from_developer = (SELECT MIN(l.price_from_developer) FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL AND l.price_from_developer IS NOT NULL),
	roi = (SELECT MAX(l.roi) FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL AND l.roi IS NOT NULL),
	prices_by_type = (
		SELECT json_agg(json_build_object('type', label, 'price', min_price) ORDER BY label)
		FROM (
			SELECT
				CASE
					WHEN LOWER(type) = 'apartment' AND bedrooms IS NOT NULL THEN
						type || ' ' || CASE
							WHEN bedrooms = 0 THEN 'studio'
							WHEN bedrooms = 1 THEN '1 bed'
							WHEN bedrooms = 2 THEN '2 beds'
							WHEN bedrooms >= 3 THEN '3+ beds'
							ELSE bedrooms::text || ' beds'
						END
					ELSE type
				END as label,
				MIN(price_from_us) as min_price
			FROM lots
			WHERE project_id = $1 AND deleted_at IS NULL
			GROUP BY 1
		) sub
	),
	property_types = (SELECT COALESCE(ARRAY_AGG(DISTINCT l.type), '{}') FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL AND l.type IS NOT NULL),
	bedrooms = (SELECT COALESCE(ARRAY_AGG(DISTINCT l.bedrooms::text), '{}') FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL AND l.bedrooms IS NOT NULL),
	bathrooms = (SELECT COALESCE(ARRAY_AGG(DISTINCT l.bathrooms::text), '{}') FROM lots l WHERE l.project_id = $1 AND l.deleted_at IS NULL AND l.bathrooms IS NOT NULL),
	updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;
