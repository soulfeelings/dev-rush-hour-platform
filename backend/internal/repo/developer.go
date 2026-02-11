package repo

import (
	"database/sql"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type DeveloperRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewDeveloperRepo(db *sql.DB) *DeveloperRepo {
	return &DeveloperRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *DeveloperRepo) Create(dev *domain.Developer) error {
	r.logger.Info("developer_repo_create_started",
		"developer_slug", dev.Slug,
		"developer_name", dev.Name,
	)

	err := r.db.QueryRow(`
		INSERT INTO developers (slug, name, status, logo_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at, deleted_at
	`, dev.Slug, dev.Name, dev.Status, nullableString(dev.LogoURL)).Scan(
		&dev.ID, &dev.CreatedAt, &dev.UpdatedAt, &dev.DeletedAt,
	)

	if err != nil {
		r.logger.Error("developer_repo_create_failed",
			"developer_slug", dev.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("developer_repo_create_completed",
		"developer_id", dev.ID,
		"developer_slug", dev.Slug,
	)

	return nil
}

func (r *DeveloperRepo) Update(id uuid.UUID, dev *domain.Developer) error {
	r.logger.Info("developer_repo_update_started",
		"developer_id", id,
	)

	err := r.db.QueryRow(`
		UPDATE developers
		SET slug = $1, name = $2, status = $3, logo_url = $4, updated_at = NOW()
		WHERE id = $5 AND deleted_at IS NULL
		RETURNING updated_at
	`, dev.Slug, dev.Name, dev.Status, nullableString(dev.LogoURL), id).Scan(&dev.UpdatedAt)

	if err != nil {
		r.logger.Error("developer_repo_update_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("developer_repo_update_completed",
		"developer_id", id,
		"developer_slug", dev.Slug,
	)

	return nil
}

func (r *DeveloperRepo) GetByID(id uuid.UUID) (*domain.Developer, error) {
	r.logger.Info("developer_repo_get_by_id_started",
		"developer_id", id,
	)

	var dev domain.Developer
	var logoURL sql.NullString

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
		FROM developers
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&dev.ID, &dev.Slug, &dev.Name, &dev.Status, &logoURL,
		&dev.CreatedAt, &dev.UpdatedAt, &dev.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("developer_repo_get_by_id_not_found",
				"developer_id", id,
			)
			return nil, nil
		}
		r.logger.Error("developer_repo_get_by_id_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	if logoURL.Valid {
		dev.LogoURL = logoURL.String
	}

	r.logger.Info("developer_repo_get_by_id_completed",
		"developer_id", id,
		"developer_slug", dev.Slug,
	)

	return &dev, nil
}

func (r *DeveloperRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Developer, error) {
	r.logger.Info("developer_repo_get_by_id_with_deleted_started",
		"developer_id", id,
	)

	var dev domain.Developer
	var logoURL sql.NullString

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
		FROM developers
		WHERE id = $1
	`, id).Scan(
		&dev.ID, &dev.Slug, &dev.Name, &dev.Status, &logoURL,
		&dev.CreatedAt, &dev.UpdatedAt, &dev.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("developer_repo_get_by_id_with_deleted_not_found",
				"developer_id", id,
			)
			return nil, nil
		}
		r.logger.Error("developer_repo_get_by_id_with_deleted_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	if logoURL.Valid {
		dev.LogoURL = logoURL.String
	}

	r.logger.Info("developer_repo_get_by_id_with_deleted_completed",
		"developer_id", id,
		"developer_slug", dev.Slug,
	)

	return &dev, nil
}

func (r *DeveloperRepo) scanDeveloperRows(rows *sql.Rows) ([]domain.Developer, error) {
	var developers []domain.Developer
	for rows.Next() {
		var dev domain.Developer
		var logoURL sql.NullString

		if err := rows.Scan(
			&dev.ID, &dev.Slug, &dev.Name, &dev.Status, &logoURL,
			&dev.CreatedAt, &dev.UpdatedAt, &dev.DeletedAt,
		); err != nil {
			return nil, err
		}

		if logoURL.Valid {
			dev.LogoURL = logoURL.String
		}

		developers = append(developers, dev)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return developers, nil
}

func (r *DeveloperRepo) List() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
		FROM developers
		WHERE deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("developer_repo_list_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	developers, err := r.scanDeveloperRows(rows)
	if err != nil {
		r.logger.Error("developer_repo_list_scan_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("developer_repo_list_completed",
		"count", len(developers),
	)

	return developers, nil
}

func (r *DeveloperRepo) ListDeleted() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_deleted_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
		FROM developers
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC
	`)
	if err != nil {
		r.logger.Error("developer_repo_list_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	developers, err := r.scanDeveloperRows(rows)
	if err != nil {
		r.logger.Error("developer_repo_list_deleted_scan_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("developer_repo_list_deleted_completed",
		"count", len(developers),
	)

	return developers, nil
}

func (r *DeveloperRepo) ListWithDeleted() ([]domain.Developer, error) {
	r.logger.Info("developer_repo_list_with_deleted_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, logo_url, created_at, updated_at, deleted_at
		FROM developers
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("developer_repo_list_with_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	developers, err := r.scanDeveloperRows(rows)
	if err != nil {
		r.logger.Error("developer_repo_list_with_deleted_scan_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("developer_repo_list_with_deleted_completed",
		"count", len(developers),
	)

	return developers, nil
}

func (r *DeveloperRepo) Delete(id uuid.UUID) error {
	r.logger.Info("developer_repo_delete_started",
		"developer_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE developers
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("developer_repo_delete_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("developer_repo_delete_completed",
		"developer_id", id,
	)

	return nil
}

func (r *DeveloperRepo) Restore(id uuid.UUID) error {
	r.logger.Info("developer_repo_restore_started",
		"developer_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE developers
		SET deleted_at = NULL
		WHERE id = $1 AND deleted_at IS NOT NULL
	`, id)

	if err != nil {
		r.logger.Error("developer_repo_restore_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("developer_repo_restore_completed",
		"developer_id", id,
	)

	return nil
}

func (r *DeveloperRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("developer_repo_hard_delete_started",
		"developer_id", id,
	)

	_, err := r.db.Exec(`DELETE FROM developers WHERE id = $1`, id)

	if err != nil {
		r.logger.Error("developer_repo_hard_delete_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("developer_repo_hard_delete_completed",
		"developer_id", id,
	)

	return nil
}
