package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type DevelopersService struct {
	developerRepo *repo.DeveloperRepo
	logger        *slog.Logger
}

func NewDevelopersService(developerRepo *repo.DeveloperRepo) *DevelopersService {
	return &DevelopersService{
		developerRepo: developerRepo,
		logger:        slog.Default(),
	}
}

func (s *DevelopersService) Create(dev *domain.Developer) error {
	s.logger.Info("developer_service_create_started",
		"developer_slug", dev.Slug,
		"developer_name", dev.Name,
	)

	err := s.developerRepo.Create(dev)
	if err != nil {
		s.logger.Error("developer_service_create_failed",
			"developer_slug", dev.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("developer_service_create_completed",
		"developer_id", dev.ID,
		"developer_slug", dev.Slug,
	)

	return nil
}

func (s *DevelopersService) Update(id uuid.UUID, updates *domain.Developer) error {
	s.logger.Info("developer_service_update_started",
		"developer_id", id,
	)

	existing, err := s.developerRepo.GetByID(id)
	if err != nil {
		s.logger.Error("developer_service_update_get_existing_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get developer: %w", err)
	}
	if existing == nil {
		s.logger.Warn("developer_service_update_not_found",
			"developer_id", id,
		)
		return ErrDeveloperNotFound
	}

	// Merge updates with existing data
	if updates.Slug != "" {
		existing.Slug = updates.Slug
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.LogoURL != "" {
		existing.LogoURL = updates.LogoURL
	}

	err = s.developerRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("developer_service_update_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("developer_service_update_completed",
		"developer_id", id,
		"developer_slug", existing.Slug,
	)

	return nil
}

func (s *DevelopersService) GetByID(id uuid.UUID) (*domain.Developer, error) {
	s.logger.Info("developer_service_get_by_id_started",
		"developer_id", id,
	)

	dev, err := s.developerRepo.GetByID(id)
	if err != nil {
		s.logger.Error("developer_service_get_by_id_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get developer: %w", err)
	}
	if dev == nil {
		s.logger.Warn("developer_service_get_by_id_not_found",
			"developer_id", id,
		)
		return nil, ErrDeveloperNotFound
	}

	s.logger.Info("developer_service_get_by_id_completed",
		"developer_id", id,
		"developer_slug", dev.Slug,
	)

	return dev, nil
}

func (s *DevelopersService) List() ([]domain.Developer, error) {
	s.logger.Info("developer_service_list_started")

	developers, err := s.developerRepo.List()
	if err != nil {
		s.logger.Error("developer_service_list_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("developer_service_list_completed",
		"count", len(developers),
	)

	return developers, nil
}

func (s *DevelopersService) ListDeleted() ([]domain.Developer, error) {
	s.logger.Info("developer_service_list_deleted_started")

	developers, err := s.developerRepo.ListDeleted()
	if err != nil {
		s.logger.Error("developer_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("developer_service_list_deleted_completed",
		"count", len(developers),
	)

	return developers, nil
}

func (s *DevelopersService) Restore(id uuid.UUID) (*domain.Developer, error) {
	s.logger.Info("developer_service_restore_started",
		"developer_id", id,
	)

	existing, err := s.developerRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("developer_service_restore_get_existing_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get developer: %w", err)
	}
	if existing == nil {
		s.logger.Warn("developer_service_restore_not_found",
			"developer_id", id,
		)
		return nil, ErrDeveloperNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("developer_service_restore_not_deleted",
			"developer_id", id,
		)
		return nil, fmt.Errorf("developer is not deleted")
	}

	err = s.developerRepo.Restore(id)
	if err != nil {
		s.logger.Error("developer_service_restore_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	restored, err := s.developerRepo.GetByID(id)
	if err != nil {
		s.logger.Error("developer_service_restore_get_restored_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("developer_service_restore_completed",
		"developer_id", id,
		"developer_slug", existing.Slug,
	)

	return restored, nil
}

func (s *DevelopersService) Delete(id uuid.UUID) error {
	s.logger.Info("developer_service_delete_started",
		"developer_id", id,
	)

	existing, err := s.developerRepo.GetByID(id)
	if err != nil {
		s.logger.Error("developer_service_delete_get_existing_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get developer: %w", err)
	}
	if existing == nil {
		s.logger.Warn("developer_service_delete_not_found",
			"developer_id", id,
		)
		return ErrDeveloperNotFound
	}

	err = s.developerRepo.Delete(id)
	if err != nil {
		s.logger.Error("developer_service_delete_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("developer_service_delete_completed",
		"developer_id", id,
		"developer_slug", existing.Slug,
	)

	return nil
}

func (s *DevelopersService) HardDelete(id uuid.UUID) error {
	s.logger.Info("developer_service_hard_delete_started",
		"developer_id", id,
	)

	existing, err := s.developerRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("developer_service_hard_delete_get_existing_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get developer: %w", err)
	}
	if existing == nil {
		s.logger.Warn("developer_service_hard_delete_not_found",
			"developer_id", id,
		)
		return ErrDeveloperNotFound
	}

	err = s.developerRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("developer_service_hard_delete_failed",
			"developer_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("developer_service_hard_delete_completed",
		"developer_id", id,
		"developer_slug", existing.Slug,
	)

	return nil
}