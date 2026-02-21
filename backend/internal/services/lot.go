package services

import (
	"fmt"
	"log/slog"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/events"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type LotRepository interface {
	GetByID(id uuid.UUID) (*domain.Lot, error)
	GetByIDWithDeleted(id uuid.UUID) (*domain.Lot, error)
	Create(lot *domain.Lot) error
	Update(id uuid.UUID, lot *domain.Lot) error
	Delete(id uuid.UUID) error
	Restore(id uuid.UUID) error
	HardDelete(id uuid.UUID) error
	List(filters repo.LotFilters, sort repo.LotSort, limit, offset int) ([]domain.Lot, int, error)
	ListAll() ([]domain.Lot, error)
	ListDeleted() ([]domain.Lot, error)
}

type LotsService struct {
	lotRepo  LotRepository
	eventBus *events.EventBus
	logger   *slog.Logger
}

func NewLotsService(lotRepo LotRepository, eventBus *events.EventBus) *LotsService {
	return &LotsService{
		lotRepo:  lotRepo,
		eventBus: eventBus,
		logger:   slog.Default(),
	}
}

func (s *LotsService) publishLotChanged(projectID *uuid.UUID, lotID uuid.UUID, operation string) {
	if projectID == nil {
		return
	}
	s.eventBus.Publish(events.Event{
		Type: events.LotChanged,
		Payload: events.LotChangedPayload{
			ProjectID: *projectID,
			LotID:     lotID,
			Operation: operation,
		},
	})
	s.logger.Info("lot_changed_event_published",
		"project_id", *projectID,
		"lot_id", lotID,
		"operation", operation,
	)
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

	s.logger.Info("lot_service_list_started",
		"page", page,
		"limit", limit,
		"offset", offset,
		"sort", sort,
	)

	lots, total, err := s.lotRepo.List(filters, sort, limit, offset)
	if err != nil {
		s.logger.Error("lot_service_list_failed",
			"error", err.Error(),
			"filters", filters,
			"sort", sort,
			"page", page,
			"limit", limit,
		)
		return nil, 0, err
	}

	s.logger.Info("lot_service_list_completed",
		"count", len(lots),
		"total", total,
		"page", page,
		"limit", limit,
	)

	return lots, total, nil
}

func (s *LotsService) GetByID(id uuid.UUID) (*domain.Lot, error) {
	s.logger.Info("lot_service_get_by_id_started",
		"lot_id", id,
	)

	lot, err := s.lotRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lot_service_get_by_id_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get lot: %w", err)
	}
	if lot == nil {
		s.logger.Warn("lot_service_get_by_id_not_found",
			"lot_id", id,
		)
		return nil, ErrLotNotFound
	}

	s.logger.Info("lot_service_get_by_id_completed",
		"lot_id", id,
	)

	return lot, nil
}

func (s *LotsService) Create(lot *domain.Lot) error {
	s.logger.Info("lot_service_create_started",
		"lot_type", lot.Type,
		"project_id", lot.ProjectID,
	)

	err := s.lotRepo.Create(lot)
	if err != nil {
		s.logger.Error("lot_service_create_failed",
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("lot_service_create_completed",
		"lot_id", lot.ID,
		"lot_type", lot.Type,
	)

	s.publishLotChanged(lot.ProjectID, lot.ID, "create")

	return nil
}

func (s *LotsService) Update(id uuid.UUID, updates *domain.Lot) error {
	s.logger.Info("lot_service_update_started",
		"lot_id", id,
	)

	existing, err := s.lotRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lot_service_update_get_existing_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lot_service_update_not_found",
			"lot_id", id,
		)
		return ErrLotNotFound
	}

	oldProjectID := existing.ProjectID

	// Merge updates with existing data (используем подход из вашей версии)
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.ProjectID != nil {
		existing.ProjectID = updates.ProjectID
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
	if updates.PriceFromUs != 0 {
		existing.PriceFromUs = updates.PriceFromUs
	}
	if updates.PriceFromDeveloper != nil {
		existing.PriceFromDeveloper = updates.PriceFromDeveloper
	}
	if updates.ROI != nil {
		existing.ROI = updates.ROI
	}
	if len(updates.BonusKeys) > 0 {
		existing.BonusKeys = updates.BonusKeys
	}
	if updates.BadgeIDs != nil {
		existing.BadgeIDs = updates.BadgeIDs
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

	err = s.lotRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("lot_service_update_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("lot_service_update_completed",
		"lot_id", id,
		"lot_type", existing.Type,
	)

	s.publishLotChanged(existing.ProjectID, id, "update")

	// If project changed, recalculate the old project too
	if updates.ProjectID != nil && oldProjectID != nil && *updates.ProjectID != *oldProjectID {
		s.publishLotChanged(oldProjectID, id, "update")
	}

	return nil
}

func (s *LotsService) Delete(id uuid.UUID) error {
	s.logger.Info("lot_service_delete_started",
		"lot_id", id,
	)

	existing, err := s.lotRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lot_service_delete_get_existing_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lot_service_delete_not_found",
			"lot_id", id,
		)
		return ErrLotNotFound
	}

	err = s.lotRepo.Delete(id)
	if err != nil {
		s.logger.Error("lot_service_delete_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("lot_service_delete_completed",
		"lot_id", id,
		"lot_type", existing.Type,
	)

	s.publishLotChanged(existing.ProjectID, id, "delete")

	return nil
}

func (s *LotsService) ListAll() ([]domain.Lot, error) {
	s.logger.Info("lot_service_list_all_started")

	lots, err := s.lotRepo.ListAll()
	if err != nil {
		s.logger.Error("lot_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("lot_service_list_all_completed",
		"count", len(lots),
	)

	return lots, nil
}

func (s *LotsService) ListDeleted() ([]domain.Lot, error) {
	s.logger.Info("lot_service_list_deleted_started")

	lots, err := s.lotRepo.ListDeleted()
	if err != nil {
		s.logger.Error("lot_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("lot_service_list_deleted_completed",
		"count", len(lots),
	)

	return lots, nil
}

func (s *LotsService) Restore(id uuid.UUID) error {
	s.logger.Info("lot_service_restore_started", "lot_id", id)

	existing, err := s.lotRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("lot_service_restore_get_existing_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lot_service_restore_not_found", "lot_id", id)
		return ErrLotNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("lot_service_restore_not_deleted", "lot_id", id)
		return fmt.Errorf("lot is not deleted")
	}

	err = s.lotRepo.Restore(id)
	if err != nil {
		s.logger.Error("lot_service_restore_failed", "lot_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("lot_service_restore_completed", "lot_id", id)

	s.publishLotChanged(existing.ProjectID, id, "restore")

	return nil
}

func (s *LotsService) HardDelete(id uuid.UUID) error {
	s.logger.Info("lot_service_hard_delete_started", "lot_id", id)

	existing, err := s.lotRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("lot_service_hard_delete_get_existing_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lot: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lot_service_hard_delete_not_found", "lot_id", id)
		return ErrLotNotFound
	}

	err = s.lotRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("lot_service_hard_delete_failed", "lot_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("lot_service_hard_delete_completed", "lot_id", id)

	s.publishLotChanged(existing.ProjectID, id, "hard_delete")

	return nil
}
