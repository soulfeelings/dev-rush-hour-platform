package handlers

import (
	"log"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type ProjectsHandler struct {
	projectsService *services.ProjectsService
}

func NewProjectsHandler(projectsService *services.ProjectsService) *ProjectsHandler {
	return &ProjectsHandler{projectsService: projectsService}
}

func (h *ProjectsHandler) ListProjects(c *fiber.Ctx, params generated.ListProjectsParams) error {
	var areaSlug *string
	if params.Area != nil {
		areaSlug = params.Area
	}

	projects, err := h.projectsService.List(areaSlug)
	if err != nil {
		log.Printf("ERROR [ListProjects] failed to list projects: %v", err)
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
			log.Printf("WARNING [ListProjects] mapper returned nil for project %s", projects[i].Slug)
		}
	}

	return c.JSON(result)
}

func (h *ProjectsHandler) GetProject(c *fiber.Ctx, slug string, params generated.GetProjectParams) error {
	includeLots := params.IncludeLots
	project, lots, err := h.projectsService.GetBySlug(slug, includeLots)
	if err != nil {
		log.Printf("ERROR [GetProject] failed to get project by slug %s: %v", slug, err)
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
