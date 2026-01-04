package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
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

