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

func (h *ProjectsHandler) GetProject(c *fiber.Ctx, projectId string) error {
	// Мок-данные проектов для поиска
	projects := []generated.Project{
		{
			Id:          stringPtr("1"),
			Title:       stringPtr("ЖК Солнечный"),
			Location:    stringPtr("Москва, район Солнцево"),
			PriceFrom:   float32Ptr(5000000),
			Status:      statusPtr(generated.ProjectStatusReady),
			Description: stringPtr("Современный жилой комплекс в экологичном районе Москвы. Полностью готов к заселению."),
		},
		{
			Id:          stringPtr("2"),
			Title:       stringPtr("ЖК Лесной"),
			Location:    stringPtr("Москва, район Химки"),
			PriceFrom:   float32Ptr(7000000),
			Status:      statusPtr(generated.ProjectStatusConstruction),
			Description: stringPtr("Жилой комплекс рядом с лесным массивом. Строительство ведется с соблюдением всех современных стандартов."),
		},
		{
			Id:          stringPtr("3"),
			Title:       stringPtr("ЖК Речной"),
			Location:    stringPtr("Москва, район Нагатино"),
			PriceFrom:   float32Ptr(6000000),
			Status:      statusPtr(generated.ProjectStatusPlanning),
			Description: stringPtr("Проект у реки с развитой инфраструктурой. Планируется завершение строительства в 2025 году."),
		},
	}

	// Поиск проекта по ID
	for _, project := range projects {
		if project.Id != nil && *project.Id == projectId {
			return c.JSON(project)
		}
	}

	// Проект не найден
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Project not found"})
}

func statusPtr(s generated.ProjectStatus) *generated.ProjectStatus {
	return &s
}

