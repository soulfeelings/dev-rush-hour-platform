package handlers

import (
	"encoding/json"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/mappers"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type LotsHandler struct {
	lotsService *services.LotsService
	logger      *slog.Logger
}

func NewLotsHandler(lotsService *services.LotsService) *LotsHandler {
	return &LotsHandler{
		lotsService: lotsService,
		logger:      slog.Default(),
	}
}

// bedroomsResult holds parsed bedroom filter values
type bedroomsResult struct {
	values []int
	gte    *int // >= threshold for "7+"
}

// bathroomsResult holds parsed bathroom filter values
type bathroomsResult struct {
	values []int
	gte    *int // >= threshold for "7+"
}

// parseLotsBedroomsParam parses comma-separated bedroom values for lots (e.g., "1,2,3" or "studio,1,2")
func parseLotsBedroomsParam(bedroomsStr *string) bedroomsResult {
	if bedroomsStr == nil || *bedroomsStr == "" {
		return bedroomsResult{}
	}

	parts := strings.Split(*bedroomsStr, ",")
	result := bedroomsResult{values: make([]int, 0, len(parts))}

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Handle "studio" as 0 bedrooms
		if strings.ToLower(part) == "studio" {
			result.values = append(result.values, 0)
			continue
		}

		// Handle "7+" as >= 7
		if part == "7+" {
			gte := 7
			result.gte = &gte
			continue
		}

		// Parse numeric value
		if num, err := strconv.Atoi(part); err == nil && num >= 0 {
			result.values = append(result.values, num)
		}
	}

	return result
}

// parseLotsBathroomsParam parses comma-separated bathroom values for lots (e.g., "1,2,3")
func parseLotsBathroomsParam(bathroomsStr *string) bathroomsResult {
	if bathroomsStr == nil || *bathroomsStr == "" {
		return bathroomsResult{}
	}

	parts := strings.Split(*bathroomsStr, ",")
	result := bathroomsResult{values: make([]int, 0, len(parts))}

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Handle "7+" as >= 7
		if part == "7+" {
			gte := 7
			result.gte = &gte
			continue
		}

		// Parse numeric value
		if num, err := strconv.Atoi(part); err == nil && num >= 0 {
			result.values = append(result.values, num)
		}
	}

	return result
}

func (h *LotsHandler) ListLots(c *fiber.Ctx, params generated.ListLotsParams) error {
	h.logger.Info("list_lots_started",
		"area", params.Area,
		"project", params.Project,
		"type", params.Type,
		"bedrooms", params.Bedrooms,
		"page", params.Page,
		"limit", params.Limit,
	)

	bedsResult := parseLotsBedroomsParam(params.Bedrooms)
	bathsResult := parseLotsBathroomsParam(params.Bathrooms)

	filters := repo.LotFilters{
		Status:       domain.LotStatusActive,
		Bedrooms:     bedsResult.values,
		BedroomsGte:  bedsResult.gte,
		Bathrooms:    bathsResult.values,
		BathroomsGte: bathsResult.gte,
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
		h.logger.Error("list_lots_failed",
			"error", err.Error(),
			"filters", filters,
			"sort", sort,
			"page", page,
			"limit", limit,
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

	// Use the new LotListItem type that includes nested objects
	items := make([]generated.LotListItem, 0, len(lots))
	for i := range lots {
		lotListItem := mappers.DomainLotToGeneratedLotListItem(&lots[i])
		if lotListItem != nil {
			items = append(items, *lotListItem)
		}
	}

	response := generated.LotsListResponse{
		Items: &items,
		Total: &total,
		Page:  &page,
		Limit: &limit,
	}

	h.logger.Info("list_lots_completed",
		"count", len(items),
		"total", total,
	)

	return c.JSON(response)
}

func (h *LotsHandler) GetLot(c *fiber.Ctx, id openapi_types.UUID) error {
	uuidID := uuid.UUID(id)

	h.logger.Info("get_lot_started",
		"lot_id", uuidID,
	)

	lot, err := h.lotsService.GetByID(uuidID)
	if err != nil {
		h.logger.Error("get_lot_failed",
			"lot_id", uuidID,
			"error", err.Error(),
		)
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

	if lot.Status != domain.LotStatusActive {
		return c.Status(fiber.StatusNotFound).JSON(generated.NotFound{
			Error: &struct {
				Code    *string                        `json:"code,omitempty"`
				Details *generated.Error_Error_Details `json:"details,omitempty"`
				Message *string                        `json:"message,omitempty"`
			}{
				Code:    stringPtr("not_found"),
				Message: stringPtr("lot not found"),
			},
		})
	}

	// Use the new LotListItem type that includes nested objects for single lot response
	lotResponse := mappers.DomainLotToGeneratedLotListItem(lot)

	// Convert to map to add additional data fields that aren't in the schema
	response := make(map[string]interface{})

	// Marshal and unmarshal to get base structure
	lotJSON, _ := json.Marshal(lotResponse)
	json.Unmarshal(lotJSON, &response)

	// Add additional data fields that aren't in the generated schema
	if response["data"] == nil {
		response["data"] = make(map[string]interface{})
	}
	dataMap, ok := response["data"].(map[string]interface{})
	if !ok {
		dataMap = make(map[string]interface{})
		response["data"] = dataMap
	}

	// Preserve original media data including gallery
	if lot.Data.Media != nil {
		// Convert domain media to map to preserve all fields including gallery
		mediaJSON, _ := json.Marshal(lot.Data.Media)
		var mediaMap map[string]interface{}
		json.Unmarshal(mediaJSON, &mediaMap)
		dataMap["media"] = mediaMap
	}

	if lot.Data.View != "" {
		dataMap["view"] = lot.Data.View
	}
	if lot.Data.Furnishing != "" {
		dataMap["furnishing"] = lot.Data.Furnishing
	}
	if lot.Data.Orientation != "" {
		dataMap["orientation"] = lot.Data.Orientation
	}
	if len(lot.Data.Features) > 0 {
		dataMap["features"] = lot.Data.Features
	}
	h.logger.Info("get_lot_completed",
		"lot_id", uuidID,
	)

	return c.JSON(response)
}
