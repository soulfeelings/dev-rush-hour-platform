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

	// Merge with existing data
	if project.Slug == "" {
		project.Slug = existing.Slug
	}
	if project.Name == "" {
		project.Name = existing.Name
	}
	if project.Status == "" {
		project.Status = existing.Status
	}
	if project.Sale == "" {
		project.Sale = existing.Sale
	}
	if project.DeveloperID == nil {
		project.DeveloperID = existing.DeveloperID
	}
	if project.AreaID == nil {
		project.AreaID = existing.AreaID
	}
	if project.Lat == nil {
		project.Lat = existing.Lat
	}
	if project.Lng == nil {
		project.Lng = existing.Lng
	}

	// Merge Data fields
	if project.Data.Description == nil {
		project.Data.Description = existing.Data.Description
	}
	if project.Data.Specs == nil {
		project.Data.Specs = existing.Data.Specs
	}
	if project.Data.FeaturesAmenities == nil {
		project.Data.FeaturesAmenities = existing.Data.FeaturesAmenities
	}
	// Merge Media fields if Media was provided
	if project.Data.Media != nil && existing.Data.Media != nil {
		if project.Data.Media.Cover == nil {
			project.Data.Media.Cover = existing.Data.Media.Cover
		}
		if project.Data.Media.Gallery == nil || len(project.Data.Media.Gallery) == 0 {
			project.Data.Media.Gallery = existing.Data.Media.Gallery
		}
	} else if project.Data.Media == nil {
		project.Data.Media = existing.Data.Media
	}
	if project.Data.Tags == nil {
		project.Data.Tags = existing.Data.Tags
	}
	if !project.Data.IsRecommended && !project.Data.IsFeatured {
		project.Data.IsRecommended = existing.Data.IsRecommended
		project.Data.IsFeatured = existing.Data.IsFeatured
	}

	return s.projectRepo.Update(id, project)
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
