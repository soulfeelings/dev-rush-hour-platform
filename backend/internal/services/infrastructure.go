package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type InfrastructuresService struct {
	infrastructureRepo *repo.InfrastructureRepo
	logger             *slog.Logger
}

func NewInfrastructuresService(infrastructureRepo *repo.InfrastructureRepo) *InfrastructuresService {
	return &InfrastructuresService{
		infrastructureRepo: infrastructureRepo,
		logger:             slog.Default(),
	}
}

func (s *InfrastructuresService) ListAll() ([]domain.Infrastructure, error) {
	s.logger.Info("infrastructure_service_list_all_started")

	infrastructures, err := s.infrastructureRepo.ListAll()
	if err != nil {
		s.logger.Error("infrastructure_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("infrastructure_service_list_all_completed",
		"count", len(infrastructures),
	)

	return infrastructures, nil
}

func (s *InfrastructuresService) GetByID(id uuid.UUID) (*domain.Infrastructure, error) {
	s.logger.Info("infrastructure_service_get_by_id_started",
		"infrastructure_id", id,
	)

	infra, err := s.infrastructureRepo.GetByID(id)
	if err != nil {
		s.logger.Error("infrastructure_service_get_by_id_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get infrastructure: %w", err)
	}
	if infra == nil {
		s.logger.Warn("infrastructure_service_get_by_id_not_found",
			"infrastructure_id", id,
		)
		return nil, ErrInfrastructureNotFound
	}

	s.logger.Info("infrastructure_service_get_by_id_completed",
		"infrastructure_id", id,
		"infrastructure_slug", infra.Slug,
	)

	return infra, nil
}

func (s *InfrastructuresService) Create(infra *domain.Infrastructure) error {
	s.logger.Info("infrastructure_service_create_started",
		"infrastructure_slug", infra.Slug,
		"infrastructure_name", infra.Name,
	)

	err := s.infrastructureRepo.Create(infra)
	if err != nil {
		s.logger.Error("infrastructure_service_create_failed",
			"infrastructure_slug", infra.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("infrastructure_service_create_completed",
		"infrastructure_id", infra.ID,
		"infrastructure_slug", infra.Slug,
	)

	return nil
}

func (s *InfrastructuresService) Update(id uuid.UUID, updates *domain.Infrastructure) error {
	s.logger.Info("infrastructure_service_update_started",
		"infrastructure_id", id,
	)

	existing, err := s.infrastructureRepo.GetByID(id)
	if err != nil {
		s.logger.Error("infrastructure_service_update_get_existing_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get infrastructure: %w", err)
	}
	if existing == nil {
		s.logger.Warn("infrastructure_service_update_not_found",
			"infrastructure_id", id,
		)
		return ErrInfrastructureNotFound
	}

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
	existing.SortOrder = updates.SortOrder

	err = s.infrastructureRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("infrastructure_service_update_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("infrastructure_service_update_completed",
		"infrastructure_id", id,
		"infrastructure_slug", existing.Slug,
	)

	return nil
}

func (s *InfrastructuresService) Delete(id uuid.UUID) error {
	s.logger.Info("infrastructure_service_delete_started",
		"infrastructure_id", id,
	)

	existing, err := s.infrastructureRepo.GetByID(id)
	if err != nil {
		s.logger.Error("infrastructure_service_delete_get_existing_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get infrastructure: %w", err)
	}
	if existing == nil {
		s.logger.Warn("infrastructure_service_delete_not_found",
			"infrastructure_id", id,
		)
		return ErrInfrastructureNotFound
	}

	err = s.infrastructureRepo.Delete(id)
	if err != nil {
		s.logger.Error("infrastructure_service_delete_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("infrastructure_service_delete_completed",
		"infrastructure_id", id,
		"infrastructure_slug", existing.Slug,
	)

	return nil
}

func (s *InfrastructuresService) ListDeleted() ([]domain.Infrastructure, error) {
	s.logger.Info("infrastructure_service_list_deleted_started")

	infrastructures, err := s.infrastructureRepo.ListDeleted()
	if err != nil {
		s.logger.Error("infrastructure_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("infrastructure_service_list_deleted_completed",
		"count", len(infrastructures),
	)

	return infrastructures, nil
}

func (s *InfrastructuresService) Restore(id uuid.UUID) error {
	s.logger.Info("infrastructure_service_restore_started", "infrastructure_id", id)

	existing, err := s.infrastructureRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("infrastructure_service_restore_get_existing_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get infrastructure: %w", err)
	}
	if existing == nil {
		s.logger.Warn("infrastructure_service_restore_not_found", "infrastructure_id", id)
		return ErrInfrastructureNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("infrastructure_service_restore_not_deleted", "infrastructure_id", id)
		return fmt.Errorf("infrastructure is not deleted")
	}

	err = s.infrastructureRepo.Restore(id)
	if err != nil {
		s.logger.Error("infrastructure_service_restore_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("infrastructure_service_restore_completed", "infrastructure_id", id)
	return nil
}

func (s *InfrastructuresService) HardDelete(id uuid.UUID) error {
	s.logger.Info("infrastructure_service_hard_delete_started", "infrastructure_id", id)

	existing, err := s.infrastructureRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("infrastructure_service_hard_delete_get_existing_failed",
			"infrastructure_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get infrastructure: %w", err)
	}
	if existing == nil {
		s.logger.Warn("infrastructure_service_hard_delete_not_found", "infrastructure_id", id)
		return ErrInfrastructureNotFound
	}

	err = s.infrastructureRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("infrastructure_service_hard_delete_failed", "infrastructure_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("infrastructure_service_hard_delete_completed", "infrastructure_id", id)
	return nil
}
