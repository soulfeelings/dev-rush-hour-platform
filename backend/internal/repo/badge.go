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

type BadgeRepo struct {
	queries *sqlcgen.Queries
	pool    *pgxpool.Pool
	logger  *slog.Logger
}

func NewBadgeRepo(pool *pgxpool.Pool) *BadgeRepo {
	return &BadgeRepo{
		queries: sqlcgen.New(pool),
		pool:    pool,
		logger:  slog.Default(),
	}
}

func (r *BadgeRepo) List() ([]domain.Badge, error) {
	r.logger.Info("badge_repo_list_started")

	rows, err := r.queries.ListBadges(context.Background())
	if err != nil {
		r.logger.Error("badge_repo_list_query_failed", "error", err.Error())
		return nil, err
	}

	badges := make([]domain.Badge, len(rows))
	for i, row := range rows {
		badges[i] = *sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
	}

	r.logger.Info("badge_repo_list_completed", "count", len(badges))
	return badges, nil
}

func (r *BadgeRepo) ListAll() ([]domain.Badge, error) {
	r.logger.Info("badge_repo_list_all_started")

	rows, err := r.queries.ListAllBadges(context.Background())
	if err != nil {
		r.logger.Error("badge_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	badges := make([]domain.Badge, len(rows))
	for i, row := range rows {
		badges[i] = *sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	}

	r.logger.Info("badge_repo_list_all_completed", "count", len(badges))
	return badges, nil
}

func (r *BadgeRepo) GetByID(id uuid.UUID) (*domain.Badge, error) {
	r.logger.Info("badge_repo_get_by_id_started", "badge_id", id)

	row, err := r.queries.GetBadgeByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("badge_repo_get_by_id_not_found", "badge_id", id)
			return nil, nil
		}
		r.logger.Error("badge_repo_get_by_id_failed", "badge_id", id, "error", err.Error())
		return nil, err
	}

	badge := sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	r.logger.Info("badge_repo_get_by_id_completed", "badge_id", id, "badge_slug", badge.Slug)
	return badge, nil
}

func (r *BadgeRepo) GetBySlug(slug string) (*domain.Badge, error) {
	r.logger.Info("badge_repo_get_by_slug_started", "slug", slug)

	row, err := r.queries.GetBadgeBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("badge_repo_get_by_slug_not_found", "slug", slug)
			return nil, nil
		}
		r.logger.Error("badge_repo_get_by_slug_failed", "slug", slug, "error", err.Error())
		return nil, err
	}

	badge := sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
	r.logger.Info("badge_repo_get_by_slug_completed", "slug", slug, "badge_id", badge.ID)
	return badge, nil
}

func (r *BadgeRepo) Create(badge *domain.Badge) error {
	r.logger.Info("badge_repo_create_started", "badge_slug", badge.Slug, "badge_name", badge.Name)

	row, err := r.queries.CreateBadge(context.Background(), sqlcgen.CreateBadgeParams{
		Slug:            badge.Slug,
		Name:            badge.Name,
		BackgroundColor: badge.BackgroundColor,
		TextColor:       badge.TextColor,
		Icon:            stringPtrToText(badge.Icon),
		IconColor:       stringToText(badge.IconColor),
		SortOrder:       int32(badge.SortOrder),
	})
	if err != nil {
		r.logger.Error("badge_repo_create_failed", "badge_slug", badge.Slug, "error", err.Error())
		return err
	}

	badge.ID = row.ID
	badge.CreatedAt = tstzToTime(row.CreatedAt)
	badge.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("badge_repo_create_completed", "badge_id", badge.ID, "badge_slug", badge.Slug)
	return nil
}

func (r *BadgeRepo) Update(id uuid.UUID, badge *domain.Badge) error {
	r.logger.Info("badge_repo_update_started", "badge_id", id)

	updatedAt, err := r.queries.UpdateBadge(context.Background(), sqlcgen.UpdateBadgeParams{
		Slug:            badge.Slug,
		Name:            badge.Name,
		BackgroundColor: badge.BackgroundColor,
		TextColor:       badge.TextColor,
		Icon:            stringPtrToText(badge.Icon),
		IconColor:       stringToText(badge.IconColor),
		SortOrder:       int32(badge.SortOrder),
		ID:              id,
	})
	if err != nil {
		r.logger.Error("badge_repo_update_failed", "badge_id", id, "error", err.Error())
		return err
	}

	badge.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("badge_repo_update_completed", "badge_id", id, "badge_slug", badge.Slug)
	return nil
}

