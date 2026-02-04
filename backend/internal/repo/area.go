package repo

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type AreaRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewAreaRepo(db *sql.DB) *AreaRepo {
	return &AreaRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *AreaRepo) GetBySlug(slug string) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_slug_started",
		"slug", slug,
	)

	var area domain.Area
	var dataJSON []byte
	var cityID sql.NullString

	err := r.db.QueryRow(`
		SELECT a.id, a.slug, a.name, a.city, a.city_id, a.lat, a.lng, a.status, a.data, a.created_at, a.updated_at
		FROM areas a
		WHERE a.slug = $1 AND a.deleted_at IS NULL
	`, slug).Scan(
		&area.ID, &area.Slug, &area.Name, &area.City, &cityID,
		&area.Lat, &area.Lng, &area.Status, &dataJSON,
		&area.CreatedAt, &area.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("area_repo_get_by_slug_not_found",
				"slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	if cityID.Valid {
		id := uuid.MustParse(cityID.String)
		area.CityID = &id
	}

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			r.logger.Error("area_repo_get_by_slug_unmarshal_failed",
				"slug", slug,
				"error", err.Error(),
			)
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	r.logger.Info("area_repo_get_by_slug_completed",
		"slug", slug,
		"area_id", area.ID,
	)

	return &area, nil
}

