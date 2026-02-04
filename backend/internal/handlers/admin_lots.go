package handlers

import (
	"errors"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type AdminLotsHandler struct {
	lotsService *services.LotsService
	validator   *validator.Validate
}

func NewAdminLotsHandler(lotsService *services.LotsService) *AdminLotsHandler {
	return &AdminLotsHandler{
		lotsService: lotsService,
		validator:   validator.New(),
	}
}

func (h *AdminLotsHandler) ListLots(c *fiber.Ctx) error {
	filters := repo.LotFilters{}
	sort := repo.LotSortNewest
	lots, total, err := h.lotsService.List(filters, sort, 1, 1000)
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

	items := make([]generated.LotListItem, 0, len(lots))
	for i := range lots {
		lotListItem := mappers.DomainLotToGeneratedLotListItem(&lots[i])
		if lotListItem != nil {
			items = append(items, *lotListItem)
		}
	}

	page := 1
	limit := 1000
	response := generated.LotsListResponse{
		Items: &items,
		Total: &total,
		Page:  &page,
		Limit: &limit,
	}

	return c.JSON(response)
}

func (h *AdminLotsHandler) CreateLot(c *fiber.Ctx) error {
	var req generated.LotCreateRequest
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

	lot, err := mappers.GeneratedLotCreateToDomain(&req)
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

	if err := h.lotsService.Create(lot); err != nil {
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

	return c.Status(fiber.StatusCreated).JSON(mappers.DomainLotToGenerated(lot))
}

func (h *AdminLotsHandler) UpdateLot(c *fiber.Ctx, id openapi_types.UUID) error {
	var req generated.LotUpdateRequest
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

	lot, err := mappers.GeneratedLotUpdateToDomain(&req)
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

	if err := h.lotsService.Update(uuid.UUID(id), lot); err != nil {
		if err.Error() == "lot not found" {
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

	updated, err := h.lotsService.GetByID(uuid.UUID(id))
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

	return c.JSON(mappers.DomainLotToGenerated(updated))
}

func (h *AdminLotsHandler) GetLot(c *fiber.Ctx, id openapi_types.UUID) error {
	lot, err := h.lotsService.GetByID(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLotNotFound) {
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

	return c.JSON(mappers.DomainLotToGenerated(lot))
}

func (h *AdminLotsHandler) SoftDeleteLot(c *fiber.Ctx, id openapi_types.UUID) error {
	err := h.lotsService.Delete(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLotNotFound) {
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

func (h *AdminLotsHandler) ListDeletedLots(c *fiber.Ctx) error {
	lots, err := h.lotsService.ListDeleted()
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

	items := make([]generated.LotListItem, 0, len(lots))
	for i := range lots {
		lotListItem := mappers.DomainLotToGeneratedLotListItem(&lots[i])
		if lotListItem != nil {
			items = append(items, *lotListItem)
		}
	}

	total := len(lots)
	page := 1
	limit := 1000
	response := generated.LotsListResponse{
		Items: &items,
		Total: &total,
		Page:  &page,
		Limit: &limit,
	}

	return c.JSON(response)
}

func (h *AdminLotsHandler) RestoreLot(c *fiber.Ctx, id openapi_types.UUID) error {
	err := h.lotsService.Restore(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLotNotFound) {
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

func (h *AdminLotsHandler) HardDeleteLot(c *fiber.Ctx, id openapi_types.UUID) error {
	err := h.lotsService.HardDelete(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrLotNotFound) {
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
