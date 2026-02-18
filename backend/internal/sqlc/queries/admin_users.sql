-- name: GetAdminUserByEmail :one
SELECT id, email, role, permissions, created_at, created_by
FROM admin_users
WHERE email = $1;

-- name: ListAdminUsers :many
SELECT id, email, role, permissions, created_at, created_by
FROM admin_users
ORDER BY created_at;

-- name: CreateAdminUser :one
INSERT INTO admin_users (email, role, permissions, created_by)
VALUES ($1, $2, $3, $4)
RETURNING id, created_at;

-- name: UpdateAdminUser :exec
UPDATE admin_users
SET role = $1, permissions = $2
WHERE id = $3;

-- name: DeleteAdminUser :exec
DELETE FROM admin_users WHERE id = $1;

-- name: CountAdminUsers :one
SELECT COUNT(*) FROM admin_users;
