# Feature: Extend RBAC with Owner Role

## Goal

Introduce a 3-tier role hierarchy: **Owner** > **SuperAdmin** > **Admin**, where:
- One **Owner** can create and manage SuperAdmins
- **SuperAdmins** can manage the Team page (admin users)
- **Admins** have granular entity-level permissions

## Current State

| Role | Capabilities |
|------|-------------|
| **superadmin** | Bypasses all permission checks, manages team page |
| **admin** | Entity-level permissions (`cities:view`, `projects:create`, etc.) |

- Only 2 roles: `superadmin` and `admin`
- Superadmin is auto-created on first login via `SUPERADMIN_EMAIL` env var
- Cannot invite new superadmins — UI only allows inviting `admin` role
- Team management is restricted to superadmins only

## Desired Hierarchy

| Role | Can Manage | Permissions |
|------|-----------|-------------|
| **owner** (1 person) | SuperAdmins + Admins | Bypasses all checks |
| **superadmin** | Admins only | Bypasses all entity checks |
| **admin** | Nothing | Controlled by permissions array |

## Implementation Plan

### 1. Database

No schema migration needed — `role` column is `TEXT` with no constraint. Just update logic.

### 2. Backend Changes

| File | Change |
|------|--------|
| `backend/internal/domain/admin_user.go` | Add `owner` to role documentation |
| `backend/internal/services/admin_auth.go` | Bootstrap: first user gets `owner` role instead of `superadmin` |
| `backend/internal/handlers/admin_team.go` | **AddTeamMember**: owner can assign `superadmin`; superadmin can assign `admin` only |
| `backend/internal/handlers/admin_team.go` | **UpdateTeamMember**: owner can edit superadmins; superadmins can only edit admins |
| `backend/internal/handlers/admin_team.go` | **RemoveTeamMember**: owner can remove superadmins; superadmins can remove admins only |
| `backend/internal/middleware/require_entity_permission.go` | Add `owner` to the superadmin bypass (both bypass permission checks) |
| `backend/internal/jwtutil/jwt.go` | No change needed — role is already a string |

### 3. Frontend Changes

| File | Change |
|------|--------|
| `web/src/pages/Admin/Admin.tsx` | Update `canUserDoAction` to also bypass for `owner` |
| `web/src/pages/Admin/components/TeamPage/TeamPage.tsx` | Owner sees all members including superadmins; superadmins see only admins. Owner can assign `superadmin` role |
| Generated schemas | Update OpenAPI spec to add `owner` to role enums, then regenerate |

### 4. OpenAPI Spec

- `backend/api/openapi.yaml` — add `owner` to all role enums

## Key Design Decisions

1. **Only 1 owner** — enforced in bootstrap logic (first login). No one can be promoted to owner via API.
2. **Superadmins can manage team** — but only `admin` role members (not other superadmins or the owner).
3. **Owner can do everything** — including promoting admins to superadmin and demoting them back.
4. **Permission middleware** — both `owner` and `superadmin` bypass entity permission checks.

## Relevant Files

**Backend:**
- `backend/internal/domain/admin_user.go` — Domain model
- `backend/internal/jwtutil/jwt.go` — JWT utilities
- `backend/internal/middleware/admin_auth.go` — Auth middleware
- `backend/internal/middleware/require_entity_permission.go` — Permission check middleware
- `backend/internal/handlers/admin_auth.go` — Auth endpoints
- `backend/internal/handlers/admin_team.go` — Team management endpoints
- `backend/internal/services/admin_auth.go` — Auth business logic
- `backend/internal/repo/admin_users.go` — Database repository
- `backend/internal/migrations/000020_create_admin_users.up.sql` — DB schema
- `backend/internal/sqlc/queries/admin_users.sql` — SQL queries
- `backend/cmd/server/main.go` — Server wiring/middleware setup
- `backend/api/openapi.yaml` — API specification

**Frontend:**
- `web/src/pages/Admin/Admin.tsx` — Main admin page with auth logic
- `web/src/pages/Admin/components/TeamPage/TeamPage.tsx` — Team management UI
- `web/src/api/generated/schemas/` — Generated type definitions