func (r *BadgeRepo) Delete(id uuid.UUID) error {
	r.logger.Info("badge_repo_delete_started", "badge_id", id)

	if err := r.queries.DeleteBadge(context.Background(), id); err != nil {
		r.logger.Error("badge_repo_delete_failed", "badge_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("badge_repo_delete_completed", "badge_id", id)
	return nil
}

// Project badges methods

func (r *BadgeRepo) GetProjectBadges(projectID uuid.UUID) ([]domain.Badge, error) {
	r.logger.Info("badge_repo_get_project_badges_started", "project_id", projectID)

	rows, err := r.queries.GetProjectBadges(context.Background(), projectID)
	if err != nil {
		r.logger.Error("badge_repo_get_project_badges_query_failed", "project_id", projectID, "error", err.Error())
		return nil, err
	}

	badges := make([]domain.Badge, len(rows))
	for i, row := range rows {
		badges[i] = *sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
	}

	r.logger.Info("badge_repo_get_project_badges_completed", "project_id", projectID, "count", len(badges))
	return badges, nil
}

func (r *BadgeRepo) SetProjectBadges(projectID uuid.UUID, badgeIDs []uuid.UUID) error {
	r.logger.Info("badge_repo_set_project_badges_started", "project_id", projectID, "badge_count", len(badgeIDs))

	tx, err := r.pool.Begin(context.Background())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())

	qtx := r.queries.WithTx(tx)

	// Delete existing badges
	if err := qtx.DeleteProjectBadges(context.Background(), projectID); err != nil {
		r.logger.Error("badge_repo_set_project_badges_delete_failed", "project_id", projectID, "error", err.Error())
		return err
	}

	// Insert new badges
	for i, badgeID := range badgeIDs {
		if err := qtx.InsertProjectBadge(context.Background(), sqlcgen.InsertProjectBadgeParams{
			ProjectID: projectID,
			BadgeID:   badgeID,
			SortOrder: int32(i),
		}); err != nil {
			r.logger.Error("badge_repo_set_project_badges_insert_failed", "project_id", projectID, "badge_id", badgeID, "error", err.Error())
			return err
		}
	}

	if err := tx.Commit(context.Background()); err != nil {
		return err
	}

	r.logger.Info("badge_repo_set_project_badges_completed", "project_id", projectID)
	return nil
}

// Lot badges methods

func (r *BadgeRepo) GetLotBadges(lotID uuid.UUID) ([]domain.Badge, error) {
	r.logger.Info("badge_repo_get_lot_badges_started", "lot_id", lotID)

	// lot_badges table was dropped — return empty slice
	r.logger.Info("badge_repo_get_lot_badges_completed", "lot_id", lotID, "count", 0)
	return []domain.Badge{}, nil
}

func (r *BadgeRepo) SetLotBadges(lotID uuid.UUID, badgeIDs []uuid.UUID) error {
	r.logger.Info("badge_repo_set_lot_badges_started", "lot_id", lotID, "badge_count", len(badgeIDs))

	// lot_badges table was dropped — no-op
	r.logger.Info("badge_repo_set_lot_badges_completed", "lot_id", lotID)
	return nil
}

func (r *BadgeRepo) ListDeleted() ([]domain.Badge, error) {
	r.logger.Info("badge_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedBadges(context.Background())
	if err != nil {
		r.logger.Error("badge_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	badges := make([]domain.Badge, len(rows))
	for i, row := range rows {
		badges[i] = *sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	}

	r.logger.Info("badge_repo_list_deleted_completed", "count", len(badges))
	return badges, nil
}

func (r *BadgeRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Badge, error) {
	row, err := r.queries.GetBadgeByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return sqlcBadgeRowToDomain(row.ID, row.Slug, row.Name, row.BackgroundColor, row.TextColor, row.Icon, row.IconColor, row.SortOrder, row.CreatedAt, row.UpdatedAt, row.DeletedAt), nil
}

func (r *BadgeRepo) Restore(id uuid.UUID) error {
	r.logger.Info("badge_repo_restore_started", "badge_id", id)

	if err := r.queries.RestoreBadge(context.Background(), id); err != nil {
		r.logger.Error("badge_repo_restore_failed", "badge_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("badge_repo_restore_completed", "badge_id", id)
	return nil
}

func (r *BadgeRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("badge_repo_hard_delete_started", "badge_id", id)

	if err := r.queries.HardDeleteBadge(context.Background(), id); err != nil {
		r.logger.Error("badge_repo_hard_delete_failed", "badge_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("badge_repo_hard_delete_completed", "badge_id", id)
	return nil
}

// sqlcBadgeRowToDomain converts sqlc badge row fields to domain.Badge
func sqlcBadgeRowToDomain(id uuid.UUID, slug, name, bgColor, textColor string, icon, iconColor pgtype.Text, sortOrder int32, createdAt, updatedAt, deletedAt pgtype.Timestamptz) *domain.Badge {
	return &domain.Badge{
		ID:              id,
		Slug:            slug,
		Name:            name,
		BackgroundColor: bgColor,
		TextColor:       textColor,
		Icon:            textToStringPtr(icon),
		IconColor:       textToString(iconColor),
		SortOrder:       int(sortOrder),
		CreatedAt:       tstzToTime(createdAt),
		UpdatedAt:       tstzToTime(updatedAt),
		DeletedAt:       tstzToTimePtr(deletedAt),
	}
}
