package repo

import (
	"context"
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DeveloperRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewDeveloperRepo(pool *pgxpool.Pool) *DeveloperRepo {
	return &DeveloperRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

func (r *DeveloperRepo) Create(dev *domain.Developer) error {
	r.logger.Info("developer_repo_create_started", "developer_slug", dev.Slug, "developer_name", dev.Name)

	row, err := r.queries.CreateDeveloper(context.Background(), sqlcgen.CreateDeveloperParams{
		Slug:    dev.Slug,
		Name:    dev.Name,
		Status:  string(dev.Status),
		LogoUrl: stringToText(dev.LogoURL),
	})
	if err != nil {
		r.logger.Error("developer_repo_create_failed", "developer_slug", dev.Slug, "error", err.Error())
		return err
	}

	dev.ID = row.ID
	dev.CreatedAt = tstzToTime(row.CreatedAt)
	dev.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("developer_repo_create_completed", "developer_id", dev.ID, "developer_slug", dev.Slug)
	return nil
}

func (r *DeveloperRepo) Update(id uuid.UUID, dev *domain.Developer) error {
	r.logger.Info("developer_repo_update_started", "developer_id", id)

	updatedAt, err := r.queries.UpdateDeveloper(context.Background(), sqlcgen.UpdateDeveloperParams{
		Slug:    dev.Slug,
		Name:    dev.Name,
		Status:  string(dev.Status),
		LogoUrl: stringToText(dev.LogoURL),
		ID:      id,
	})
	if err != nil {
		r.logger.Error("developer_repo_update_failed", "developer_id", id, "error", err.Error())
		return err
	}

	dev.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("developer_repo_update_completed", "developer_id", id, "developer_slug", dev.Slug)
	return nil
}

func (r *DeveloperRepo) GetByID(id uuid.UUID) (*domain.Developer, error) {
	r.logger.Info("developer_repo_get_by_id_started", "developer_id", id)

	row, err := r.queries.GetDeveloperByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("developer_repo_get_by_id_not_found", "developer_id", id)
			return nil, nil
		}
		r.logger.Error("developer_repo_get_by_id_failed", "developer_id", id, "error", err.Error())
		return nil, err
	}

	dev := sqlcDeveloperRowToDomain(row.ID, row.Slug, row.Name, row.Status, row.LogoUrl, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	r.logger.Info("developer_repo_get_by_id_completed", "developer_id", id, "developer_slug", dev.Slug)
	return dev, nil
}

func (r *DeveloperRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Developer, error) {
	r.logger.Info("developer_repo_get_by_id_with_deleted_started", "developer_id", id)

	row, err := r.queries.GetDeveloperByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("developer_repo_get_by_id_with_deleted_not_found", "developer_id", id)
			return nil, nil
		}
		r.logger.Error("developer_repo_get_by_id_with_deleted_failed", "developer_id", id, "error", err.Error())
		return nil, err
	}

	dev := sqlcDeveloperRowToDomain(row.ID, row.Slug, row.Name, row.Status, row.LogoUrl, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	r.logger.Info("developer_repo_get_by_id_with_deleted_completed", "developer_id", id, "developer_slug", dev.Slug)
	return dev, nil
}

func (r *DeveloperRepo) List() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_started")

	rows, err := r.queries.ListDevelopers(context.Background())
	if err != nil {
		r.logger.Error("developer_repo_list_query_failed", "error", err.Error())
		return nil, err
	}

	developers := make([]domain.Developer, len(rows))
	for i, row := range rows {
		developers[i] = *sqlcDeveloperRowToDomain(row.ID, row.Slug, row.Name, row.Status, row.LogoUrl, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	}

	r.logger.Info("developer_repo_list_completed", "count", len(developers))
	return developers, nil
}

func (r *DeveloperRepo) ListDeleted() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedDevelopers(context.Background())
	if err != nil {
		r.logger.Error("developer_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	developers := make([]domain.Developer, len(rows))
	for i, row := range rows {
		developers[i] = *sqlcDeveloperRowToDomain(row.ID, row.Slug, row.Name, row.Status, row.LogoUrl, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	}

	r.logger.Info("developer_repo_list_deleted_completed", "count", len(developers))
	return developers, nil
}

func (r *DeveloperRepo) ListWithDeleted() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_with_deleted_started")

	rows, err := r.queries.ListWithDeletedDevelopers(context.Background())
	if err != nil {
		r.logger.Error("developer_repo_list_with_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	developers := make([]domain.Developer, len(rows))
	for i, row := range rows {
		developers[i] = *sqlcDeveloperRowToDomain(row.ID, row.Slug, row.Name, row.Status, row.LogoUrl, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	}

	r.logger.Info("developer_repo_list_with_deleted_completed", "count", len(developers))
	return developers, nil
}

func (r *DeveloperRepo) Delete(id uuid.UUID) error {
	r.logger.Info("developer_repo_delete_started", "developer_id", id)

	if err := r.queries.DeleteDeveloper(context.Background(), id); err != nil {
		r.logger.Error("developer_repo_delete_failed", "developer_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("developer_repo_delete_completed", "developer_id", id)
	return nil
}

func (r *DeveloperRepo) Restore(id uuid.UUID) error {
	r.logger.Info("developer_repo_restore_started", "developer_id", id)

	if err := r.queries.RestoreDeveloper(context.Background(), id); err != nil {
		r.logger.Error("developer_repo_restore_failed", "developer_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("developer_repo_restore_completed", "developer_id", id)
	return nil
}

func (r *DeveloperRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("developer_repo_hard_delete_started", "developer_id", id)

	if err := r.queries.HardDeleteDeveloper(context.Background(), id); err != nil {
		r.logger.Error("developer_repo_hard_delete_failed", "developer_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("developer_repo_hard_delete_completed", "developer_id", id)
	return nil
}

// sqlcDeveloperRowToDomain converts sqlc developer row fields to domain.Developer
func sqlcDeveloperRowToDomain(id uuid.UUID, slug, name, status string, logoUrl pgtype.Text, createdAt, updatedAt, deletedAt pgtype.Timestamptz) *domain.Developer {
	return &domain.Developer{
		ID:        id,
		Slug:      slug,
		Name:      name,
		Status:    domain.DeveloperStatus(status),
		LogoURL:   textToString(logoUrl),
		CreatedAt: tstzToTime(createdAt),
		UpdatedAt: tstzToTime(updatedAt),
		DeletedAt: tstzToTimePtr(deletedAt),
	}
}
