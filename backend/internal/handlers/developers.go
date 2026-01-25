package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type DevelopersHandler struct {
	developersService *services.DevelopersService
	logger            *slog.Logger
}

func NewDevelopersHandler(developersService *services.DevelopersService) *DevelopersHandler {
	return &DevelopersHandler{
		developersService: developersService,
		logger:            slog.Default(),
	}
}

func (h *DevelopersHandler) ListDevelopers(c *fiber.Ctx) error {
	h.logger.Info("list_developers_started")

	developers, err := h.developersService.List()
	if err != nil {
		h.logger.Error("list_developers_failed",
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

	result := make([]generated.Developer, len(developers))
	for i := range developers {
		gen := mappers.DomainDeveloperToGenerated(&developers[i])
		if gen != nil {
			result[i] = *gen
		}
	}

	h.logger.Info("list_developers_completed",
		"count", len(result),
	)

	return c.JSON(result)
}
