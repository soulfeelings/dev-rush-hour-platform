package services

import (
	"fmt"
	"github.com/google/uuid"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
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

	// Merge with existing data
	if lot.ProjectID == nil {
		lot.ProjectID = existing.ProjectID
	}
	if lot.DeveloperID == nil {
		lot.DeveloperID = existing.DeveloperID
	}
	if lot.AreaID == nil {
		lot.AreaID = existing.AreaID
	}
	if lot.Type == "" {
		lot.Type = existing.Type
	}
	if lot.Status == "" {
		lot.Status = existing.Status
	}
	if lot.Bedrooms == nil {
		lot.Bedrooms = existing.Bedrooms
	}
	if lot.Bathrooms == nil {
		lot.Bathrooms = existing.Bathrooms
	}
	if lot.AreaSqm == nil {
		lot.AreaSqm = existing.AreaSqm
	}
	if lot.Floor == nil {
		lot.Floor = existing.Floor
	}
	if lot.PriceCurrency == "" {
		lot.PriceCurrency = existing.PriceCurrency
	}
	if lot.PriceAmount == 0 {
		lot.PriceAmount = existing.PriceAmount
	}
	if lot.BonusKeys == nil {
		lot.BonusKeys = existing.BonusKeys
	}

	// Merge Data fields
	// Merge Media fields if Media was provided
	if lot.Data.Media != nil && existing.Data.Media != nil {
		if lot.Data.Media.Cover == nil {
			lot.Data.Media.Cover = existing.Data.Media.Cover
		}
		if lot.Data.Media.Photos == nil || len(lot.Data.Media.Photos) == 0 {
			lot.Data.Media.Photos = existing.Data.Media.Photos
		}
		if lot.Data.Media.Gallery == nil || len(lot.Data.Media.Gallery) == 0 {
			lot.Data.Media.Gallery = existing.Data.Media.Gallery
		}
		if lot.Data.Media.FloorPlanImages == nil || len(lot.Data.Media.FloorPlanImages) == 0 {
			lot.Data.Media.FloorPlanImages = existing.Data.Media.FloorPlanImages
		}
	} else if lot.Data.Media == nil {
		lot.Data.Media = existing.Data.Media
	}
	if lot.Data.PaymentPlan == nil {
		lot.Data.PaymentPlan = existing.Data.PaymentPlan
	}
	if lot.Data.Bonuses == nil {
		lot.Data.Bonuses = existing.Data.Bonuses
	}
	if lot.Data.FloorPosition == nil {
		lot.Data.FloorPosition = existing.Data.FloorPosition
	}
	if lot.Data.Tags == nil {
		lot.Data.Tags = existing.Data.Tags
	}
	if lot.Data.View == "" {
		lot.Data.View = existing.Data.View
	}
	if lot.Data.Furnishing == "" {
		lot.Data.Furnishing = existing.Data.Furnishing
	}
	if lot.Data.Orientation == "" {
		lot.Data.Orientation = existing.Data.Orientation
	}
	if lot.Data.Features == nil {
		lot.Data.Features = existing.Data.Features
	}

	return s.lotRepo.Update(id, lot)
}
