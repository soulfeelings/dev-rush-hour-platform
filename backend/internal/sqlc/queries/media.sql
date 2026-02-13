-- name: CreateMedia :one
INSERT INTO media (storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, created_at, updated_at;

-- name: GetMediaByID :one
SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
FROM media
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetMediaByStorageKey :one
SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
FROM media
WHERE storage_key = $1 AND deleted_at IS NULL;

-- name: GetMediaByIDs :many
SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
FROM media
WHERE id = ANY($1::uuid[]) AND status = 'ready' AND deleted_at IS NULL;

-- name: UpdateMediaStatus :exec
UPDATE media
SET status = $1, updated_at = NOW()
WHERE id = $2 AND deleted_at IS NULL;

-- name: UpdateMediaSizeBytes :exec
UPDATE media
SET size_bytes = $1, updated_at = NOW()
WHERE id = $2 AND deleted_at IS NULL;

-- name: SoftDeleteMedia :exec
UPDATE media
SET status = $1, deleted_at = $2, updated_at = $2
WHERE id = $3 AND deleted_at IS NULL;

-- name: ListMediaWithStatus :many
SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
FROM media
WHERE status = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListMedia :many
SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
FROM media
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
