package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type DevelopersService struct {
	developerRepo *repo.DeveloperRepo
}

func NewDevelopersService(developerRepo *repo.DeveloperRepo) *DevelopersService {
	return &DevelopersService{developerRepo: developerRepo}
}

func (s *DevelopersService) Create(dev *domain.Developer) error {
	return s.developerRepo.Create(dev)
}

func (s *DevelopersService) Update(id uuid.UUID, dev *domain.Developer) error {
	existing, err := s.developerRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get developer: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("developer not found")
	}

	return s.developerRepo.Update(id, dev)
}

func (s *DevelopersService) GetByID(id uuid.UUID) (*domain.Developer, error) {
	dev, err := s.developerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get developer: %w", err)
	}
	if dev == nil {
		return nil, fmt.Errorf("developer not found")
	}
	return dev, nil
}

func (s *DevelopersService) List() ([]domain.Developer, error) {
	return s.developerRepo.List()
}

