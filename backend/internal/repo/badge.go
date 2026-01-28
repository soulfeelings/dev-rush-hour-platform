package repo

import (
	"database/sql"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type BadgeRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewBadgeRepo(db *sql.DB) *BadgeRepo {
	return &BadgeRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *BadgeRepo) List() ([]domain.Badge, error) {
	r.logger.Info("badge_repo_list_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, background_color, text_color, icon, status, sort_order, created_at, updated_at
		FROM badges
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY sort_order, name
	`)
	if err != nil {
		r.logger.Error("badge_repo_list_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	badges := []domain.Badge{}
	for rows.Next() {
		var badge domain.Badge

		if err := rows.Scan(
			&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
			&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt,
		); err != nil {
			r.logger.Error("badge_repo_list_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		badges = append(badges, badge)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("badge_repo_list_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("badge_repo_list_completed",
		"count", len(badges),
	)

	return badges, nil
}

func (r *BadgeRepo) ListAll() ([]domain.Badge, error) {
	r.logger.Info("badge_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, background_color, text_color, icon, status, sort_order, created_at, updated_at, deleted_at
		FROM badges
		WHERE deleted_at IS NULL
		ORDER BY sort_order, name
	`)
	if err != nil {
		r.logger.Error("badge_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	badges := []domain.Badge{}
	for rows.Next() {
		var badge domain.Badge

		if err := rows.Scan(
			&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
			&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt, &badge.DeletedAt,
		); err != nil {
			r.logger.Error("badge_repo_list_all_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		badges = append(badges, badge)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("badge_repo_list_all_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("badge_repo_list_all_completed",
		"count", len(badges),
	)

	return badges, nil
}

func (r *BadgeRepo) GetByID(id uuid.UUID) (*domain.Badge, error) {
	r.logger.Info("badge_repo_get_by_id_started",
		"badge_id", id,
	)

	var badge domain.Badge

	err := r.db.QueryRow(`
		SELECT id, slug, name, background_color, text_color, icon, status, sort_order, created_at, updated_at, deleted_at
		FROM badges
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
		&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt, &badge.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("badge_repo_get_by_id_not_found",
				"badge_id", id,
			)
			return nil, nil
		}
		r.logger.Error("badge_repo_get_by_id_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("badge_repo_get_by_id_completed",
		"badge_id", id,
		"badge_slug", badge.Slug,
	)

	return &badge, nil
}

func (r *BadgeRepo) GetBySlug(slug string) (*domain.Badge, error) {
	r.logger.Info("badge_repo_get_by_slug_started",
		"slug", slug,
	)

	var badge domain.Badge

	err := r.db.QueryRow(`
		SELECT id, slug, name, background_color, text_color, icon, status, sort_order, created_at, updated_at
		FROM badges
		WHERE slug = $1 AND deleted_at IS NULL
	`, slug).Scan(
		&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
		&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("badge_repo_get_by_slug_not_found",
				"slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("badge_repo_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("badge_repo_get_by_slug_completed",
		"slug", slug,
		"badge_id", badge.ID,
	)

	return &badge, nil
}

func (r *BadgeRepo) Create(badge *domain.Badge) error {
	r.logger.Info("badge_repo_create_started",
		"badge_slug", badge.Slug,
		"badge_name", badge.Name,
	)

	err := r.db.QueryRow(`
		INSERT INTO badges (slug, name, background_color, text_color, icon, status, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`, badge.Slug, badge.Name, badge.BackgroundColor, badge.TextColor, badge.Icon, badge.Status, badge.SortOrder).Scan(
		&badge.ID, &badge.CreatedAt, &badge.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("badge_repo_create_failed",
			"badge_slug", badge.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("badge_repo_create_completed",
		"badge_id", badge.ID,
		"badge_slug", badge.Slug,
	)

	return nil
}

func (r *BadgeRepo) Update(id uuid.UUID, badge *domain.Badge) error {
	r.logger.Info("badge_repo_update_started",
		"badge_id", id,
	)

	err := r.db.QueryRow(`
		UPDATE badges
		SET slug = $1, name = $2, background_color = $3, text_color = $4, icon = $5, status = $6, sort_order = $7, updated_at = NOW()
		WHERE id = $8 AND deleted_at IS NULL
		RETURNING updated_at
	`, badge.Slug, badge.Name, badge.BackgroundColor, badge.TextColor, badge.Icon, badge.Status, badge.SortOrder, id).Scan(&badge.UpdatedAt)

	if err != nil {
		r.logger.Error("badge_repo_update_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("badge_repo_update_completed",
		"badge_id", id,
		"badge_slug", badge.Slug,
	)

	return nil
}

func (r *BadgeRepo) Delete(id uuid.UUID) error {
	r.logger.Info("badge_repo_delete_started",
		"badge_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE badges
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("badge_repo_delete_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("badge_repo_delete_completed",
		"badge_id", id,
	)

	return nil
}

// Project badges methods

func (r *BadgeRepo) GetProjectBadges(projectID uuid.UUID) ([]domain.Badge, error) {
	r.logger.Info("badge_repo_get_project_badges_started",
		"project_id", projectID,
	)

	rows, err := r.db.Query(`
		SELECT b.id, b.slug, b.name, b.background_color, b.text_color, b.icon, b.status, b.sort_order, b.created_at, b.updated_at
		FROM badges b
		INNER JOIN project_badges pb ON b.id = pb.badge_id
		WHERE pb.project_id = $1 AND b.status = 'active' AND b.deleted_at IS NULL
		ORDER BY pb.sort_order, b.sort_order
	`, projectID)
	if err != nil {
		r.logger.Error("badge_repo_get_project_badges_query_failed",
			"project_id", projectID,
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	badges := []domain.Badge{}
	for rows.Next() {
		var badge domain.Badge
		if err := rows.Scan(
			&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
			&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt,
		); err != nil {
			r.logger.Error("badge_repo_get_project_badges_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}
		badges = append(badges, badge)
	}

	r.logger.Info("badge_repo_get_project_badges_completed",
		"project_id", projectID,
		"count", len(badges),
	)

	return badges, nil
}

func (r *BadgeRepo) SetProjectBadges(projectID uuid.UUID, badgeIDs []uuid.UUID) error {
	r.logger.Info("badge_repo_set_project_badges_started",
		"project_id", projectID,
		"badge_count", len(badgeIDs),
	)

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete existing badges
	_, err = tx.Exec(`DELETE FROM project_badges WHERE project_id = $1`, projectID)
	if err != nil {
		r.logger.Error("badge_repo_set_project_badges_delete_failed",
			"project_id", projectID,
			"error", err.Error(),
		)
		return err
	}

	// Insert new badges
	for i, badgeID := range badgeIDs {
		_, err = tx.Exec(`
			INSERT INTO project_badges (project_id, badge_id, sort_order)
			VALUES ($1, $2, $3)
		`, projectID, badgeID, i)
		if err != nil {
			r.logger.Error("badge_repo_set_project_badges_insert_failed",
				"project_id", projectID,
				"badge_id", badgeID,
				"error", err.Error(),
			)
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	r.logger.Info("badge_repo_set_project_badges_completed",
		"project_id", projectID,
	)

	return nil
}

// Lot badges methods

func (r *BadgeRepo) GetLotBadges(lotID uuid.UUID) ([]domain.Badge, error) {
	r.logger.Info("badge_repo_get_lot_badges_started",
		"lot_id", lotID,
	)

	rows, err := r.db.Query(`
		SELECT b.id, b.slug, b.name, b.background_color, b.text_color, b.icon, b.status, b.sort_order, b.created_at, b.updated_at
		FROM badges b
		INNER JOIN lot_badges lb ON b.id = lb.badge_id
		WHERE lb.lot_id = $1 AND b.status = 'active' AND b.deleted_at IS NULL
		ORDER BY lb.sort_order, b.sort_order
	`, lotID)
	if err != nil {
		r.logger.Error("badge_repo_get_lot_badges_query_failed",
			"lot_id", lotID,
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	badges := []domain.Badge{}
	for rows.Next() {
		var badge domain.Badge
		if err := rows.Scan(
			&badge.ID, &badge.Slug, &badge.Name, &badge.BackgroundColor, &badge.TextColor,
			&badge.Icon, &badge.Status, &badge.SortOrder, &badge.CreatedAt, &badge.UpdatedAt,
		); err != nil {
			r.logger.Error("badge_repo_get_lot_badges_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}
		badges = append(badges, badge)
	}

	r.logger.Info("badge_repo_get_lot_badges_completed",
		"lot_id", lotID,
		"count", len(badges),
	)

	return badges, nil
}

func (r *BadgeRepo) SetLotBadges(lotID uuid.UUID, badgeIDs []uuid.UUID) error {
	r.logger.Info("badge_repo_set_lot_badges_started",
		"lot_id", lotID,
		"badge_count", len(badgeIDs),
	)

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete existing badges
	_, err = tx.Exec(`DELETE FROM lot_badges WHERE lot_id = $1`, lotID)
	if err != nil {
		r.logger.Error("badge_repo_set_lot_badges_delete_failed",
			"lot_id", lotID,
			"error", err.Error(),
		)
		return err
	}

	// Insert new badges
	for i, badgeID := range badgeIDs {
		_, err = tx.Exec(`
			INSERT INTO lot_badges (lot_id, badge_id, sort_order)
			VALUES ($1, $2, $3)
		`, lotID, badgeID, i)
		if err != nil {
			r.logger.Error("badge_repo_set_lot_badges_insert_failed",
				"lot_id", lotID,
				"badge_id", badgeID,
				"error", err.Error(),
			)
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	r.logger.Info("badge_repo_set_lot_badges_completed",
		"lot_id", lotID,
	)

	return nil
}
