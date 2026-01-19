package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type ProjectsService struct {
	projectRepo *repo.ProjectRepo
	lotRepo     *repo.LotRepo
}

func NewProjectsService(projectRepo *repo.ProjectRepo, lotRepo *repo.LotRepo) *ProjectsService {
	return &ProjectsService{
		projectRepo: projectRepo,
		lotRepo:     lotRepo,
	}
}

func (s *ProjectsService) List(areaSlug *string) ([]domain.Project, error) {
	return s.projectRepo.List(areaSlug)
}

func (s *ProjectsService) GetBySlug(slug string, includeLots *int) (*domain.Project, []domain.Lot, error) {
	project, err := s.projectRepo.GetBySlug(slug)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		return nil, nil, ErrProjectNotFound
	}

	var lots []domain.Lot
	if includeLots != nil && *includeLots > 0 {
		limit := *includeLots
		if limit > 50 {
			limit = 50
		}
		lots, err = s.lotRepo.GetByProjectID(project.ID, limit)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to get lots: %w", err)
		}
	}

	return project, lots, nil
}

func (s *ProjectsService) Create(project *domain.Project) error {
	return s.projectRepo.Create(project)
}

func (s *ProjectsService) Update(id uuid.UUID, updates *domain.Project) error {
	existing, err := s.projectRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		return ErrProjectNotFound
	}

	// Merge updates with existing data
	if updates.Slug != "" {
		existing.Slug = updates.Slug
	}
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.Sale != "" {
		existing.Sale = updates.Sale
	}
	if updates.DeveloperID != nil {
		existing.DeveloperID = updates.DeveloperID
	}
	if updates.AreaID != nil {
		existing.AreaID = updates.AreaID
	}
	if updates.Lat != nil {
		existing.Lat = updates.Lat
	}
	if updates.Lng != nil {
		existing.Lng = updates.Lng
	}
	// For Data struct, we'll assume it's always updated if present
	// (can be improved by checking individual fields if needed)
	existing.Data = updates.Data

	return s.projectRepo.Update(id, existing)
}

func (s *ProjectsService) GetByID(id uuid.UUID) (*domain.Project, error) {
	project, err := s.projectRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		return nil, ErrProjectNotFound
	}
	return project, nil
}

func (s *ProjectsService) ListAll() ([]domain.Project, error) {
	return s.projectRepo.ListAll()
}

func (s *ProjectsService) Delete(id uuid.UUID) error {
	existing, err := s.projectRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		return ErrProjectNotFound
	}

	return s.projectRepo.Delete(id)
}
