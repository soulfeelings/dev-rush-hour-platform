package handlers

import (
	"rush-hour-platform/backend/internal/generated"

	"github.com/gofiber/fiber/v2"
)

type ProjectsHandler struct{}

func NewProjectsHandler() *ProjectsHandler {
	return &ProjectsHandler{}
}

func (h *ProjectsHandler) ListProjects(c *fiber.Ctx) error {
	projects := []generated.Project{
		{
			Id:        stringPtr("1"),
			Title:     stringPtr("ЖК Солнечный"),
			Location:  stringPtr("Москва, район Солнцево"),
			PriceFrom: float32Ptr(5000000),
			Status:    statusPtr(generated.ProjectStatusReady),
		},
		{
			Id:        stringPtr("2"),
			Title:     stringPtr("ЖК Лесной"),
			Location:  stringPtr("Москва, район Химки"),
			PriceFrom: float32Ptr(7000000),
			Status:    statusPtr(generated.ProjectStatusConstruction),
		},
		{
			Id:        stringPtr("3"),
			Title:     stringPtr("ЖК Речной"),
			Location:  stringPtr("Москва, район Нагатино"),
			PriceFrom: float32Ptr(6000000),
			Status:    statusPtr(generated.ProjectStatusPlanning),
		},
	}

	return c.JSON(projects)
}

func stringPtr(s string) *string {
	return &s
}

func float32Ptr(f float32) *float32 {
	return &f
}

func statusPtr(s generated.ProjectStatus) *generated.ProjectStatus {
	return &s
}

