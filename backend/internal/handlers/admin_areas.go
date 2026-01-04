package handlers

import (
	"fmt"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/services"
	"rush-hour-platform/backend/internal/validation"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type AdminAreasHandler struct {
	areasService *services.AreasService
	validator    *validator.Validate
}

func NewAdminAreasHandler(areasService *services.AreasService) *AdminAreasHandler {
	return &AdminAreasHandler{
		areasService: areasService,
		validator:    validator.New(),
	}
}

func (h *AdminAreasHandler) ListAreas(c *fiber.Ctx) error {
	areas, err := h.areasService.ListAll()
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

	result := make([]generated.Area, len(areas))
	for i := range areas {
		result[i] = *mappers.DomainAreaToGenerated(&areas[i])
	}

	return c.JSON(result)
}

func (h *AdminAreasHandler) CreateArea(c *fiber.Ctx) error {
	var req generated.AreaCreateRequest
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

	area, err := mappers.GeneratedAreaCreateToDomain(&req)
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

	// Валидация GeoJSON polygon
	if area.Data.Boundary != nil {
		if err := validation.ValidateGeoJSONPolygon(area.Data.Boundary); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
				Error: &struct {
					Code    *string                        `json:"code,omitempty"`
					Details *generated.Error_Error_Details `json:"details,omitempty"`
					Message *string                        `json:"message,omitempty"`
				}{
					Code:    stringPtr("validation_error"),
					Message: stringPtr(fmt.Sprintf("Invalid GeoJSON polygon: %v", err)),
				},
			})
		}
	}

	if err := h.areasService.Create(area); err != nil {
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

	return c.Status(fiber.StatusCreated).JSON(mappers.DomainAreaToGenerated(area))
}

func (h *AdminAreasHandler) UpdateArea(c *fiber.Ctx, id openapi_types.UUID) error {
	var req generated.AreaUpdateRequest
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

	area, err := mappers.GeneratedAreaUpdateToDomain(&req)
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

	// Валидация GeoJSON polygon
	if area.Data.Boundary != nil {
		if err := validation.ValidateGeoJSONPolygon(area.Data.Boundary); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(generated.ValidationError{
				Error: &struct {
					Code    *string                        `json:"code,omitempty"`
					Details *generated.Error_Error_Details `json:"details,omitempty"`
					Message *string                        `json:"message,omitempty"`
				}{
					Code:    stringPtr("validation_error"),
					Message: stringPtr(fmt.Sprintf("Invalid GeoJSON polygon: %v", err)),
				},
			})
		}
	}

	if err := h.areasService.Update(uuid.UUID(id), area); err != nil {
		if err.Error() == "area not found" {
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

	updated, err := h.areasService.GetByID(uuid.UUID(id))
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

	return c.JSON(mappers.DomainAreaToGenerated(updated))
}

