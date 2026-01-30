package handlers

import (
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type AdminBadgesHandler struct {
	badgesService *services.BadgesService
	validator     *validator.Validate
	logger        *slog.Logger
}

func NewAdminBadgesHandler(badgesService *services.BadgesService) *AdminBadgesHandler {
	return &AdminBadgesHandler{
		badgesService: badgesService,
		validator:     validator.New(),
		logger:        slog.Default(),
	}
}

func (h *AdminBadgesHandler) ListBadges(c *fiber.Ctx) error {
	h.logger.Info("admin_list_badges_started")
	badges, err := h.badgesService.ListAll()
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

	result := make([]generated.Badge, len(badges))
	for i := range badges {
		result[i] = *mappers.DomainBadgeToGenerated(&badges[i])
	}

	return c.JSON(result)
}

func (h *AdminBadgesHandler) CreateBadge(c *fiber.Ctx) error {
	var req generated.BadgeCreateRequest
	if err := c.BodyParser(&req); err != nil {
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

	if err := h.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
			Error: &struct {
				Code    *string                        `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string                        `json:"message,omitempty"`
			}{
				Code:    stringPtr("validation_error"),
				Message: stringPtr("validation failed"),
			},
		})
	}

	badge, err := mappers.GeneratedBadgeCreateToDomain(&req)
	if err != nil {
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

	if err := h.badgesService.Create(badge); err != nil {
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

	return c.Status(fiber.StatusCreated).JSON(mappers.DomainBadgeToGenerated(badge))
}

func (h *AdminBadgesHandler) UpdateBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	var req generated.BadgeUpdateRequest
	if err := c.BodyParser(&req); err != nil {
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

	badgeID := uuid.UUID(id)
	existing, err := h.badgesService.GetByID(badgeID)
	if err != nil {
		if errors.Is(err, services.ErrBadgeNotFound) {
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

	updatedBadge := mappers.ApplyBadgeUpdateRequest(existing, &req)

	if err := h.badgesService.Update(badgeID, updatedBadge); err != nil {
		if errors.Is(err, services.ErrBadgeNotFound) {
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

	updated, err := h.badgesService.GetByID(badgeID)
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

	return c.JSON(mappers.DomainBadgeToGenerated(updated))
}

func (h *AdminBadgesHandler) GetBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	badge, err := h.badgesService.GetByID(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrBadgeNotFound) {
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

	return c.JSON(mappers.DomainBadgeToGenerated(badge))
}

func (h *AdminBadgesHandler) SoftDeleteBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	err := h.badgesService.Delete(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrBadgeNotFound) {
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

	return c.SendStatus(fiber.StatusNoContent)
}
