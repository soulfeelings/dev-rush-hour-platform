package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type ProjectsService struct {
	projectRepo *repo.ProjectRepo
	lotRepo     *repo.LotRepo
	badgeRepo   *repo.BadgeRepo
	logger      *slog.Logger
}

func NewProjectsService(projectRepo *repo.ProjectRepo, lotRepo *repo.LotRepo, badgeRepo *repo.BadgeRepo) *ProjectsService {
	return &ProjectsService{
		projectRepo: projectRepo,
		lotRepo:     lotRepo,
		badgeRepo:   badgeRepo,
		logger:      slog.Default(),
	}
}

func (s *ProjectsService) List(areaSlug *string) ([]domain.Project, error) {
	s.logger.Info("project_service_list_started",
		"area_slug", areaSlug,
	)

	projects, err := s.projectRepo.List(areaSlug)
	if err != nil {
		s.logger.Error("project_service_list_failed",
			"area_slug", areaSlug,
			"error", err.Error(),
		)
		return nil, err
	}

	// Fetch badges for each project
	if s.badgeRepo != nil {
		for i := range projects {
			badges, err := s.badgeRepo.GetProjectBadges(projects[i].ID)
			if err != nil {
				s.logger.Warn("project_service_list_get_badges_failed",
					"project_id", projects[i].ID,
					"error", err.Error(),
				)
				// Continue without badges on error
				continue
			}
			projects[i].Badges = badges
		}
	}

	s.logger.Info("project_service_list_completed",
		"count", len(projects),
		"area_slug", areaSlug,
	)

	return projects, nil
}

func (s *ProjectsService) GetBySlug(slug string, includeLots *int) (*domain.Project, []domain.Lot, error) {
	s.logger.Info("project_service_get_by_slug_started",
		"slug", slug,
		"include_lots", includeLots,
	)

	project, err := s.projectRepo.GetBySlug(slug)
	if err != nil {
		s.logger.Error("project_service_get_by_slug_failed",
			"slug", slug,
			"error", err.Error(),
		)
		return nil, nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		s.logger.Warn("project_service_get_by_slug_not_found",
			"slug", slug,
		)
		return nil, nil, ErrProjectNotFound
	}

	// Fetch badges for the project
	if s.badgeRepo != nil {
		badges, err := s.badgeRepo.GetProjectBadges(project.ID)
		if err != nil {
			s.logger.Warn("project_service_get_by_slug_get_badges_failed",
				"slug", slug,
				"project_id", project.ID,
				"error", err.Error(),
			)
			// Continue without badges on error
		} else {
			project.Badges = badges
		}
	}

	var lots []domain.Lot
	if includeLots != nil && *includeLots > 0 {
		limit := *includeLots
		if limit > 50 {
			limit = 50
		}
		lots, err = s.lotRepo.GetByProjectID(project.ID, limit)
		if err != nil {
			s.logger.Error("project_service_get_by_slug_get_lots_failed",
				"slug", slug,
				"project_id", project.ID,
				"limit", limit,
				"error", err.Error(),
			)
			return nil, nil, fmt.Errorf("failed to get lots: %w", err)
		}
	}

	s.logger.Info("project_service_get_by_slug_completed",
		"slug", slug,
		"project_id", project.ID,
		"lots_count", len(lots),
	)

	return project, lots, nil
}

func (s *ProjectsService) Create(project *domain.Project) error {
	s.logger.Info("project_service_create_started",
		"project_slug", project.Slug,
		"project_name", project.Name,
		"developer_id", project.DeveloperID,
	)

	err := s.projectRepo.Create(project)
	if err != nil {
		s.logger.Error("project_service_create_failed",
			"project_slug", project.Slug,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("project_service_create_completed",
		"project_id", project.ID,
		"project_slug", project.Slug,
	)

	return nil
}

func (s *ProjectsService) Update(id uuid.UUID, updates *domain.Project) error {
	s.logger.Info("project_service_update_started",
		"project_id", id,
	)

	existing, err := s.projectRepo.GetByID(id)
	if err != nil {
		s.logger.Error("project_service_update_get_existing_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		s.logger.Warn("project_service_update_not_found",
			"project_id", id,
		)
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

	err = s.projectRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("project_service_update_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("project_service_update_completed",
		"project_id", id,
		"project_slug", existing.Slug,
	)

	return nil
}

func (s *ProjectsService) GetByID(id uuid.UUID) (*domain.Project, error) {
	s.logger.Info("project_service_get_by_id_started",
		"project_id", id,
	)

	project, err := s.projectRepo.GetByID(id)
	if err != nil {
		s.logger.Error("project_service_get_by_id_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		s.logger.Warn("project_service_get_by_id_not_found",
			"project_id", id,
		)
		return nil, ErrProjectNotFound
	}

	s.logger.Info("project_service_get_by_id_completed",
		"project_id", id,
		"project_slug", project.Slug,
	)

	return project, nil
}

func (s *ProjectsService) ListAll() ([]domain.Project, error) {
	s.logger.Info("project_service_list_all_started")

	projects, err := s.projectRepo.ListAll()
	if err != nil {
		s.logger.Error("project_service_list_all_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("project_service_list_all_completed",
		"count", len(projects),
	)

	return projects, nil
}

func (s *ProjectsService) Delete(id uuid.UUID) error {
	s.logger.Info("project_service_delete_started",
		"project_id", id,
	)

	existing, err := s.projectRepo.GetByID(id)
	if err != nil {
		s.logger.Error("project_service_delete_get_existing_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		s.logger.Warn("project_service_delete_not_found",
			"project_id", id,
		)
		return ErrProjectNotFound
	}

	err = s.projectRepo.Delete(id)
	if err != nil {
		s.logger.Error("project_service_delete_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	s.logger.Info("project_service_delete_completed",
		"project_id", id,
		"project_slug", existing.Slug,
	)

	return nil
}
