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

type AdminProjectsHandler struct {
	projectsService *services.ProjectsService
	validator       *validator.Validate
	logger          *slog.Logger
}

func NewAdminProjectsHandler(projectsService *services.ProjectsService) *AdminProjectsHandler {
	return &AdminProjectsHandler{
		projectsService: projectsService,
		validator:       validator.New(),
		logger:          slog.Default(),
	}
}

func (h *AdminProjectsHandler) ListProjects(c *fiber.Ctx) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_list_projects_started",
		"request_id", requestID,
	)

	projects, err := h.projectsService.ListAll()
	if err != nil {
		h.logger.Error("admin_list_projects_failed",
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

	h.logger.Info("admin_list_projects_completed",
		"request_id", requestID,
		"projects_count", len(projects),
	)

	result := make([]generated.Project, len(projects))
	for i := range projects {
		result[i] = *mappers.DomainProjectToGenerated(&projects[i])
	}

	return c.JSON(result)
}

func (h *AdminProjectsHandler) CreateProject(c *fiber.Ctx) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_create_project_started",
		"request_id", requestID,
	)

	var req generated.ProjectCreateRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Error("admin_create_project_parse_error",
			"request_id", requestID,
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

	if err := h.validator.Struct(&req); err != nil {
		h.logger.Error("admin_create_project_validation_error",
			"request_id", requestID,
			"error", err.Error(),
		)
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

	project, err := mappers.GeneratedProjectCreateToDomain(&req)
	if err != nil {
		h.logger.Error("admin_create_project_mapping_error",
			"request_id", requestID,
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

	if err := h.projectsService.Create(project); err != nil {
		h.logger.Error("admin_create_project_failed",
			"request_id", requestID,
			"project_name", project.Name,
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

	h.logger.Info("admin_create_project_completed",
		"request_id", requestID,
		"project_id", project.ID,
		"project_name", project.Name,
	)

	return c.Status(fiber.StatusCreated).JSON(mappers.DomainProjectToGenerated(project))
}

func (h *AdminProjectsHandler) UpdateProject(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_update_project_started",
		"request_id", requestID,
		"project_id", id,
	)

	var req generated.ProjectUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Error("admin_update_project_parse_error",
			"request_id", requestID,
			"project_id", id,
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

	project, err := mappers.GeneratedProjectUpdateToDomain(&req)
	if err != nil {
		h.logger.Error("admin_update_project_mapping_error",
			"request_id", requestID,
			"project_id", id,
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

	if err := h.projectsService.Update(uuid.UUID(id), project); err != nil {
		if err.Error() == "project not found" {
			h.logger.Warn("admin_update_project_not_found",
				"request_id", requestID,
				"project_id", id,
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
		h.logger.Error("admin_update_project_failed",
			"request_id", requestID,
			"project_id", id,
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

	updated, err := h.projectsService.GetByID(uuid.UUID(id))
	if err != nil {
		h.logger.Error("admin_update_project_get_updated_failed",
			"request_id", requestID,
			"project_id", id,
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

	h.logger.Info("admin_update_project_completed",
		"request_id", requestID,
		"project_id", id,
		"project_name", updated.Name,
	)

	return c.JSON(mappers.DomainProjectToGenerated(updated))
}

func (h *AdminProjectsHandler) GetProject(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_get_project_started",
		"request_id", requestID,
		"project_id", id,
	)

	project, err := h.projectsService.GetByID(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrProjectNotFound) {
			h.logger.Warn("admin_get_project_not_found",
				"request_id", requestID,
				"project_id", id,
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
		h.logger.Error("admin_get_project_failed",
			"request_id", requestID,
			"project_id", id,
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

	h.logger.Info("admin_get_project_completed",
		"request_id", requestID,
		"project_id", id,
		"project_name", project.Name,
	)

	return c.JSON(mappers.DomainProjectToGenerated(project))
}

func (h *AdminProjectsHandler) SoftDeleteProject(c *fiber.Ctx, id openapi_types.UUID) error {
	requestID := c.Locals("requestID").(string)

	h.logger.Info("admin_soft_delete_project_started",
		"request_id", requestID,
		"project_id", id,
	)

	err := h.projectsService.Delete(uuid.UUID(id))
	if err != nil {
		if errors.Is(err, services.ErrProjectNotFound) {
			h.logger.Warn("admin_soft_delete_project_not_found",
				"request_id", requestID,
				"project_id", id,
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
		h.logger.Error("admin_soft_delete_project_failed",
			"request_id", requestID,
			"project_id", id,
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

	h.logger.Info("admin_soft_delete_project_completed",
		"request_id", requestID,
		"project_id", id,
	)

	return c.SendStatus(fiber.StatusNoContent)
}