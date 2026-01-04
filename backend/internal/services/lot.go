package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
	"github.com/google/uuid"
)

type LotsService struct {
	lotRepo *repo.LotRepo
}

func NewLotsService(lotRepo *repo.LotRepo) *LotsService {
	return &LotsService{lotRepo: lotRepo}
}

func (s *LotsService) List(filters repo.LotFilters, sort repo.LotSort, page, limit int) ([]domain.Lot, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	return s.lotRepo.List(filters, sort, limit, offset)
}

func (s *LotsService) GetByID(id uuid.UUID) (*domain.Lot, error) {
	lot, err := s.lotRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get lot: %w", err)
	}
	if lot == nil {
		return nil, fmt.Errorf("lot not found")
	}
	return lot, nil
}

func (s *LotsService) Create(lot *domain.Lot) error {
	return s.lotRepo.Create(lot)
}

func (s *LotsService) Update(id uuid.UUID, lot *domain.Lot) error {
	existing, err := s.lotRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("lot not found")
	}

	return s.lotRepo.Update(id, lot)
}

