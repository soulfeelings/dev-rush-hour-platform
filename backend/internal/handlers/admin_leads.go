package handlers

import (
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type AdminLeadsHandler struct {
	leadsService *services.LeadsService
	logger       *slog.Logger
}

func NewAdminLeadsHandler(leadsService *services.LeadsService) *AdminLeadsHandler {
	return &AdminLeadsHandler{
		leadsService: leadsService,
		logger:       slog.Default(),
	}
}

func (h *AdminLeadsHandler) ListLeads(c *fiber.Ctx, params generated.AdminListLeadsParams) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_list_leads_started",
		"request_id", requestID,
		"status_filter", params.Status,
	)

	var status *domain.LeadStatus
	if params.Status != nil {
		s := domain.LeadStatus(*params.Status)
		status = &s
	}

	leads, err := h.leadsService.List(status)
	if err != nil {
		h.logger.Error("admin_list_leads_failed",
			"request_id", requestID,
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

	h.logger.Info("admin_list_leads_completed",
		"request_id", requestID,
		"leads_count", len(leads),
	)

	result := make([]generated.Lead, len(leads))
	for i := range leads {
		result[i] = *mappers.DomainLeadToGenerated(&leads[i])
	}

	return c.JSON(result)
}

func (h *AdminLeadsHandler) UpdateLead(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_update_lead_started",
		"request_id", requestID,
		"lead_id", id,
	)

	var req generated.LeadUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Error("admin_update_lead_parse_error",
			"request_id", requestID,
			"lead_id", id,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string                        `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string                        `json:"message,omitempty"`
			}{
				Code:    stringPtr("invalid_request"),
				Message: stringPtr("invalid request body"),
			},
		})
	}

	lead, err := mappers.GeneratedLeadUpdateToDomain(&req)
	if err != nil {
		h.logger.Error("admin_update_lead_mapping_error",
			"request_id", requestID,
			"lead_id", id,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string                        `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string                        `json:"message,omitempty"`
			}{
				Code:    stringPtr("invalid_request"),
				Message: stringPtr(err.Error()),
			},
		})
	}

	if err := h.leadsService.Update(uuid.UUID(id), lead); err != nil {
		if err.Error() == "lead not found" {
			h.logger.Warn("admin_update_lead_not_found",
				"request_id", requestID,
				"lead_id", id,
			)
			return c.Status(fiber.StatusNotFound).JSON(generated.NotFound{
				Error: &struct {
					Code    *string                        `json:"code,omitempty"`
					Details *generated.Error_Error_Details `json:"details,omitempty"`
					Message *string                        `json:"message,omitempty"`
				}{
					Code:    stringPtr("not_found"),
					Message: stringPtr(err.Error()),
				},
			})
		}
		h.logger.Error("admin_update_lead_failed",
			"request_id", requestID,
			"lead_id", id,
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

	updated, err := h.leadsService.GetByID(uuid.UUID(id))
	if err != nil {
		h.logger.Error("admin_update_lead_get_updated_failed",
			"request_id", requestID,
			"lead_id", id,
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

	h.logger.Info("admin_update_lead_completed",
		"request_id", requestID,
		"lead_id", id,
		"lead_status", updated.Status,
	)

	return c.JSON(mappers.DomainLeadToGenerated(updated))
}

func (h *AdminLeadsHandler) GetLead(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_get_lead_started",
		"request_id", requestID,
		"lead_id", id,
	)

	lead, err := h.leadsService.GetByID(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLeadNotFound) {
			h.logger.Warn("admin_get_lead_not_found",
				"request_id", requestID,
				"lead_id", id,
			)
			return c.Status(fiber.StatusNotFound).JSON(generated.NotFound{
				Error: &struct {
					Code    *string                        `json:"code,omitempty"`
					Details *generated.Error_Error_Details `json:"details,omitempty"`
					Message *string                        `json:"message,omitempty"`
				}{
					Code:    stringPtr("not_found"),
					Message: stringPtr(err.Error()),
				},
			})
		}
		h.logger.Error("admin_get_lead_failed",
			"request_id", requestID,
			"lead_id", id,
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

	h.logger.Info("admin_get_lead_completed",
		"request_id", requestID,
		"lead_id", id,
		"lead_status", lead.Status,
	)

	return c.JSON(mappers.DomainLeadToGenerated(lead))
}

func (h *AdminLeadsHandler) SoftDeleteLead(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_soft_delete_lead_started",
		"request_id", requestID,
		"lead_id", id,
	)

	err := h.leadsService.Delete(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLeadNotFound) {
			h.logger.Warn("admin_soft_delete_lead_not_found",
				"request_id", requestID,
				"lead_id", id,
			)
			return c.Status(fiber.StatusNotFound).JSON(generated.NotFound{
				Error: &struct {
					Code    *string                        `json:"code,omitempty"`
					Details *generated.Error_Error_Details `json:"details,omitempty"`
					Message *string                        `json:"message,omitempty"`
				}{
					Code:    stringPtr("not_found"),
					Message: stringPtr(err.Error()),
				},
			})
		}
		h.logger.Error("admin_soft_delete_lead_failed",
			"request_id", requestID,
			"lead_id", id,
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

	h.logger.Info("admin_soft_delete_lead_completed",
		"request_id", requestID,
		"lead_id", id,
	)

	return c.SendStatus(fiber.StatusNoContent)
}