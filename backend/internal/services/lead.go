package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type LeadsService struct {
	leadRepo *repo.LeadRepo
	logger   *slog.Logger
}

func NewLeadsService(leadRepo *repo.LeadRepo) *LeadsService {
	return &LeadsService{
		leadRepo: leadRepo,
		logger:   slog.Default(),
	}
}

func (s *LeadsService) Create(lead *domain.Lead) error {
	s.logger.Info("lead_service_create_started",
		"lead_name", lead.Name,
		"lead_phone", lead.Phone,
		"lead_type", lead.Type,
	)

	if err := s.leadRepo.Create(lead); err != nil {
		s.logger.Error("lead_service_create_failed",
			"lead_name", lead.Name,
			"lead_phone", lead.Phone,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to create lead: %w", err)
	}

	s.logger.Info("lead_service_create_completed",
		"lead_id", lead.ID,
		"lead_name", lead.Name,
	)

	return nil
}

func (s *LeadsService) List(status *domain.LeadStatus) ([]domain.Lead, error) {
	s.logger.Info("lead_service_list_started",
		"status_filter", status,
	)

	leads, err := s.leadRepo.List(status)
	if err != nil {
		s.logger.Error("lead_service_list_failed",
			"status_filter", status,
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("lead_service_list_completed",
		"leads_count", len(leads),
		"status_filter", status,
	)

	return leads, nil
}

func (s *LeadsService) GetByID(id uuid.UUID) (*domain.Lead, error) {
	s.logger.Info("lead_service_get_by_id_started",
		"lead_id", id,
	)

	lead, err := s.leadRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lead_service_get_by_id_failed",
			"lead_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get lead: %w", err)
	}
	if lead == nil {
		s.logger.Warn("lead_service_get_by_id_not_found",
			"lead_id", id,
		)
		return nil, ErrLeadNotFound
	}

	s.logger.Info("lead_service_get_by_id_completed",
		"lead_id", id,
		"lead_name", lead.Name,
		"lead_status", lead.Status,
	)

	return lead, nil
}

func (s *LeadsService) Update(id uuid.UUID, updates *domain.Lead) error {
	s.logger.Info("lead_service_update_started",
		"lead_id", id,
		"updates", updates,
	)

	existing, err := s.leadRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lead_service_update_get_existing_failed",
			"lead_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lead: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lead_service_update_not_found",
			"lead_id", id,
		)
		return ErrLeadNotFound
	}

	// Merge updates with existing data
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.Type != "" {
		existing.Type = updates.Type
	}
	if updates.Source != nil {
		existing.Source = updates.Source
	}
	if updates.ProjectID != nil {
		existing.ProjectID = updates.ProjectID
	}
	if updates.LotID != nil {
		existing.LotID = updates.LotID
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Phone != "" {
		existing.Phone = updates.Phone
	}
	if updates.Email != nil {
		existing.Email = updates.Email
	}
	if updates.Data.Preferred != nil || updates.Data.Comment != nil || updates.Data.PageURL != nil || len(updates.Data.UTM) > 0 {
		existing.Data = updates.Data
	}

	if err := s.leadRepo.Update(id, existing); err != nil {
		s.logger.Error("lead_service_update_failed",
			"lead_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("lead_service_update_completed",
		"lead_id", id,
		"new_status", existing.Status,
	)

	return nil
}

func (s *LeadsService) Delete(id uuid.UUID) error {
	s.logger.Info("lead_service_delete_started",
		"lead_id", id,
	)

	existing, err := s.leadRepo.GetByID(id)
	if err != nil {
		s.logger.Error("lead_service_delete_get_existing_failed",
			"lead_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get lead: %w", err)
	}
	if existing == nil {
		s.logger.Warn("lead_service_delete_not_found",
			"lead_id", id,
		)
		return ErrLeadNotFound
	}

	if err := s.leadRepo.Delete(id); err != nil {
		s.logger.Error("lead_service_delete_failed",
			"lead_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("lead_service_delete_completed",
		"lead_id", id,
		"lead_name", existing.Name,
	)

	return nil
}