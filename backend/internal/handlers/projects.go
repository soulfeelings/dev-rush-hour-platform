package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"
	"strconv"
	"strings"

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

// parseBedroomsParam parses comma-separated bedroom values (e.g., "1,2,3" or "studio,1,2")
func parseBedroomsParam(bedroomsStr *string) []int {
	if bedroomsStr == nil || *bedroomsStr == "" {
		return nil
	}

	parts := strings.Split(*bedroomsStr, ",")
	result := make([]int, 0, len(parts))

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Handle "studio" as 0 bedrooms
		if strings.ToLower(part) == "studio" {
			result = append(result, 0)
			continue
		}

		// Handle "7+" as 7
		if part == "7+" {
			result = append(result, 7)
			continue
		}

		// Parse numeric value
		if num, err := strconv.Atoi(part); err == nil && num >= 0 {
			result = append(result, num)
		}
	}

	return result
}

// parseBathroomsParam parses comma-separated bathroom values (e.g., "1,2,3")
func parseBathroomsParam(bathroomsStr *string) []int {
	if bathroomsStr == nil || *bathroomsStr == "" {
		return nil
	}

	parts := strings.Split(*bathroomsStr, ",")
	result := make([]int, 0, len(parts))

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Handle "7+" as 7
		if part == "7+" {
			result = append(result, 7)
			continue
		}

		// Parse numeric value
		if num, err := strconv.Atoi(part); err == nil && num >= 0 {
			result = append(result, num)
		}
	}

	return result
}

func (h *ProjectsHandler) ListProjects(c *fiber.Ctx, params generated.ListProjectsParams) error {
	// Build filters from params
	filters := domain.ProjectFilters{
		CitySlug:      params.City,
		AreaSlug:      params.Area,
		DeveloperSlug: params.Developer,
		Bedrooms:      parseBedroomsParam(params.Bedrooms),
		Bathrooms:     parseBathroomsParam(params.Bathrooms),
		Search:        params.Search,
	}

	// Convert status enum to string
	if params.Status != nil {
		status := string(*params.Status)
		filters.Status = &status
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

	if params.Featured != nil {
		filters.Featured = params.Featured
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
