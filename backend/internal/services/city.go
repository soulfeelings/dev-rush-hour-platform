package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type CitiesService struct {
	cityRepo *repo.CityRepo
	logger   *slog.Logger
}

func NewCitiesService(cityRepo *repo.CityRepo) *CitiesService {
	return &CitiesService{
		cityRepo: cityRepo,
		logger:   slog.Default(),
	}
}

func (s *CitiesService) List() ([]domain.City, error) {
	s.logger.Info("city_service_list_started")

	cities, err := s.cityRepo.List()
	if err != nil {
		s.logger.Error("city_service_list_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("city_service_list_completed",
		"count", len(cities),
	)

	return cities, nil
}

func (s *CitiesService) GetBySlug(slug string) (*domain.City, error) {
	s.logger.Info("city_service_get_by_slug_started",
		"slug", slug,
	)

	city, err := s.cityRepo.GetBySlug(slug)
	if err != nil {
		s.logger.Error("city_service_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get city: %w", err)
	}
	if city == nil {
		s.logger.Warn("city_service_get_by_slug_not_found",
			"slug", slug,
		)
		return nil, ErrCityNotFound
	}

	s.logger.Info("city_service_get_by_slug_completed",
		"slug", slug,
		"city_id", city.ID,
	)

	return city, nil
}

func (s *CitiesService) GetByID(id uuid.UUID) (*domain.City, error) {
	s.logger.Info("city_service_get_by_id_started",
		"city_id", id,
	)

	city, err := s.cityRepo.GetByID(id)
	if err != nil {
		s.logger.Error("city_service_get_by_id_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get city: %w", err)
	}
	if city == nil {
		s.logger.Warn("city_service_get_by_id_not_found",
			"city_id", id,
		)
		return nil, ErrCityNotFound
	}

	s.logger.Info("city_service_get_by_id_completed",
		"city_id", id,
		"city_slug", city.Slug,
	)

	return city, nil
}

func (s *CitiesService) Create(city *domain.City) error {
	s.logger.Info("city_service_create_started",
		"city_slug", city.Slug,
		"city_name", city.Name,
	)

	err := s.cityRepo.Create(city)
	if err != nil {
		s.logger.Error("city_service_create_failed",
			"city_slug", city.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("city_service_create_completed",
		"city_id", city.ID,
		"city_slug", city.Slug,
	)

	return nil
}

func (s *CitiesService) Update(id uuid.UUID, updates *domain.City) error {
	s.logger.Info("city_service_update_started",
		"city_id", id,
	)

	existing, err := s.cityRepo.GetByID(id)
	if err != nil {
		s.logger.Error("city_service_update_get_existing_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get city: %w", err)
	}
	if existing == nil {
		s.logger.Warn("city_service_update_not_found",
			"city_id", id,
		)
		return ErrCityNotFound
	}

	if updates.Slug != "" {
		existing.Slug = updates.Slug
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}

	err = s.cityRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("city_service_update_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("city_service_update_completed",
		"city_id", id,
		"city_slug", existing.Slug,
	)

	return nil
}

func (s *CitiesService) Delete(id uuid.UUID) error {
	s.logger.Info("city_service_delete_started",
		"city_id", id,
	)

	existing, err := s.cityRepo.GetByID(id)
	if err != nil {
		s.logger.Error("city_service_delete_get_existing_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get city: %w", err)
	}
	if existing == nil {
		s.logger.Warn("city_service_delete_not_found",
			"city_id", id,
		)
		return ErrCityNotFound
	}

	err = s.cityRepo.Delete(id)
	if err != nil {
		s.logger.Error("city_service_delete_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("city_service_delete_completed",
		"city_id", id,
		"city_slug", existing.Slug,
	)

	return nil
}

func (s *CitiesService) ListAll() ([]domain.City, error) {
	s.logger.Info("city_service_list_all_started")

	cities, err := s.cityRepo.ListAll()
	if err != nil {
		s.logger.Error("city_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("city_service_list_all_completed",
		"count", len(cities),
	)

	return cities, nil
}

func (s *CitiesService) ListDeleted() ([]domain.City, error) {
	s.logger.Info("city_service_list_deleted_started")

	cities, err := s.cityRepo.ListDeleted()
	if err != nil {
		s.logger.Error("city_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("city_service_list_deleted_completed",
		"count", len(cities),
	)

	return cities, nil
}

func (s *CitiesService) Restore(id uuid.UUID) error {
	s.logger.Info("city_service_restore_started", "city_id", id)

	existing, err := s.cityRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("city_service_restore_get_existing_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get city: %w", err)
	}
	if existing == nil {
		s.logger.Warn("city_service_restore_not_found", "city_id", id)
		return ErrCityNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("city_service_restore_not_deleted", "city_id", id)
		return fmt.Errorf("city is not deleted")
	}

	err = s.cityRepo.Restore(id)
	if err != nil {
		s.logger.Error("city_service_restore_failed", "city_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("city_service_restore_completed", "city_id", id)
	return nil
}

func (s *CitiesService) HardDelete(id uuid.UUID) error {
	s.logger.Info("city_service_hard_delete_started", "city_id", id)

	existing, err := s.cityRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("city_service_hard_delete_get_existing_failed",
			"city_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get city: %w", err)
	}
	if existing == nil {
		s.logger.Warn("city_service_hard_delete_not_found", "city_id", id)
		return ErrCityNotFound
	}

	err = s.cityRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("city_service_hard_delete_failed", "city_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("city_service_hard_delete_completed", "city_id", id)
	return nil
}
