package repo

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AreaRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewAreaRepo(pool *pgxpool.Pool) *AreaRepo {
	return &AreaRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

func (r *AreaRepo) GetBySlug(slug string) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_slug_started", "slug", slug)

	row, err := r.queries.GetAreaBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("area_repo_get_by_slug_not_found", "slug", slug)
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_slug_failed", "slug", slug, "error", err.Error())
		return nil, err
	}

	area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
	if err != nil {
		r.logger.Error("area_repo_get_by_slug_unmarshal_failed", "slug", slug, "error", err.Error())
		return nil, err
	}
	area.CityID = nullUUIDToPtr(row.CityID)

	r.logger.Info("area_repo_get_by_slug_completed", "slug", slug, "area_id", area.ID)
	return area, nil
}

func (r *AreaRepo) List(includeBoundary bool) ([]domain.Area, error) {
	r.logger.Info("area_repo_list_started", "include_boundary", includeBoundary)

	rows, err := r.queries.ListAreas(context.Background())
	if err != nil {
		r.logger.Error("area_repo_list_query_failed", "include_boundary", includeBoundary, "error", err.Error())
		return nil, err
	}

	areas := make([]domain.Area, 0, len(rows))
	for _, row := range rows {
		area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
		if err != nil {
			return nil, err
		}
		area.CityID = nullUUIDToPtr(row.CityID)

		if !includeBoundary && area.Data.Boundary != nil {
			area.Data.Boundary = nil
		}

		areas = append(areas, *area)
	}

	r.logger.Info("area_repo_list_completed", "count", len(areas), "include_boundary", includeBoundary)
	return areas, nil
}

func (r *AreaRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	r.logger.Info("area_repo_get_id_by_slug_started", "slug", slug)

	id, err := r.queries.GetAreaIDBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("area_repo_get_id_by_slug_not_found", "slug", slug)
			return nil, nil
		}
		r.logger.Error("area_repo_get_id_by_slug_failed", "slug", slug, "error", err.Error())
		return nil, err
	}

	r.logger.Info("area_repo_get_id_by_slug_completed", "slug", slug, "area_id", id)
	return &id, nil
}

func (r *AreaRepo) Create(area *domain.Area) error {
	r.logger.Info("area_repo_create_started", "area_slug", area.Slug, "area_name", area.Name)

	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		r.logger.Error("area_repo_create_marshal_failed", "area_slug", area.Slug, "error", err.Error())
		return err
	}

	row, err := r.queries.CreateArea(context.Background(), sqlcgen.CreateAreaParams{
		Slug:   area.Slug,
		Name:   area.Name,
		City:   area.City,
		CityID: uuidPtrToNullUUID(area.CityID),
		Status: string(area.Status),
		Data:   dataJSON,
	})
	if err != nil {
		r.logger.Error("area_repo_create_failed", "area_slug", area.Slug, "error", err.Error())
		return err
	}

	area.ID = row.ID
	area.CreatedAt = tstzToTime(row.CreatedAt)
	area.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("area_repo_create_completed", "area_id", area.ID, "area_slug", area.Slug)
	return nil
}

func (r *AreaRepo) Update(id uuid.UUID, area *domain.Area) error {
	r.logger.Info("area_repo_update_started", "area_id", id)

	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		r.logger.Error("area_repo_update_marshal_failed", "area_id", id, "error", err.Error())
		return err
	}

	updatedAt, err := r.queries.UpdateArea(context.Background(), sqlcgen.UpdateAreaParams{
		Slug:   area.Slug,
		Name:   area.Name,
		City:   area.City,
		Status: string(area.Status),
		Data:   dataJSON,
		ID:     id,
	})
	if err != nil {
		r.logger.Error("area_repo_update_failed", "area_id", id, "error", err.Error())
		return err
	}

	area.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("area_repo_update_completed", "area_id", id, "area_slug", area.Slug)
	return nil
}

