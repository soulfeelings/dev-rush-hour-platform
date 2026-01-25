package handlers

import (
	"log/slog"

	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type FiltersHandler struct {
	filtersService *services.FiltersService
	logger         *slog.Logger
}

func NewFiltersHandler(filtersService *services.FiltersService) *FiltersHandler {
	return &FiltersHandler{
		filtersService: filtersService,
		logger:         slog.Default(),
	}
}

func (h *FiltersHandler) GetFilterOptions(c *fiber.Ctx) error {
	h.logger.Info("get_filter_options_started")

	options, err := h.filtersService.GetFilterOptions()
	if err != nil {
		h.logger.Error("get_filter_options_failed",
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

	h.logger.Info("get_filter_options_completed")

	return c.JSON(options)
}