func (r *AreaRepo) List(includeBoundary bool) ([]domain.Area, error) {
	r.logger.Info("area_repo_list_started",
		"include_boundary", includeBoundary,
	)

	query := `
		SELECT id, slug, name, city, city_id, lat, lng, status, data, created_at, updated_at
		FROM areas
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		r.logger.Error("area_repo_list_query_failed",
			"include_boundary", includeBoundary,
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	areas := []domain.Area{}
	for rows.Next() {
		var area domain.Area
		var dataJSON []byte
		var cityID sql.NullString

		if err := rows.Scan(
			&area.ID, &area.Slug, &area.Name, &area.City, &cityID,
			&area.Lat, &area.Lng, &area.Status, &dataJSON,
			&area.CreatedAt, &area.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if cityID.Valid {
			id := uuid.MustParse(cityID.String)
			area.CityID = &id
		}

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
				return nil, err
			}
		} else {
			area.Data = domain.AreaData{}
		}

		if !includeBoundary && area.Data.Boundary != nil {
			area.Data.Boundary = nil
		}

		areas = append(areas, area)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("area_repo_list_rows_error",
			"include_boundary", includeBoundary,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("area_repo_list_completed",
		"count", len(areas),
		"include_boundary", includeBoundary,
	)

	return areas, nil
}

func (r *AreaRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	r.logger.Info("area_repo_get_id_by_slug_started",
		"slug", slug,
	)

	var id uuid.UUID
	err := r.db.QueryRow(`SELECT id FROM areas WHERE slug = $1 AND deleted_at IS NULL`, slug).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("area_repo_get_id_by_slug_not_found",
				"slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("area_repo_get_id_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("area_repo_get_id_by_slug_completed",
		"slug", slug,
		"area_id", id,
	)

	return &id, nil
}

func (r *AreaRepo) Create(area *domain.Area) error {
	r.logger.Info("area_repo_create_started",
		"area_slug", area.Slug,
		"area_name", area.Name,
	)

	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		r.logger.Error("area_repo_create_marshal_failed",
			"area_slug", area.Slug,
			"error", err.Error(),
		)
		return err
	}

	var cityID *string
	if area.CityID != nil {
		cityIDStr := area.CityID.String()
		cityID = &cityIDStr
	}

	err = r.db.QueryRow(`
		INSERT INTO areas (slug, name, city, city_id, lat, lng, status, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`, area.Slug, area.Name, area.City, cityID, area.Lat, area.Lng, area.Status, dataJSON).Scan(
		&area.ID, &area.CreatedAt, &area.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("area_repo_create_failed",
			"area_slug", area.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("area_repo_create_completed",
		"area_id", area.ID,
		"area_slug", area.Slug,
	)

	return nil
}

func (r *AreaRepo) Update(id uuid.UUID, area *domain.Area) error {
	r.logger.Info("area_repo_update_started",
		"area_id", id,
	)

	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		r.logger.Error("area_repo_update_marshal_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	err = r.db.QueryRow(`
		UPDATE areas
		SET slug = $1, name = $2, city = $3, lat = $4, lng = $5, status = $6, data = $7, updated_at = NOW()
		WHERE id = $8 AND deleted_at IS NULL
		RETURNING updated_at
	`, area.Slug, area.Name, area.City, area.Lat, area.Lng, area.Status, dataJSON, id).Scan(&area.UpdatedAt)

	if err != nil {
		r.logger.Error("area_repo_update_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("area_repo_update_completed",
		"area_id", id,
		"area_slug", area.Slug,
	)

	return nil
}

func (r *AreaRepo) GetByID(id uuid.UUID) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_id_started",
		"area_id", id,
	)

	var area domain.Area
	var dataJSON []byte

	err := r.db.QueryRow(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&area.ID, &area.Slug, &area.Name, &area.City,
		&area.Lat, &area.Lng, &area.Status, &dataJSON,
		&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("area_repo_get_by_id_not_found",
				"area_id", id,
			)
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_id_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			r.logger.Error("area_repo_get_by_id_unmarshal_failed",
				"area_id", id,
				"error", err.Error(),
			)
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	r.logger.Info("area_repo_get_by_id_completed",
		"area_id", id,
		"area_slug", area.Slug,
	)

	return &area, nil
}

func (r *AreaRepo) ListAll() ([]domain.Area, error) {
	r.logger.Info("area_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("area_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	areas := []domain.Area{}
	for rows.Next() {
		var area domain.Area
		var dataJSON []byte

		if err := rows.Scan(
			&area.ID, &area.Slug, &area.Name, &area.City,
			&area.Lat, &area.Lng, &area.Status, &dataJSON,
			&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
		); err != nil {
			r.logger.Error("area_repo_list_all_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
				r.logger.Error("area_repo_list_all_unmarshal_failed",
					"area_id", area.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			area.Data = domain.AreaData{}
		}

		areas = append(areas, area)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("area_repo_list_all_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("area_repo_list_all_completed",
		"count", len(areas),
	)

	return areas, nil
}

func (r *AreaRepo) Delete(id uuid.UUID) error {
	r.logger.Info("area_repo_delete_started",
		"area_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE areas
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("area_repo_delete_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("area_repo_delete_completed",
		"area_id", id,
	)

	return nil
}

func (r *AreaRepo) ListDeleted() ([]domain.Area, error) {
	r.logger.Info("area_repo_list_deleted_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC
	`)
	if err != nil {
		r.logger.Error("area_repo_list_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	areas := []domain.Area{}
	for rows.Next() {
		var area domain.Area
		var dataJSON []byte

		if err := rows.Scan(
			&area.ID, &area.Slug, &area.Name, &area.City,
			&area.Lat, &area.Lng, &area.Status, &dataJSON,
			&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
		); err != nil {
			r.logger.Error("area_repo_list_deleted_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
				r.logger.Error("area_repo_list_deleted_unmarshal_failed",
					"area_id", area.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			area.Data = domain.AreaData{}
		}

		areas = append(areas, area)
	}

	r.logger.Info("area_repo_list_deleted_completed",
		"count", len(areas),
	)

	return areas, nil
}

func (r *AreaRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_id_with_deleted_started",
		"area_id", id,
	)

	var area domain.Area
	var dataJSON []byte

	err := r.db.QueryRow(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE id = $1
	`, id).Scan(
		&area.ID, &area.Slug, &area.Name, &area.City,
		&area.Lat, &area.Lng, &area.Status, &dataJSON,
		&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_id_with_deleted_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	return &area, nil
}

func (r *AreaRepo) Restore(id uuid.UUID) error {
	r.logger.Info("area_repo_restore_started",
		"area_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE areas
		SET deleted_at = NULL
		WHERE id = $1 AND deleted_at IS NOT NULL
	`, id)

	if err != nil {
		r.logger.Error("area_repo_restore_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("area_repo_restore_completed",
		"area_id", id,
	)

	return nil
}

func (r *AreaRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("area_repo_hard_delete_started",
		"area_id", id,
	)

	_, err := r.db.Exec(`DELETE FROM areas WHERE id = $1`, id)

	if err != nil {
		r.logger.Error("area_repo_hard_delete_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("area_repo_hard_delete_completed",
		"area_id", id,
	)

	return nil
}