func (r *AreaRepo) GetByID(id uuid.UUID) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_id_started", "area_id", id)

	row, err := r.queries.GetAreaByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("area_repo_get_by_id_not_found", "area_id", id)
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_id_failed", "area_id", id, "error", err.Error())
		return nil, err
	}

	area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	if err != nil {
		r.logger.Error("area_repo_get_by_id_unmarshal_failed", "area_id", id, "error", err.Error())
		return nil, err
	}

	r.logger.Info("area_repo_get_by_id_completed", "area_id", id, "area_slug", area.Slug)
	return area, nil
}

func (r *AreaRepo) ListAll() ([]domain.Area, error) {
	r.logger.Info("area_repo_list_all_started")

	rows, err := r.queries.ListAllAreas(context.Background())
	if err != nil {
		r.logger.Error("area_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	areas := make([]domain.Area, 0, len(rows))
	for _, row := range rows {
		area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
		if err != nil {
			r.logger.Error("area_repo_list_all_unmarshal_failed", "area_id", row.ID, "error", err.Error())
			return nil, err
		}
		areas = append(areas, *area)
	}

	r.logger.Info("area_repo_list_all_completed", "count", len(areas))
	return areas, nil
}

func (r *AreaRepo) Delete(id uuid.UUID) error {
	r.logger.Info("area_repo_delete_started", "area_id", id)

	if err := r.queries.DeleteArea(context.Background(), id); err != nil {
		r.logger.Error("area_repo_delete_failed", "area_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("area_repo_delete_completed", "area_id", id)
	return nil
}

func (r *AreaRepo) ListDeleted() ([]domain.Area, error) {
	r.logger.Info("area_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedAreas(context.Background())
	if err != nil {
		r.logger.Error("area_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	areas := make([]domain.Area, 0, len(rows))
	for _, row := range rows {
		area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
		if err != nil {
			r.logger.Error("area_repo_list_deleted_unmarshal_failed", "area_id", row.ID, "error", err.Error())
			return nil, err
		}
		areas = append(areas, *area)
	}

	r.logger.Info("area_repo_list_deleted_completed", "count", len(areas))
	return areas, nil
}

func (r *AreaRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Area, error) {
	r.logger.Info("area_repo_get_by_id_with_deleted_started", "area_id", id)

	row, err := r.queries.GetAreaByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		r.logger.Error("area_repo_get_by_id_with_deleted_failed", "area_id", id, "error", err.Error())
		return nil, err
	}

	area, err := sqlcAreaRowToDomain(row.ID, row.Slug, row.Name, row.City, row.Status, row.Data, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	if err != nil {
		return nil, err
	}

	return area, nil
}

func (r *AreaRepo) Restore(id uuid.UUID) error {
	r.logger.Info("area_repo_restore_started", "area_id", id)

	if err := r.queries.RestoreArea(context.Background(), id); err != nil {
		r.logger.Error("area_repo_restore_failed", "area_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("area_repo_restore_completed", "area_id", id)
	return nil
}

func (r *AreaRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("area_repo_hard_delete_started", "area_id", id)

	if err := r.queries.HardDeleteArea(context.Background(), id); err != nil {
		r.logger.Error("area_repo_hard_delete_failed", "area_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("area_repo_hard_delete_completed", "area_id", id)
	return nil
}

// sqlcAreaRowToDomain converts sqlc area row fields to domain.Area
func sqlcAreaRowToDomain(id uuid.UUID, slug, name, city, status string, data []byte, createdAt, updatedAt, deletedAt pgtype.Timestamptz) (*domain.Area, error) {
	area := &domain.Area{
		ID:        id,
		Slug:      slug,
		Name:      name,
		City:      city,
		Status:    domain.AreaStatus(status),
		CreatedAt: tstzToTime(createdAt),
		UpdatedAt: tstzToTime(updatedAt),
		DeletedAt: tstzToTimePtr(deletedAt),
	}

	if len(data) > 0 {
		if err := json.Unmarshal(data, &area.Data); err != nil {
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	return area, nil
}
