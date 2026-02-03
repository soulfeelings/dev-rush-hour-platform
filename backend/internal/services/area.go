package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type AreasService struct {
	areaRepo *repo.AreaRepo
	logger   *slog.Logger
}

func NewAreasService(areaRepo *repo.AreaRepo) *AreasService {
	return &AreasService{
		areaRepo: areaRepo,
		logger:   slog.Default(),
	}
}

func (s *AreasService) List(includeBoundary bool) ([]domain.Area, error) {
	s.logger.Info("area_service_list_started",
		"include_boundary", includeBoundary,
	)

	areas, err := s.areaRepo.List(includeBoundary)
	if err != nil {
		s.logger.Error("area_service_list_failed",
			"include_boundary", includeBoundary,
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("area_service_list_completed",
		"count", len(areas),
		"include_boundary", includeBoundary,
	)

	return areas, nil
}

func (s *AreasService) GetBySlug(slug string) (*domain.Area, error) {
	s.logger.Info("area_service_get_by_slug_started",
		"slug", slug,
	)

	area, err := s.areaRepo.GetBySlug(slug)
	if err != nil {
		s.logger.Error("area_service_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get area: %w", err)
	}
	if area == nil {
		s.logger.Warn("area_service_get_by_slug_not_found",
			"slug", slug,
		)
		return nil, ErrAreaNotFound
	}

	s.logger.Info("area_service_get_by_slug_completed",
		"slug", slug,
		"area_id", area.ID,
	)

	return area, nil
}

func (s *AreasService) Create(area *domain.Area) error {
	s.logger.Info("area_service_create_started",
		"area_slug", area.Slug,
		"area_name", area.Name,
	)

	err := s.areaRepo.Create(area)
	if err != nil {
		s.logger.Error("area_service_create_failed",
			"area_slug", area.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("area_service_create_completed",
		"area_id", area.ID,
		"area_slug", area.Slug,
	)

	return nil
}

func (s *AreasService) Update(id uuid.UUID, updates *domain.Area) error {
	s.logger.Info("area_service_update_started",
		"area_id", id,
	)

	existing, err := s.areaRepo.GetByID(id)
	if err != nil {
		s.logger.Error("area_service_update_get_existing_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		s.logger.Warn("area_service_update_not_found",
			"area_id", id,
		)
		return ErrAreaNotFound
	}

	// Merge updates with existing data
	if updates.Slug != "" {
		existing.Slug = updates.Slug
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.City != "" {
		existing.City = updates.City
	}
	if updates.Lat != 0 {
		existing.Lat = updates.Lat
	}
	if updates.Lng != 0 {
		existing.Lng = updates.Lng
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.Data.Boundary != nil || updates.Data.Center != nil ||
		updates.Data.Zoom != nil || updates.Data.BBox != nil || len(updates.Data.SEO) > 0 {
		existing.Data = updates.Data
	}

	err = s.areaRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("area_service_update_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("area_service_update_completed",
		"area_id", id,
		"area_slug", existing.Slug,
	)

	return nil
}

func (s *AreasService) GetByID(id uuid.UUID) (*domain.Area, error) {
	s.logger.Info("area_service_get_by_id_started",
		"area_id", id,
	)

	area, err := s.areaRepo.GetByID(id)
	if err != nil {
		s.logger.Error("area_service_get_by_id_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get area: %w", err)
	}
	if area == nil {
		s.logger.Warn("area_service_get_by_id_not_found",
			"area_id", id,
		)
		return nil, ErrAreaNotFound
	}

	s.logger.Info("area_service_get_by_id_completed",
		"area_id", id,
		"area_slug", area.Slug,
	)

	return area, nil
}

func (s *AreasService) ListAll() ([]domain.Area, error) {
	s.logger.Info("area_service_list_all_started")

	areas, err := s.areaRepo.ListAll()
	if err != nil {
		s.logger.Error("area_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("area_service_list_all_completed",
		"count", len(areas),
	)

	return areas, nil
}

func (s *AreasService) Delete(id uuid.UUID) error {
	s.logger.Info("area_service_delete_started",
		"area_id", id,
	)

	existing, err := s.areaRepo.GetByID(id)
	if err != nil {
		s.logger.Error("area_service_delete_get_existing_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		s.logger.Warn("area_service_delete_not_found",
			"area_id", id,
		)
		return ErrAreaNotFound
	}

	err = s.areaRepo.Delete(id)
	if err != nil {
		s.logger.Error("area_service_delete_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("area_service_delete_completed",
		"area_id", id,
		"area_slug", existing.Slug,
	)

	return nil
}

func (s *AreasService) ListDeleted() ([]domain.Area, error) {
	s.logger.Info("area_service_list_deleted_started")

	areas, err := s.areaRepo.ListDeleted()
	if err != nil {
		s.logger.Error("area_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("area_service_list_deleted_completed",
		"count", len(areas),
	)

	return areas, nil
}

func (s *AreasService) Restore(id uuid.UUID) error {
	s.logger.Info("area_service_restore_started", "area_id", id)

	existing, err := s.areaRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("area_service_restore_get_existing_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		s.logger.Warn("area_service_restore_not_found", "area_id", id)
		return ErrAreaNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("area_service_restore_not_deleted", "area_id", id)
		return fmt.Errorf("area is not deleted")
	}

	err = s.areaRepo.Restore(id)
	if err != nil {
		s.logger.Error("area_service_restore_failed", "area_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("area_service_restore_completed", "area_id", id)
	return nil
}

func (s *AreasService) HardDelete(id uuid.UUID) error {
	s.logger.Info("area_service_hard_delete_started", "area_id", id)

	existing, err := s.areaRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("area_service_hard_delete_get_existing_failed",
			"area_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		s.logger.Warn("area_service_hard_delete_not_found", "area_id", id)
		return ErrAreaNotFound
	}

	err = s.areaRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("area_service_hard_delete_failed", "area_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("area_service_hard_delete_completed", "area_id", id)
	return nil
}

