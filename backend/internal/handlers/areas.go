package handlers

import (
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AreasHandler struct {
	areasService *services.AreasService
}

func NewAreasHandler(areasService *services.AreasService) *AreasHandler {
	return &AreasHandler{areasService: areasService}
}

func (h *AreasHandler) ListAreas(c *fiber.Ctx, params generated.ListAreasParams) error {
	includeBoundary := params.Include != nil && *params.Include == generated.Boundary

	areas, err := h.areasService.List(includeBoundary)
	if err != nil {
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

	result := make([]generated.Area, len(areas))
	for i := range areas {
		gen := mappers.DomainAreaToGenerated(&areas[i])
		if gen != nil {
			result[i] = *gen
		}
	}

	return c.JSON(result)
}

func (h *AreasHandler) GetArea(c *fiber.Ctx, slug string) error {
	area, err := h.areasService.GetBySlug(slug)
	if err != nil {
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

	return c.JSON(mappers.DomainAreaToGenerated(area))
}
