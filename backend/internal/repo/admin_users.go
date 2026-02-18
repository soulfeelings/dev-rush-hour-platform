package repo

import (
	"context"
	"errors"
	"log/slog"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminUserRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewAdminUserRepo(pool *pgxpool.Pool) *AdminUserRepo {
	return &AdminUserRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

func (r *AdminUserRepo) GetByEmail(email string) (*domain.AdminUser, error) {
	row, err := r.queries.GetAdminUserByEmail(context.Background(), email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		r.logger.Error("admin_user_repo_get_by_email_failed", "email", email, "error", err.Error())
		return nil, err
	}
	return sqlcAdminUserToDomain(row), nil
}

func (r *AdminUserRepo) List() ([]domain.AdminUser, error) {
	rows, err := r.queries.ListAdminUsers(context.Background())
	if err != nil {
		r.logger.Error("admin_user_repo_list_failed", "error", err.Error())
		return nil, err
	}

	users := make([]domain.AdminUser, len(rows))
	for i, row := range rows {
		users[i] = *sqlcAdminUserToDomain(row)
	}
	return users, nil
}

func (r *AdminUserRepo) Create(user *domain.AdminUser) error {
	row, err := r.queries.CreateAdminUser(context.Background(), sqlcgen.CreateAdminUserParams{
		Email:       user.Email,
		Role:        user.Role,
		Permissions: user.Permissions,
		CreatedBy:   stringToText(user.CreatedBy),
	})
	if err != nil {
		r.logger.Error("admin_user_repo_create_failed", "email", user.Email, "error", err.Error())
		return err
	}

	user.ID = row.ID
	user.CreatedAt = tstzToTime(row.CreatedAt)
	return nil
}

func (r *AdminUserRepo) UpdatePermissions(id uuid.UUID, role string, permissions []string) error {
	if permissions == nil {
		permissions = []string{}
	}
	err := r.queries.UpdateAdminUser(context.Background(), sqlcgen.UpdateAdminUserParams{
		ID:          id,
		Role:        role,
		Permissions: permissions,
	})
	if err != nil {
		r.logger.Error("admin_user_repo_update_failed", "id", id, "error", err.Error())
		return err
	}
	return nil
}

func (r *AdminUserRepo) Delete(id uuid.UUID) error {
	err := r.queries.DeleteAdminUser(context.Background(), id)
	if err != nil {
		r.logger.Error("admin_user_repo_delete_failed", "id", id, "error", err.Error())
		return err
	}
	return nil
}

func (r *AdminUserRepo) Count() (int64, error) {
	count, err := r.queries.CountAdminUsers(context.Background())
	if err != nil {
		r.logger.Error("admin_user_repo_count_failed", "error", err.Error())
		return 0, err
	}
	return count, nil
}

func sqlcAdminUserToDomain(row sqlcgen.AdminUser) *domain.AdminUser {
	permissions := row.Permissions
	if permissions == nil {
		permissions = []string{}
	}
	return &domain.AdminUser{
		ID:          row.ID,
		Email:       row.Email,
		Role:        row.Role,
		Permissions: permissions,
		CreatedAt:   tstzToTime(row.CreatedAt),
		CreatedBy:   textToString(row.CreatedBy),
	}
}
