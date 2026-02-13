-- name: CreateLead :one
INSERT INTO leads (status, type, source, project_id, lot_id, name, phone, email, data)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, created_at, updated_at;

-- name: GetLeadByID :one
SELECT id, status, type, source, project_id, lot_id, name, phone, email, data, created_at, updated_at, deleted_at
FROM leads
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListLeads :many
SELECT id, status, type, source, project_id, lot_id, name, phone, email, data, created_at, updated_at
FROM leads
WHERE deleted_at IS NULL
  AND (sqlc.narg('status')::text IS NULL OR status = sqlc.narg('status'))
ORDER BY created_at DESC;

-- name: UpdateLead :one
UPDATE leads
SET status = $1, type = $2, source = $3, project_id = $4, lot_id = $5,
    name = $6, phone = $7, email = $8, data = $9, updated_at = NOW()
WHERE id = $10 AND deleted_at IS NULL
RETURNING updated_at;

-- name: DeleteLead :exec
UPDATE leads
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;
