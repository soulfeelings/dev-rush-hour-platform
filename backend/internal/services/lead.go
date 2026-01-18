package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type LeadsService struct {
	leadRepo *repo.LeadRepo
}

func NewLeadsService(leadRepo *repo.LeadRepo) *LeadsService {
	return &LeadsService{leadRepo: leadRepo}
}

func (s *LeadsService) Create(lead *domain.Lead) error {
	if err := s.leadRepo.Create(lead); err != nil {
		return fmt.Errorf("failed to create lead: %w", err)
	}
	return nil
}

func (s *LeadsService) List(status *domain.LeadStatus) ([]domain.Lead, error) {
	return s.leadRepo.List(status)
}

func (s *LeadsService) GetByID(id uuid.UUID) (*domain.Lead, error) {
	lead, err := s.leadRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get lead: %w", err)
	}
	if lead == nil {
		return nil, ErrLeadNotFound
	}
	return lead, nil
}

func (s *LeadsService) Update(id uuid.UUID, updates *domain.Lead) error {
	existing, err := s.leadRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get lead: %w", err)
	}
	if existing == nil {
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

	return s.leadRepo.Update(id, existing)
}

func (s *LeadsService) Delete(id uuid.UUID) error {
	existing, err := s.leadRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get lead: %w", err)
	}
	if existing == nil {
		return ErrLeadNotFound
	}

	return s.leadRepo.Delete(id)
}