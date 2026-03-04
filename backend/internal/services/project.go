package services

import (
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

type ProjectsService struct {
	projectRepo        *repo.ProjectRepo
	lotRepo            *repo.LotRepo
	badgeRepo          *repo.BadgeRepo
	infrastructureRepo *repo.InfrastructureRepo
	logger             *slog.Logger
}

func NewProjectsService(projectRepo *repo.ProjectRepo, lotRepo *repo.LotRepo, badgeRepo *repo.BadgeRepo, infrastructureRepo *repo.InfrastructureRepo) *ProjectsService {
	return &ProjectsService{
		projectRepo:        projectRepo,
		lotRepo:            lotRepo,
		badgeRepo:          badgeRepo,
		infrastructureRepo: infrastructureRepo,
		logger:             slog.Default(),
	}
}

func (s *ProjectsService) List(filters domain.ProjectFilters, sort domain.ProjectSort) ([]domain.Project, error) {
	s.logger.Info("project_service_list_started",
		"filters", filters,
		"sort", sort,
	)

	projects, err := s.projectRepo.List(filters, sort)
	if err != nil {
		s.logger.Error("project_service_list_failed",
			"filters", filters,
			"error", err.Error(),
		)
		return nil, err
	}

	for i := range projects {
		if badges, err := s.badgeRepo.GetProjectBadges(projects[i].ID); err != nil {
			s.logger.Warn("project_service_list_get_badges_failed",
				"project_id", projects[i].ID,
				"error", err.Error(),
			)
		} else {
			projects[i].Badges = badges
		}

		if infras, err := s.infrastructureRepo.GetProjectInfrastructures(projects[i].ID); err != nil {
			s.logger.Warn("project_service_list_get_infrastructures_failed",
				"project_id", projects[i].ID,
				"error", err.Error(),
			)
		} else {
			projects[i].Infrastructures = infras
		}
	}

	s.logger.Info("project_service_list_completed",
		"count", len(projects),
		"filters", filters,
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

	if badges, err := s.badgeRepo.GetProjectBadges(project.ID); err != nil {
		s.logger.Warn("project_service_get_by_slug_get_badges_failed",
			"project_id", project.ID,
			"error", err.Error(),
		)
	} else {
		project.Badges = badges
	}

	if infras, err := s.infrastructureRepo.GetProjectInfrastructures(project.ID); err != nil {
		s.logger.Warn("project_service_get_by_slug_get_infrastructures_failed",
			"project_id", project.ID,
			"error", err.Error(),
		)
	} else {
		project.Infrastructures = infras
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

	if len(project.BadgeIDs) > 0 {
		if err := s.badgeRepo.SetProjectBadges(project.ID, project.BadgeIDs); err != nil {
			s.logger.Warn("project_service_create_set_badges_failed",
				"project_id", project.ID,
				"error", err.Error(),
			)
		}
	}

	if len(project.InfrastructureIDs) > 0 {
		if err := s.infrastructureRepo.SetProjectInfrastructures(project.ID, project.InfrastructureIDs); err != nil {
			s.logger.Warn("project_service_create_set_infrastructures_failed",
				"project_id", project.ID,
				"error", err.Error(),
			)
		}
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
	// Merge flat data fields
	if updates.Description != nil {
		existing.Description = updates.Description
	}
	if updates.FeaturesAmenities != nil {
		existing.FeaturesAmenities = updates.FeaturesAmenities
	}
	if updates.Media != nil {
		// Merge media fields
		if existing.Media == nil {
			existing.Media = updates.Media
		} else {
			if updates.Media.Cover != nil {
				existing.Media.Cover = updates.Media.Cover
			}
			if updates.Media.Hover != nil {
				existing.Media.Hover = updates.Media.Hover
			}
			if updates.Media.Logo != nil {
				existing.Media.Logo = updates.Media.Logo
			}
			if updates.Media.Gallery != nil {
				existing.Media.Gallery = updates.Media.Gallery
			}
		}
	}
	if updates.YoutubeURL != "" {
		existing.YoutubeURL = updates.YoutubeURL
	}
	if updates.GoogleMapsURL != "" {
		existing.GoogleMapsURL = updates.GoogleMapsURL
	}
	if updates.Timeline != nil {
		existing.Timeline = updates.Timeline
	}
	// Boolean fields - always take from updates
	existing.IsFeatured = updates.IsFeatured
	if updates.Tags != nil {
		existing.Tags = updates.Tags
	}
	// Merge pricing fields
	if updates.ROI != nil {
		existing.ROI = updates.ROI
	}
	if updates.PriceFromUs != nil {
		existing.PriceFromUs = updates.PriceFromUs
	}
	if updates.PriceFromDeveloper != nil {
		existing.PriceFromDeveloper = updates.PriceFromDeveloper
	}
	if updates.PaymentPlan != "" {
		existing.PaymentPlan = updates.PaymentPlan
	}
	if updates.CompletionDate != "" {
		existing.CompletionDate = updates.CompletionDate
	}
	// Merge specs fields
	if updates.Currency != "" {
		existing.Currency = updates.Currency
	}
	if updates.PropertyTypes != nil {
		existing.PropertyTypes = updates.PropertyTypes
	}
	if updates.Bedrooms != nil {
		existing.Bedrooms = updates.Bedrooms
	}
	if updates.AreaSize != nil {
		existing.AreaSize = updates.AreaSize
	}
	if updates.AreaUnit != "" {
		existing.AreaUnit = updates.AreaUnit
	}
	if updates.PricesByType != nil {
		existing.PricesByType = updates.PricesByType
	}

	err = s.projectRepo.Update(id, existing)
	if err != nil {
		s.logger.Error("project_service_update_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	// Update badges/infrastructures only if explicitly provided (nil means "no change")
	if updates.BadgeIDs != nil {
		if err := s.badgeRepo.SetProjectBadges(id, updates.BadgeIDs); err != nil {
			s.logger.Warn("project_service_update_set_badges_failed",
				"project_id", id,
				"error", err.Error(),
			)
		}
	}

	if updates.InfrastructureIDs != nil {
		if err := s.infrastructureRepo.SetProjectInfrastructures(id, updates.InfrastructureIDs); err != nil {
			s.logger.Warn("project_service_update_set_infrastructures_failed",
				"project_id", id,
				"error", err.Error(),
			)
		}
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

	if badges, err := s.badgeRepo.GetProjectBadges(project.ID); err == nil {
		project.Badges = badges
	}
	if infras, err := s.infrastructureRepo.GetProjectInfrastructures(project.ID); err == nil {
		project.Infrastructures = infras
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

	for i := range projects {
		if badges, err := s.badgeRepo.GetProjectBadges(projects[i].ID); err == nil {
			projects[i].Badges = badges
		}
		if infras, err := s.infrastructureRepo.GetProjectInfrastructures(projects[i].ID); err == nil {
			projects[i].Infrastructures = infras
		}
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

func (s *ProjectsService) ListDeleted() ([]domain.Project, error) {
	s.logger.Info("project_service_list_deleted_started")

	projects, err := s.projectRepo.ListDeleted()
	if err != nil {
		s.logger.Error("project_service_list_deleted_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	s.logger.Info("project_service_list_deleted_completed",
		"count", len(projects),
	)

	return projects, nil
}

func (s *ProjectsService) Restore(id uuid.UUID) error {
	s.logger.Info("project_service_restore_started", "project_id", id)

	existing, err := s.projectRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("project_service_restore_get_existing_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		s.logger.Warn("project_service_restore_not_found", "project_id", id)
		return ErrProjectNotFound
	}
	if existing.DeletedAt == nil {
		s.logger.Warn("project_service_restore_not_deleted", "project_id", id)
		return fmt.Errorf("project is not deleted")
	}

	err = s.projectRepo.Restore(id)
	if err != nil {
		s.logger.Error("project_service_restore_failed", "project_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("project_service_restore_completed", "project_id", id)
	return nil
}

func (s *ProjectsService) HardDelete(id uuid.UUID) error {
	s.logger.Info("project_service_hard_delete_started", "project_id", id)

	existing, err := s.projectRepo.GetByIDWithDeleted(id)
	if err != nil {
		s.logger.Error("project_service_hard_delete_get_existing_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get project: %w", err)
	}
	if existing == nil {
		s.logger.Warn("project_service_hard_delete_not_found", "project_id", id)
		return ErrProjectNotFound
	}

	err = s.projectRepo.HardDelete(id)
	if err != nil {
		s.logger.Error("project_service_hard_delete_failed", "project_id", id, "error", err.Error())
		return err
	}

	s.logger.Info("project_service_hard_delete_completed", "project_id", id)
	return nil
}
