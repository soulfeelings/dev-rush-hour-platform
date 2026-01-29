package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type ProjectsHandler struct {
	projectsService *services.ProjectsService
	logger          *slog.Logger
}

func NewProjectsHandler(projectsService *services.ProjectsService) *ProjectsHandler {
	return &ProjectsHandler{
		projectsService: projectsService,
		logger:          slog.Default(),
	}
}

func (h *ProjectsHandler) ListProjects(c *fiber.Ctx, params generated.ListProjectsParams) error {
	// Build filters from params
	filters := domain.ProjectFilters{
		AreaSlug:      params.Area,
		DeveloperSlug: params.Developer,
		Bedrooms:      params.Bedrooms,
	}

	// Convert float32 to float64 for price filters
	if params.PriceMin != nil {
		priceMin := float64(*params.PriceMin)
		filters.PriceMin = &priceMin
	}
	if params.PriceMax != nil {
		priceMax := float64(*params.PriceMax)
		filters.PriceMax = &priceMax
	}

	// Parse sort parameter
	sort := domain.ProjectSortNameAsc // default
	if params.Sort != nil {
		switch *params.Sort {
		case generated.ListProjectsParamsSortPriceAsc:
			sort = domain.ProjectSortPriceAsc
		case generated.ListProjectsParamsSortPriceDesc:
			sort = domain.ProjectSortPriceDesc
		case generated.ListProjectsParamsSortNewest:
			sort = domain.ProjectSortNewest
		case generated.ListProjectsParamsSortNameAsc:
			sort = domain.ProjectSortNameAsc
		}
	}

	projects, err := h.projectsService.List(filters, sort)
	if err != nil {
		h.logger.Error("list_projects_failed",
			"filters", filters,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(generated.InternalError{
			Error: &struct {
				Code    *string              `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string              `json:"message,omitempty"`
			}{
				Code:    stringPtr("internal_error"),
				Message: stringPtr(err.Error()),
			},
		})
	}

	result := make([]generated.Project, len(projects))
		for i := range projects {
			gen := mappers.DomainProjectToGenerated(&projects[i])
			if gen != nil {
				result[i] = *gen
			} else {
				h.logger.Warn("list_projects_mapper_nil",
					"project_slug", projects[i].Slug,
				)
			}
		}

	return c.JSON(result)
}

func (h *ProjectsHandler) GetProject(c *fiber.Ctx, slug string, params generated.GetProjectParams) error {
	includeLots := params.IncludeLots
	project, lots, err := h.projectsService.GetBySlug(slug, includeLots)
	if err != nil {
		h.logger.Error("get_project_failed",
			"project_slug", slug,
			"include_lots", includeLots,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusNotFound).JSON(generated.NotFound{
			Error: &struct {
				Code    *string              `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string              `json:"message,omitempty"`
			}{
				Code:    stringPtr("not_found"),
				Message: stringPtr(err.Error()),
			},
		})
	}

	result := mappers.DomainProjectToGenerated(project)
	if result != nil && includeLots != nil && *includeLots > 0 && len(lots) > 0 {
		generatedLots := make([]generated.Lot, len(lots))
		for i := range lots {
			generatedLots[i] = *mappers.DomainLotToGenerated(&lots[i])
		}
		result.Lots = &generatedLots
	}

	return c.JSON(result)
}
