package handlers

import (
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AdminLeadsHandler struct {
	leadsService *services.LeadsService
}

func NewAdminLeadsHandler(leadsService *services.LeadsService) *AdminLeadsHandler {
	return &AdminLeadsHandler{
		leadsService: leadsService,
	}
}

func (h *AdminLeadsHandler) ListLeads(c *fiber.Ctx, params generated.AdminListLeadsParams) error {
	var status *domain.LeadStatus
	if params.Status != nil {
		s := domain.LeadStatus(*params.Status)
		status = &s
	}

	leads, err := h.leadsService.List(status)
	if err != nil {
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

	result := make([]generated.Lead, len(leads))
	for i := range leads {
		result[i] = *mappers.DomainLeadToGenerated(&leads[i])
	}

	return c.JSON(result)
}

