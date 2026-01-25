package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type CitiesHandler struct {
	citiesService *services.CitiesService
	logger        *slog.Logger
}

func NewCitiesHandler(citiesService *services.CitiesService) *CitiesHandler {
	return &CitiesHandler{
		citiesService: citiesService,
		logger:        slog.Default(),
	}
}

func (h *CitiesHandler) ListCities(c *fiber.Ctx) error {
	h.logger.Info("list_cities_started")

	cities, err := h.citiesService.List()
	if err != nil {
		h.logger.Error("list_cities_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(generated.InternalError{
			Error: &struct {
				Code    *string                        `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string                        `json:"message,omitempty"`
			}{
				Code:    stringPtr("internal_error"),
				Message: stringPtr(err.Error()),
			},
		})
	}

	result := make([]generated.City, len(cities))
	for i := range cities {
		gen := mappers.DomainCityToGenerated(&cities[i])
		if gen != nil {
			result[i] = *gen
		}
	}

	h.logger.Info("list_cities_completed",
		"count", len(result),
	)

	return c.JSON(result)
}
