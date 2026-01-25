package repo

import (
	"database/sql"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type CityRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewCityRepo(db *sql.DB) *CityRepo {
	return &CityRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *CityRepo) List() ([]domain.City, error) {
	r.logger.Info("city_repo_list_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, created_at, updated_at
		FROM cities
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("city_repo_list_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	cities := []domain.City{}
	for rows.Next() {
		var city domain.City

		if err := rows.Scan(
			&city.ID, &city.Slug, &city.Name, &city.Status,
			&city.CreatedAt, &city.UpdatedAt,
		); err != nil {
			r.logger.Error("city_repo_list_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		cities = append(cities, city)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("city_repo_list_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("city_repo_list_completed",
		"count", len(cities),
	)

	return cities, nil
}

func (r *CityRepo) GetBySlug(slug string) (*domain.City, error) {
	r.logger.Info("city_repo_get_by_slug_started",
		"slug", slug,
	)

	var city domain.City

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, created_at, updated_at
		FROM cities
		WHERE slug = $1 AND deleted_at IS NULL
	`, slug).Scan(
		&city.ID, &city.Slug, &city.Name, &city.Status,
		&city.CreatedAt, &city.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("city_repo_get_by_slug_not_found",
				"slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("city_repo_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("city_repo_get_by_slug_completed",
		"slug", slug,
		"city_id", city.ID,
	)

	return &city, nil
}

func (r *CityRepo) GetByID(id uuid.UUID) (*domain.City, error) {
	r.logger.Info("city_repo_get_by_id_started",
		"city_id", id,
	)

	var city domain.City

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, created_at, updated_at, deleted_at
		FROM cities
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&city.ID, &city.Slug, &city.Name, &city.Status,
		&city.CreatedAt, &city.UpdatedAt, &city.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("city_repo_get_by_id_not_found",
				"city_id", id,
			)
			return nil, nil
		}
		r.logger.Error("city_repo_get_by_id_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("city_repo_get_by_id_completed",
		"city_id", id,
		"city_slug", city.Slug,
	)

	return &city, nil
}

func (r *CityRepo) Create(city *domain.City) error {
	r.logger.Info("city_repo_create_started",
		"city_slug", city.Slug,
		"city_name", city.Name,
	)

	err := r.db.QueryRow(`
		INSERT INTO cities (slug, name, status)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`, city.Slug, city.Name, city.Status).Scan(
		&city.ID, &city.CreatedAt, &city.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("city_repo_create_failed",
			"city_slug", city.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("city_repo_create_completed",
		"city_id", city.ID,
		"city_slug", city.Slug,
	)

	return nil
}

func (r *CityRepo) Update(id uuid.UUID, city *domain.City) error {
	r.logger.Info("city_repo_update_started",
		"city_id", id,
	)

	err := r.db.QueryRow(`
		UPDATE cities
		SET slug = $1, name = $2, status = $3, updated_at = NOW()
		WHERE id = $4 AND deleted_at IS NULL
		RETURNING updated_at
	`, city.Slug, city.Name, city.Status, id).Scan(&city.UpdatedAt)

	if err != nil {
		r.logger.Error("city_repo_update_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("city_repo_update_completed",
		"city_id", id,
		"city_slug", city.Slug,
	)

	return nil
}

func (r *CityRepo) Delete(id uuid.UUID) error {
	r.logger.Info("city_repo_delete_started",
		"city_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE cities
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("city_repo_delete_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("city_repo_delete_completed",
		"city_id", id,
	)

	return nil
}

func (r *CityRepo) ListAll() ([]domain.City, error) {
	r.logger.Info("city_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, created_at, updated_at, deleted_at
		FROM cities
		WHERE deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("city_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	cities := []domain.City{}
	for rows.Next() {
		var city domain.City

		if err := rows.Scan(
			&city.ID, &city.Slug, &city.Name, &city.Status,
			&city.CreatedAt, &city.UpdatedAt, &city.DeletedAt,
		); err != nil {
			r.logger.Error("city_repo_list_all_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		cities = append(cities, city)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("city_repo_list_all_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("city_repo_list_all_completed",
		"count", len(cities),
	)

	return cities, nil
}
