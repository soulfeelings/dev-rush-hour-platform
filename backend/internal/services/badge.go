package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type BadgesService struct {
	badgeRepo *repo.BadgeRepo
	logger    *slog.Logger
}

func NewBadgesService(badgeRepo *repo.BadgeRepo) *BadgesService {
	return &BadgesService{
		badgeRepo: badgeRepo,
		logger:    slog.Default(),
	}
}

func (s *BadgesService) List() ([]domain.Badge, error) {
	s.logger.Info("badge_service_list_started")

	badges, err := s.badgeRepo.List()
	if err != nil {
		s.logger.Error("badge_service_list_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("badge_service_list_completed",
		"count", len(badges),
	)

	return badges, nil
}

func (s *BadgesService) ListAll() ([]domain.Badge, error) {
	s.logger.Info("badge_service_list_all_started")

	badges, err := s.badgeRepo.ListAll()
	if err != nil {
		s.logger.Error("badge_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("badge_service_list_all_completed",
		"count", len(badges),
	)

	return badges, nil
}

func (s *BadgesService) GetByID(id uuid.UUID) (*domain.Badge, error) {
	s.logger.Info("badge_service_get_by_id_started",
		"badge_id", id,
	)

	badge, err := s.badgeRepo.GetByID(id)
	if err != nil {
		s.logger.Error("badge_service_get_by_id_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get badge: %w", err)
	}
	if badge == nil {
		s.logger.Warn("badge_service_get_by_id_not_found",
			"badge_id", id,
		)
		return nil, ErrBadgeNotFound
	}

	s.logger.Info("badge_service_get_by_id_completed",
		"badge_id", id,
		"badge_slug", badge.Slug,
	)

	return badge, nil
}

func (s *BadgesService) GetBySlug(slug string) (*domain.Badge, error) {
	s.logger.Info("badge_service_get_by_slug_started",
		"slug", slug,
	)

	badge, err := s.badgeRepo.GetBySlug(slug)
	if err != nil {
		s.logger.Error("badge_service_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get badge: %w", err)
	}
	if badge == nil {
		s.logger.Warn("badge_service_get_by_slug_not_found",
			"slug", slug,
		)
		return nil, ErrBadgeNotFound
	}

	s.logger.Info("badge_service_get_by_slug_completed",
		"slug", slug,
		"badge_id", badge.ID,
	)

	return badge, nil
}

func (s *BadgesService) Create(badge *domain.Badge) error {
	s.logger.Info("badge_service_create_started",
		"badge_slug", badge.Slug,
		"badge_name", badge.Name,
	)

	err := s.badgeRepo.Create(badge)
	if err != nil {
		s.logger.Error("badge_service_create_failed",
			"badge_slug", badge.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("badge_service_create_completed",
		"badge_id", badge.ID,
		"badge_slug", badge.Slug,
	)

	return nil
}

func (s *BadgesService) Update(id uuid.UUID, updates *domain.Badge) error {
	s.logger.Info("badge_service_update_started",
		"badge_id", id,
	)

	existing, err := s.badgeRepo.GetByID(id)
	if err != nil {
		s.logger.Error("badge_service_update_get_existing_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get badge: %w", err)
	}
	if existing == nil {
		s.logger.Warn("badge_service_update_not_found",
			"badge_id", id,
		)
		return ErrBadgeNotFound
	}

	// Apply updates
	if updates.Slug != "" {
		existing.Slug = updates.Slug
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.BackgroundColor != "" {
		existing.BackgroundColor = updates.BackgroundColor
	}
	if updates.TextColor != "" {
		existing.TextColor = updates.TextColor
	}
	if updates.Icon != nil {
		existing.Icon = updates.Icon
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	existing.SortOrder = updates.SortOrder

	err = s.badgeRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("badge_service_update_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("badge_service_update_completed",
		"badge_id", id,
		"badge_slug", existing.Slug,
	)

	return nil
}

func (s *BadgesService) Delete(id uuid.UUID) error {
	s.logger.Info("badge_service_delete_started",
		"badge_id", id,
	)

	existing, err := s.badgeRepo.GetByID(id)
	if err != nil {
		s.logger.Error("badge_service_delete_get_existing_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get badge: %w", err)
	}
	if existing == nil {
		s.logger.Warn("badge_service_delete_not_found",
			"badge_id", id,
		)
		return ErrBadgeNotFound
	}

	err = s.badgeRepo.Delete(id)
	if err != nil {
		s.logger.Error("badge_service_delete_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("badge_service_delete_completed",
		"badge_id", id,
		"badge_slug", existing.Slug,
	)

	return nil
}

// Project badges methods

func (s *BadgesService) GetProjectBadges(projectID uuid.UUID) ([]domain.Badge, error) {
	return s.badgeRepo.GetProjectBadges(projectID)
}

func (s *BadgesService) SetProjectBadges(projectID uuid.UUID, badgeIDs []uuid.UUID) error {
	return s.badgeRepo.SetProjectBadges(projectID, badgeIDs)
}

// Lot badges methods

func (s *BadgesService) GetLotBadges(lotID uuid.UUID) ([]domain.Badge, error) {
	return s.badgeRepo.GetLotBadges(lotID)
}

func (s *BadgesService) SetLotBadges(lotID uuid.UUID, badgeIDs []uuid.UUID) error {
	return s.badgeRepo.SetLotBadges(lotID, badgeIDs)
}

func (s *BadgesService) ListDeleted() ([]domain.Badge, error) {
	s.logger.Info("badge_service_list_deleted_started")

	badges, err := s.badgeRepo.ListDeleted()
	if err != nil {
		s.logger.Error("badge_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("badge_service_list_deleted_completed",
		"count", len(badges),
	)

	return badges, nil
}

func (s *BadgesService) Restore(id uuid.UUID) error {
	s.logger.Info("badge_service_restore_started", "badge_id", id)

	existing, err := s.badgeRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("badge_service_restore_get_existing_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get badge: %w", err)
	}
	if existing == nil {
		s.logger.Warn("badge_service_restore_not_found", "badge_id", id)
		return ErrBadgeNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("badge_service_restore_not_deleted", "badge_id", id)
		return fmt.Errorf("badge is not deleted")
	}

	err = s.badgeRepo.Restore(id)
	if err != nil {
		s.logger.Error("badge_service_restore_failed", "badge_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("badge_service_restore_completed", "badge_id", id)
	return nil
}

func (s *BadgesService) HardDelete(id uuid.UUID) error {
	s.logger.Info("badge_service_hard_delete_started", "badge_id", id)

	existing, err := s.badgeRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("badge_service_hard_delete_get_existing_failed",
			"badge_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get badge: %w", err)
	}
	if existing == nil {
		s.logger.Warn("badge_service_hard_delete_not_found", "badge_id", id)
		return ErrBadgeNotFound
	}

	err = s.badgeRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("badge_service_hard_delete_failed", "badge_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("badge_service_hard_delete_completed", "badge_id", id)
	return nil
}
