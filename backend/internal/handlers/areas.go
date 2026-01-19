package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AreasHandler struct {
	areasService *services.AreasService
	logger       *slog.Logger
}

func NewAreasHandler(areasService *services.AreasService) *AreasHandler {
	return &AreasHandler{
		areasService: areasService,
		logger:       slog.Default(),
	}
}

func (h *AreasHandler) ListAreas(c *fiber.Ctx, params generated.ListAreasParams) error {
	includeBoundary := params.Include != nil && *params.Include == generated.Boundary

	h.logger.Info("list_areas_started",
		"include_boundary", includeBoundary,
	)

	areas, err := h.areasService.List(includeBoundary)
	if err != nil {
		h.logger.Error("list_areas_failed",
			"include_boundary", includeBoundary,
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

	result := make([]generated.Area, len(areas))
	for i := range areas {
		gen := mappers.DomainAreaToGenerated(&areas[i])
		if gen != nil {
			result[i] = *gen
		}
	}

	h.logger.Info("list_areas_completed",
		"count", len(result),
	)

	return c.JSON(result)
}

func (h *AreasHandler) GetArea(c *fiber.Ctx, slug string) error {
	h.logger.Info("get_area_started",
		"area_slug", slug,
	)

	area, err := h.areasService.GetBySlug(slug)
	if err != nil {
		h.logger.Error("get_area_failed",
			"area_slug", slug,
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

	h.logger.Info("get_area_completed",
		"area_slug", slug,
	)

	return c.JSON(mappers.DomainAreaToGenerated(area))
}
