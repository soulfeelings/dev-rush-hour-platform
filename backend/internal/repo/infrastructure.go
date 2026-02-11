package repo

import (
	"database/sql"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type InfrastructureRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewInfrastructureRepo(db *sql.DB) *InfrastructureRepo {
	return &InfrastructureRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *InfrastructureRepo) ListAll() ([]domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
		FROM infrastructures
		WHERE deleted_at IS NULL
		ORDER BY sort_order, name
	`)
	if err != nil {
		r.logger.Error("infrastructure_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	infrastructures := []domain.Infrastructure{}
	for rows.Next() {
		var infra domain.Infrastructure

		if err := rows.Scan(
			&infra.ID, &infra.Slug, &infra.Name, &infra.BackgroundColor, &infra.TextColor,
			&infra.Icon, &infra.SortOrder, &infra.CreatedAt, &infra.UpdatedAt, &infra.DeletedAt,
		); err != nil {
			r.logger.Error("infrastructure_repo_list_all_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		infrastructures = append(infrastructures, infra)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("infrastructure_repo_list_all_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("infrastructure_repo_list_all_completed",
		"count", len(infrastructures),
	)

	return infrastructures, nil
}

func (r *InfrastructureRepo) ListDeleted() ([]domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_list_deleted_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
		FROM infrastructures
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC
	`)
	if err != nil {
		r.logger.Error("infrastructure_repo_list_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	infrastructures := []domain.Infrastructure{}
	for rows.Next() {
		var infra domain.Infrastructure

		if err := rows.Scan(
			&infra.ID, &infra.Slug, &infra.Name, &infra.BackgroundColor, &infra.TextColor,
			&infra.Icon, &infra.SortOrder, &infra.CreatedAt, &infra.UpdatedAt, &infra.DeletedAt,
		); err != nil {
			r.logger.Error("infrastructure_repo_list_deleted_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		infrastructures = append(infrastructures, infra)
	}

	r.logger.Info("infrastructure_repo_list_deleted_completed",
		"count", len(infrastructures),
	)

	return infrastructures, nil
}

func (r *InfrastructureRepo) GetByID(id uuid.UUID) (*domain.Infrastructure, error) {
	r.logger.Info("infrastructure_repo_get_by_id_started",
		"infrastructure_id", id,
	)

	var infra domain.Infrastructure

	err := r.db.QueryRow(`
		SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
		FROM infrastructures
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&infra.ID, &infra.Slug, &infra.Name, &infra.BackgroundColor, &infra.TextColor,
		&infra.Icon, &infra.SortOrder, &infra.CreatedAt, &infra.UpdatedAt, &infra.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("infrastructure_repo_get_by_id_not_found",
				"infrastructure_id", id,
			)
			return nil, nil
		}
		r.logger.Error("infrastructure_repo_get_by_id_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("infrastructure_repo_get_by_id_completed",
		"infrastructure_id", id,
		"infrastructure_slug", infra.Slug,
	)

	return &infra, nil
}

func (r *InfrastructureRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Infrastructure, error) {
	var infra domain.Infrastructure

	err := r.db.QueryRow(`
		SELECT id, slug, name, background_color, text_color, icon, sort_order, created_at, updated_at, deleted_at
		FROM infrastructures
		WHERE id = $1
	`, id).Scan(
		&infra.ID, &infra.Slug, &infra.Name, &infra.BackgroundColor, &infra.TextColor,
		&infra.Icon, &infra.SortOrder, &infra.CreatedAt, &infra.UpdatedAt, &infra.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &infra, nil
}

func (r *InfrastructureRepo) Create(infra *domain.Infrastructure) error {
	r.logger.Info("infrastructure_repo_create_started",
		"infrastructure_slug", infra.Slug,
		"infrastructure_name", infra.Name,
	)

	err := r.db.QueryRow(`
		INSERT INTO infrastructures (slug, name, background_color, text_color, icon, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`, infra.Slug, infra.Name, infra.BackgroundColor, infra.TextColor, infra.Icon, infra.SortOrder).Scan(
		&infra.ID, &infra.CreatedAt, &infra.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("infrastructure_repo_create_failed",
			"infrastructure_slug", infra.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("infrastructure_repo_create_completed",
		"infrastructure_id", infra.ID,
		"infrastructure_slug", infra.Slug,
	)

	return nil
}

func (r *InfrastructureRepo) Update(id uuid.UUID, infra *domain.Infrastructure) error {
	r.logger.Info("infrastructure_repo_update_started",
		"infrastructure_id", id,
	)

	err := r.db.QueryRow(`
		UPDATE infrastructures
		SET slug = $1, name = $2, background_color = $3, text_color = $4, icon = $5, sort_order = $6, updated_at = NOW()
		WHERE id = $7 AND deleted_at IS NULL
		RETURNING updated_at
	`, infra.Slug, infra.Name, infra.BackgroundColor, infra.TextColor, infra.Icon, infra.SortOrder, id).Scan(&infra.UpdatedAt)

	if err != nil {
		r.logger.Error("infrastructure_repo_update_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("infrastructure_repo_update_completed",
		"infrastructure_id", id,
		"infrastructure_slug", infra.Slug,
	)

	return nil
}

func (r *InfrastructureRepo) Delete(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_delete_started",
		"infrastructure_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE infrastructures
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("infrastructure_repo_delete_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("infrastructure_repo_delete_completed",
		"infrastructure_id", id,
	)

	return nil
}

func (r *InfrastructureRepo) Restore(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_restore_started", "infrastructure_id", id)

	_, err := r.db.Exec(`
		UPDATE infrastructures
		SET deleted_at = NULL
		WHERE id = $1 AND deleted_at IS NOT NULL
	`, id)

	if err != nil {
		r.logger.Error("infrastructure_repo_restore_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("infrastructure_repo_restore_completed", "infrastructure_id", id)
	return nil
}

func (r *InfrastructureRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("infrastructure_repo_hard_delete_started", "infrastructure_id", id)

	_, err := r.db.Exec(`DELETE FROM infrastructures WHERE id = $1`, id)

	if err != nil {
		r.logger.Error("infrastructure_repo_hard_delete_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("infrastructure_repo_hard_delete_completed", "infrastructure_id", id)
	return nil
}
