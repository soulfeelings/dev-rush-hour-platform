package handlers

import (
	"log/slog"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type LeadsHandler struct {
	leadsService *services.LeadsService
	validator    *validator.Validate
	logger       *slog.Logger
}

func NewLeadsHandler(leadsService *services.LeadsService) *LeadsHandler {
	return &LeadsHandler{
		leadsService: leadsService,
		validator:    validator.New(),
		logger:       slog.Default(),
	}
}

func (h *LeadsHandler) CreateLead(c *fiber.Ctx) error {
	h.logger.Info("create_lead_started")

	var req generated.LeadCreateRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Error("create_lead_parse_error",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string              `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string              `json:"message,omitempty"`
			}{
				Code:    stringPtr("invalid_request"),
				Message: stringPtr("invalid request body"),
			},
		})
	}

	if err := h.validator.Struct(&req); err != nil {
		h.logger.Error("create_lead_validation_error",
			"error", err.Error(),
		)
		errors := make(map[string]interface{})
		for _, err := range err.(validator.ValidationErrors) {
			errors[err.Field()] = err.Tag()
		}
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string              `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string              `json:"message,omitempty"`
			}{
				Code:    stringPtr("validation_error"),
				Message: stringPtr("validation failed"),
			},
		})
	}

	lead, err := mappers.GeneratedLeadToDomain(&req)
	if err != nil {
		h.logger.Error("create_lead_mapping_error",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string              `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string              `json:"message,omitempty"`
			}{
				Code:    stringPtr("invalid_request"),
				Message: stringPtr("invalid id format"),
			},
		})
	}

	if err := h.leadsService.Create(lead); err != nil {
		h.logger.Error("create_lead_failed",
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

	h.logger.Info("create_lead_completed",
		"lead_id", lead.ID,
	)

	return c.Status(fiber.StatusCreated).JSON(mappers.DomainLeadToGenerated(lead))
}
