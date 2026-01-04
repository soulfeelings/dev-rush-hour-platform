package handlers

import (
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"

	"github.com/google/uuid"
	"github.com/gofiber/fiber/v2"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type LotsHandler struct {
	lotsService *services.LotsService
}

func NewLotsHandler(lotsService *services.LotsService) *LotsHandler {
	return &LotsHandler{lotsService: lotsService}
}

func (h *LotsHandler) ListLots(c *fiber.Ctx, params generated.ListLotsParams) error {
	filters := repo.LotFilters{
		Status: domain.LotStatusActive,
	}

	if params.Area != nil {
		filters.AreaSlug = params.Area
	}
	if params.Project != nil {
		filters.ProjectSlug = params.Project
	}
	if params.Type != nil {
		lotType := domain.LotType(*params.Type)
		filters.Type = &lotType
	}
	if params.Bedrooms != nil {
		bedrooms := int(*params.Bedrooms)
		filters.Bedrooms = &bedrooms
	}
	if params.PriceMin != nil {
		priceMin := float64(*params.PriceMin)
		filters.PriceMin = &priceMin
	}
	if params.PriceMax != nil {
		priceMax := float64(*params.PriceMax)
		filters.PriceMax = &priceMax
	}
	if params.AreaMin != nil {
		areaMin := float64(*params.AreaMin)
		filters.AreaMin = &areaMin
	}
	if params.AreaMax != nil {
		areaMax := float64(*params.AreaMax)
		filters.AreaMax = &areaMax
	}
	if params.Bonus != nil {
		filters.BonusKey = params.Bonus
	}

	sort := repo.LotSortNewest
	if params.Sort != nil {
		sort = repo.LotSort(*params.Sort)
	}

	page := 1
	if params.Page != nil {
		page = *params.Page
	}

	limit := 20
	if params.Limit != nil {
		limit = *params.Limit
	}

	lots, total, err := h.lotsService.List(filters, sort, page, limit)
	if err != nil {
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

	result := make([]generated.Lot, len(lots))
	for i := range lots {
		gen := mappers.DomainLotToGenerated(&lots[i])
		if gen != nil {
			result[i] = *gen
		}
	}

	return c.JSON(generated.LotsListResponse{
		Items: &result,
		Total: intPtr(total),
		Page:  intPtr(page),
		Limit: intPtr(limit),
	})
}

func (h *LotsHandler) GetLot(c *fiber.Ctx, id openapi_types.UUID) error {
	uuidID := uuid.UUID(id)
	lot, err := h.lotsService.GetByID(uuidID)
	if err != nil {
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

	return c.JSON(mappers.DomainLotToGenerated(lot))
}
