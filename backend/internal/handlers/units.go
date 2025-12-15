package handlers

import (
	"github.com/gofiber/fiber/v2"
	"rush-hour-platform/backend/internal/generated"
)

type UnitsHandler struct{}

func NewUnitsHandler() *UnitsHandler {
	return &UnitsHandler{}
}

func (h *UnitsHandler) ListUnits(c *fiber.Ctx, params generated.ListUnitsParams) error {
	// Мок-данные для юнитов
	allUnits := []generated.Unit{
		{
			Id:        stringPtr("1"),
			ProjectId: stringPtr("1"),
			Floor:     intPtr(5),
			Area:      float32Ptr(45.5),
			Bedrooms:  intPtr(1),
			Price:     float32Ptr(5500000),
			Status:    unitStatusPtr(generated.UnitStatusAvailable),
		},
		{
			Id:        stringPtr("2"),
			ProjectId: stringPtr("1"),
			Floor:     intPtr(7),
			Area:      float32Ptr(65.0),
			Bedrooms:  intPtr(2),
			Price:     float32Ptr(7500000),
			Status:    unitStatusPtr(generated.UnitStatusAvailable),
		},
		{
			Id:        stringPtr("3"),
			ProjectId: stringPtr("1"),
			Floor:     intPtr(10),
			Area:      float32Ptr(85.5),
			Bedrooms:  intPtr(3),
			Price:     float32Ptr(9500000),
			Status:    unitStatusPtr(generated.UnitStatusReserved),
		},
		{
			Id:        stringPtr("4"),
			ProjectId: stringPtr("2"),
			Floor:     intPtr(3),
			Area:      float32Ptr(50.0),
			Bedrooms:  intPtr(1),
			Price:     float32Ptr(7000000),
			Status:    unitStatusPtr(generated.UnitStatusAvailable),
		},
		{
			Id:        stringPtr("5"),
			ProjectId: stringPtr("2"),
			Floor:     intPtr(8),
			Area:      float32Ptr(70.0),
			Bedrooms:  intPtr(2),
			Price:     float32Ptr(9000000),
			Status:    unitStatusPtr(generated.UnitStatusAvailable),
		},
		{
			Id:        stringPtr("6"),
			ProjectId: stringPtr("3"),
			Floor:     intPtr(2),
			Area:      float32Ptr(55.0),
			Bedrooms:  intPtr(2),
			Price:     float32Ptr(6500000),
			Status:    unitStatusPtr(generated.UnitStatusAvailable),
		},
	}

	// Фильтрация по projectId, если указан
	if params.ProjectId != nil && *params.ProjectId != "" {
		filteredUnits := []generated.Unit{}
		for _, unit := range allUnits {
			if unit.ProjectId != nil && *unit.ProjectId == *params.ProjectId {
				filteredUnits = append(filteredUnits, unit)
			}
		}
		return c.JSON(filteredUnits)
	}

	// Если projectId не указан, возвращаем все юниты
	return c.JSON(allUnits)
}

func intPtr(i int) *int {
	return &i
}

func unitStatusPtr(s generated.UnitStatus) *generated.UnitStatus {
	return &s
}

