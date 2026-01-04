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
		return nil, nil, fmt.Errorf("project not found")
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

func (s *ProjectsService) Update(id uuid.UUID, project *domain.Project) error {
	existing, err := s.projectRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("project not found")
	}

	return s.projectRepo.Update(id, project)
}

func (s *ProjectsService) GetByID(id uuid.UUID) (*domain.Project, error) {
	project, err := s.projectRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}
	return project, nil
}

func (s *ProjectsService) ListAll() ([]domain.Project, error) {
	return s.projectRepo.ListAll()
}

