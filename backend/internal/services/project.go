package services

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
)

type ProjectsService struct {
	projectRepo *repo.ProjectRepo
}

func NewProjectsService(projectRepo *repo.ProjectRepo) *ProjectsService {
	return &ProjectsService{projectRepo: projectRepo}
}

func (s *ProjectsService) List(areaSlug *string) ([]domain.Project, error) {
	return s.projectRepo.List(areaSlug)
}

func (s *ProjectsService) GetBySlug(slug string) (*domain.Project, error) {
	project, err := s.projectRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}
	return project, nil
}

