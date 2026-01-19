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
		return nil, ErrLotNotFound
	}
	return lot, nil
}

func (s *LotsService) Create(lot *domain.Lot) error {
	return s.lotRepo.Create(lot)
}

func (s *LotsService) Update(id uuid.UUID, updates *domain.Lot) error {
	existing, err := s.lotRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		return ErrLotNotFound
	}

	// Merge updates with existing data (используем подход из вашей версии)
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.ProjectID != nil {
		existing.ProjectID = updates.ProjectID
	}
	if updates.DeveloperID != nil {
		existing.DeveloperID = updates.DeveloperID
	}
	if updates.AreaID != nil {
		existing.AreaID = updates.AreaID
	}
	if updates.Type != "" {
		existing.Type = updates.Type
	}
	if updates.Bedrooms != nil {
		existing.Bedrooms = updates.Bedrooms
	}
	if updates.Bathrooms != nil {
		existing.Bathrooms = updates.Bathrooms
	}
	if updates.AreaSqm != nil {
		existing.AreaSqm = updates.AreaSqm
	}
	if updates.Floor != nil {
		existing.Floor = updates.Floor
	}
	if updates.PriceCurrency != "" {
		existing.PriceCurrency = updates.PriceCurrency
	}
	if updates.PriceAmount != 0 {
		existing.PriceAmount = updates.PriceAmount
	}
	if len(updates.BonusKeys) > 0 {
		existing.BonusKeys = updates.BonusKeys
	}
	
	// Safe check for Data field updates (ваша версия более безопасная)
	hasDataUpdates := false
	if updates.Data.Media != nil && 
		(len(updates.Data.Media.Photos) > 0 || len(updates.Data.Media.Gallery) > 0 ||
		 len(updates.Data.Media.FloorPlanImages) > 0 || updates.Data.Media.Cover != nil) {
		hasDataUpdates = true
	}
	if updates.Data.PaymentPlan != nil && len(updates.Data.PaymentPlan.Schedule) > 0 {
		hasDataUpdates = true
	}
	if len(updates.Data.Bonuses) > 0 {
		hasDataUpdates = true
	}
	if updates.Data.FloorPosition != nil {
		hasDataUpdates = true
	}
	if len(updates.Data.Tags) > 0 || updates.Data.View != "" || 
		updates.Data.Furnishing != "" || updates.Data.Orientation != "" || 
		len(updates.Data.Features) > 0 {
		hasDataUpdates = true
	}
	
	if hasDataUpdates {
		existing.Data = updates.Data
	}

	return s.lotRepo.Update(id, existing)
}

func (s *LotsService) Delete(id uuid.UUID) error {
	existing, err := s.lotRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		return ErrLotNotFound
	}

	return s.lotRepo.Delete(id)
}