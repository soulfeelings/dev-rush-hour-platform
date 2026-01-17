package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type AreasService struct {
	areaRepo *repo.AreaRepo
}

func NewAreasService(areaRepo *repo.AreaRepo) *AreasService {
	return &AreasService{areaRepo: areaRepo}
}

func (s *AreasService) List(includeBoundary bool) ([]domain.Area, error) {
	return s.areaRepo.List(includeBoundary)
}

func (s *AreasService) GetBySlug(slug string) (*domain.Area, error) {
	area, err := s.areaRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get area: %w", err)
	}
	if area == nil {
		return nil, ErrAreaNotFound
	}
	return area, nil
}

func (s *AreasService) Create(area *domain.Area) error {
	return s.areaRepo.Create(area)
}

func (s *AreasService) Update(id uuid.UUID, area *domain.Area) error {
	existing, err := s.areaRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		return ErrAreaNotFound
	}

	return s.areaRepo.Update(id, area)
}

func (s *AreasService) GetByID(id uuid.UUID) (*domain.Area, error) {
	area, err := s.areaRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get area: %w", err)
	}
	if area == nil {
		return nil, ErrAreaNotFound
	}
	return area, nil
}

func (s *AreasService) ListAll() ([]domain.Area, error) {
	return s.areaRepo.ListAll()
}

func (s *AreasService) Delete(id uuid.UUID) error {
	existing, err := s.areaRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get area: %w", err)
	}
	if existing == nil {
		return ErrAreaNotFound
	}

	return s.areaRepo.Delete(id)
}

