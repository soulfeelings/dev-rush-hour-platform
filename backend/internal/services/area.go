package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
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
		return nil, fmt.Errorf("area not found")
	}
	return area, nil
}

