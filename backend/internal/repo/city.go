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

type CityRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewCityRepo(pool *pgxpool.Pool) *CityRepo {
	return &CityRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

func (r *CityRepo) List() ([]domain.City, error) {
	r.logger.Info("city_repo_list_started")

	rows, err := r.queries.ListCities(context.Background())
	if err != nil {
		r.logger.Error("city_repo_list_query_failed", "error", err.Error())
		return nil, err
	}

	cities := make([]domain.City, len(rows))
	for i, row := range rows {
		cities[i] = domain.City{
			ID:        row.ID,
			Slug:      row.Slug,
			Name:      row.Name,
			CreatedAt: tstzToTime(row.CreatedAt),
			UpdatedAt: tstzToTime(row.UpdatedAt),
		}
	}

	r.logger.Info("city_repo_list_completed", "count", len(cities))
	return cities, nil
}

func (r *CityRepo) GetBySlug(slug string) (*domain.City, error) {
	r.logger.Info("city_repo_get_by_slug_started", "slug", slug)

	row, err := r.queries.GetCityBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("city_repo_get_by_slug_not_found", "slug", slug)
			return nil, nil
		}
		r.logger.Error("city_repo_get_by_slug_failed", "slug", slug, "error", err.Error())
		return nil, err
	}

	city := &domain.City{
		ID:        row.ID,
		Slug:      row.Slug,
		Name:      row.Name,
		CreatedAt: tstzToTime(row.CreatedAt),
		UpdatedAt: tstzToTime(row.UpdatedAt),
	}

	r.logger.Info("city_repo_get_by_slug_completed", "slug", slug, "city_id", city.ID)
	return city, nil
}

func (r *CityRepo) GetByID(id uuid.UUID) (*domain.City, error) {
	r.logger.Info("city_repo_get_by_id_started", "city_id", id)

	row, err := r.queries.GetCityByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("city_repo_get_by_id_not_found", "city_id", id)
			return nil, nil
		}
		r.logger.Error("city_repo_get_by_id_failed", "city_id", id, "error", err.Error())
		return nil, err
	}

	city := sqlcCityToDomain(row)

	r.logger.Info("city_repo_get_by_id_completed", "city_id", id, "city_slug", city.Slug)
	return city, nil
}

func (r *CityRepo) Create(city *domain.City) error {
	r.logger.Info("city_repo_create_started", "city_slug", city.Slug, "city_name", city.Name)

	row, err := r.queries.CreateCity(context.Background(), sqlcgen.CreateCityParams{
		Slug: city.Slug,
		Name: city.Name,
	})
	if err != nil {
		r.logger.Error("city_repo_create_failed", "city_slug", city.Slug, "error", err.Error())
		return err
	}

	city.ID = row.ID
	city.CreatedAt = tstzToTime(row.CreatedAt)
	city.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("city_repo_create_completed", "city_id", city.ID, "city_slug", city.Slug)
	return nil
}

func (r *CityRepo) Update(id uuid.UUID, city *domain.City) error {
	r.logger.Info("city_repo_update_started", "city_id", id)

	updatedAt, err := r.queries.UpdateCity(context.Background(), sqlcgen.UpdateCityParams{
		Slug: city.Slug,
		Name: city.Name,
		ID:   id,
	})
	if err != nil {
		r.logger.Error("city_repo_update_failed", "city_id", id, "error", err.Error())
		return err
	}

	city.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("city_repo_update_completed", "city_id", id, "city_slug", city.Slug)
	return nil
}

func (r *CityRepo) Delete(id uuid.UUID) error {
	r.logger.Info("city_repo_delete_started", "city_id", id)

	if err := r.queries.DeleteCity(context.Background(), id); err != nil {
		r.logger.Error("city_repo_delete_failed", "city_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("city_repo_delete_completed", "city_id", id)
	return nil
}

func (r *CityRepo) ListAll() ([]domain.City, error) {
	r.logger.Info("city_repo_list_all_started")

	rows, err := r.queries.ListAllCities(context.Background())
	if err != nil {
		r.logger.Error("city_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	cities := make([]domain.City, len(rows))
	for i, row := range rows {
		cities[i] = *sqlcCityToDomain(row)
	}

	r.logger.Info("city_repo_list_all_completed", "count", len(cities))
	return cities, nil
}

func (r *CityRepo) ListDeleted() ([]domain.City, error) {
	r.logger.Info("city_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedCities(context.Background())
	if err != nil {
		r.logger.Error("city_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	cities := make([]domain.City, len(rows))
	for i, row := range rows {
		cities[i] = *sqlcCityToDomain(row)
	}

	r.logger.Info("city_repo_list_deleted_completed", "count", len(cities))
	return cities, nil
}

func (r *CityRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.City, error) {
	row, err := r.queries.GetCityByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return sqlcCityToDomain(row), nil
}

func (r *CityRepo) Restore(id uuid.UUID) error {
	r.logger.Info("city_repo_restore_started", "city_id", id)

	if err := r.queries.RestoreCity(context.Background(), id); err != nil {
		r.logger.Error("city_repo_restore_failed", "city_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("city_repo_restore_completed", "city_id", id)
	return nil
}

func (r *CityRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("city_repo_hard_delete_started", "city_id", id)

	if err := r.queries.HardDeleteCity(context.Background(), id); err != nil {
		r.logger.Error("city_repo_hard_delete_failed", "city_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("city_repo_hard_delete_completed", "city_id", id)
	return nil
}

// sqlcCityToDomain converts sqlcgen.City to domain.City
func sqlcCityToDomain(row sqlcgen.City) *domain.City {
	return &domain.City{
		ID:        row.ID,
		Slug:      row.Slug,
		Name:      row.Name,
		CreatedAt: tstzToTime(row.CreatedAt),
		UpdatedAt: tstzToTime(row.UpdatedAt),
		DeletedAt: tstzToTimePtr(row.DeletedAt),
	}
}
