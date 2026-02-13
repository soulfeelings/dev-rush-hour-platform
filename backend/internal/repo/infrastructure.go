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

type InfrastructureRepo struct {
	queries *sqlcgen.Queries
	pool    *pgxpool.Pool
	logger  *slog.Logger
}

func NewInfrastructureRepo(pool *pgxpool.Pool) *InfrastructureRepo {
	return &InfrastructureRepo{
		queries: sqlcgen.New(pool),
		pool:    pool,
		logger:  slog.Default(),
	}
}

func (r *InfrastructureRepo) ListAll() ([]domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_list_all_started")

	rows, err := r.queries.ListAllInfrastructures(context.Background())
	if err != nil {
		r.logger.Error("infrastructure_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	infrastructures := make([]domain.Infrastructure, len(rows))
	for i, row := range rows {
		infrastructures[i] = *sqlcInfraToDomain(row)
	}

	r.logger.Info("infrastructure_repo_list_all_completed", "count", len(infrastructures))
	return infrastructures, nil
}

func (r *InfrastructureRepo) ListDeleted() ([]domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedInfrastructures(context.Background())
	if err != nil {
		r.logger.Error("infrastructure_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	infrastructures := make([]domain.Infrastructure, len(rows))
	for i, row := range rows {
		infrastructures[i] = *sqlcInfraToDomain(row)
	}

	r.logger.Info("infrastructure_repo_list_deleted_completed", "count", len(infrastructures))
	return infrastructures, nil
}

func (r *InfrastructureRepo) GetByID(id uuid.UUID) (*domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_get_by_id_started", "infrastructure_id", id)

	row, err := r.queries.GetInfrastructureByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("infrastructure_repo_get_by_id_not_found", "infrastructure_id", id)
			return nil, nil
		}
		r.logger.Error("infrastructure_repo_get_by_id_failed", "infrastructure_id", id, "error", err.Error())
		return nil, err
	}

	infra := sqlcInfraToDomain(row)
	r.logger.Info("infrastructure_repo_get_by_id_completed", "infrastructure_id", id, "infrastructure_slug", infra.Slug)
	return infra, nil
}

func (r *InfrastructureRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Infrastructure, error) {
	row, err := r.queries.GetInfrastructureByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return sqlcInfraToDomain(row), nil
}

func (r *InfrastructureRepo) Create(infra *domain.Infrastructure) error {
	r.logger.Info("infrastructure_repo_create_started", "infrastructure_slug", infra.Slug, "infrastructure_name", infra.Name)

	row, err := r.queries.CreateInfrastructure(context.Background(), sqlcgen.CreateInfrastructureParams{
		Slug:            infra.Slug,
		Name:            infra.Name,
		BackgroundColor: infra.BackgroundColor,
		TextColor:       infra.TextColor,
		Icon:            stringPtrToText(infra.Icon),
		SortOrder:       int32(infra.SortOrder),
	})
	if err != nil {
		r.logger.Error("infrastructure_repo_create_failed", "infrastructure_slug", infra.Slug, "error", err.Error())
		return err
	}

	infra.ID = row.ID
	infra.CreatedAt = tstzToTime(row.CreatedAt)
	infra.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("infrastructure_repo_create_completed", "infrastructure_id", infra.ID, "infrastructure_slug", infra.Slug)
	return nil
}

func (r *InfrastructureRepo) Update(id uuid.UUID, infra *domain.Infrastructure) error {
	r.logger.Info("infrastructure_repo_update_started", "infrastructure_id", id)

	updatedAt, err := r.queries.UpdateInfrastructure(context.Background(), sqlcgen.UpdateInfrastructureParams{
		Slug:            infra.Slug,
		Name:            infra.Name,
		BackgroundColor: infra.BackgroundColor,
		TextColor:       infra.TextColor,
		Icon:            stringPtrToText(infra.Icon),
		SortOrder:       int32(infra.SortOrder),
		ID:              id,
	})
	if err != nil {
		r.logger.Error("infrastructure_repo_update_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	infra.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("infrastructure_repo_update_completed", "infrastructure_id", id, "infrastructure_slug", infra.Slug)
	return nil
}

func (r *InfrastructureRepo) Delete(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_delete_started", "infrastructure_id", id)

	if err := r.queries.DeleteInfrastructure(context.Background(), id); err != nil {
		r.logger.Error("infrastructure_repo_delete_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("infrastructure_repo_delete_completed", "infrastructure_id", id)
	return nil
}

func (r *InfrastructureRepo) Restore(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_restore_started", "infrastructure_id", id)

	if err := r.queries.RestoreInfrastructure(context.Background(), id); err != nil {
		r.logger.Error("infrastructure_repo_restore_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("infrastructure_repo_restore_completed", "infrastructure_id", id)
	return nil
}

func (r *InfrastructureRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_hard_delete_started", "infrastructure_id", id)

	if err := r.queries.HardDeleteInfrastructure(context.Background(), id); err != nil {
		r.logger.Error("infrastructure_repo_hard_delete_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("infrastructure_repo_hard_delete_completed", "infrastructure_id", id)
	return nil
}

// Project infrastructures methods

func (r *InfrastructureRepo) GetProjectInfrastructures(projectID uuid.UUID) ([]domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_get_project_infrastructures_started", "project_id", projectID)

	rows, err := r.pool.Query(context.Background(), `
		SELECT i.id, i.slug, i.name, i.background_color, i.text_color, i.icon, i.sort_order, i.created_at, i.updated_at, i.deleted_at
		FROM infrastructures i
		INNER JOIN project_infrastructures pi ON i.id = pi.infrastructure_id
		WHERE pi.project_id = $1 AND i.deleted_at IS NULL
		ORDER BY pi.sort_order, i.sort_order
	`, projectID)
	if err != nil {
		r.logger.Error("infrastructure_repo_get_project_infrastructures_query_failed", "project_id", projectID, "error", err.Error())
		return nil, err
	}
	defer rows.Close()

	infrastructures := []domain.Infrastructure{}
	for rows.Next() {
		var infra domain.Infrastructure
		var icon *string
		if err := rows.Scan(
			&infra.ID, &infra.Slug, &infra.Name, &infra.BackgroundColor, &infra.TextColor,
			&icon, &infra.SortOrder, &infra.CreatedAt, &infra.UpdatedAt, &infra.DeletedAt,
		); err != nil {
			r.logger.Error("infrastructure_repo_get_project_infrastructures_scan_failed", "error", err.Error())
			return nil, err
		}
		infra.Icon = icon
		infrastructures = append(infrastructures, infra)
	}

	r.logger.Info("infrastructure_repo_get_project_infrastructures_completed", "project_id", projectID, "count", len(infrastructures))
	return infrastructures, nil
}

func (r *InfrastructureRepo) SetProjectInfrastructures(projectID uuid.UUID, infrastructureIDs []uuid.UUID) error {
	r.logger.Info("infrastructure_repo_set_project_infrastructures_started", "project_id", projectID, "infrastructure_count", len(infrastructureIDs))

	tx, err := r.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	if _, err = tx.Exec(context.Background(), `DELETE FROM project_infrastructures WHERE project_id = $1`, projectID); err != nil {
		r.logger.Error("infrastructure_repo_set_project_infrastructures_delete_failed", "project_id", projectID, "error", err.Error())
		return err
	}

	for i, infraID := range infrastructureIDs {
		if _, err = tx.Exec(context.Background(), `
			INSERT INTO project_infrastructures (project_id, infrastructure_id, sort_order)
			VALUES ($1, $2, $3)
		`, projectID, infraID, i); err != nil {
			r.logger.Error("infrastructure_repo_set_project_infrastructures_insert_failed", "project_id", projectID, "infrastructure_id", infraID, "error", err.Error())
			return err
		}
	}

	if err := tx.Commit(context.Background()); err != nil {
		return err
	}

	r.logger.Info("infrastructure_repo_set_project_infrastructures_completed", "project_id", projectID)
	return nil
}

// sqlcInfraToDomain converts sqlcgen.Infrastructure to domain.Infrastructure
func sqlcInfraToDomain(row sqlcgen.Infrastructure) *domain.Infrastructure {
	return &domain.Infrastructure{
		ID:              row.ID,
		Slug:            row.Slug,
		Name:            row.Name,
		BackgroundColor: row.BackgroundColor,
		TextColor:       row.TextColor,
		Icon:            textToStringPtr(row.Icon),
		SortOrder:       int(row.SortOrder),
		CreatedAt:       tstzToTime(row.CreatedAt),
		UpdatedAt:       tstzToTime(row.UpdatedAt),
		DeletedAt:       tstzToTimePtr(row.DeletedAt),
	}
}
