package handlers

import (
	"strings"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/jwtutil"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AdminTeamHandler struct {
	authService *services.AdminAuthService
}

func NewAdminTeamHandler(authService *services.AdminAuthService) *AdminTeamHandler {
	return &AdminTeamHandler{authService: authService}
}

func requireSuperadmin(c *fiber.Ctx) bool {
	claims := jwtutil.GetClaims(c)
	return claims != nil && claims.Role == "superadmin"
}

// GET /api/admin/team
func (h *AdminTeamHandler) ListTeam(c *fiber.Ctx) error {
	if !requireSuperadmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "superadmin only"})
	}
	users, err := h.authService.ListAdminUsers(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to list team"})
	}
	return c.JSON(users)
}

// POST /api/admin/team
func (h *AdminTeamHandler) AddTeamMember(c *fiber.Ctx) error {
	if !requireSuperadmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "superadmin only"})
	}

	var body struct {
		Email       string   `json:"email"`
		Role        string   `json:"role"`
		Permissions []string `json:"permissions"`
	}
	if err := c.BodyParser(&body); err != nil || body.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email is required"})
	}
	if body.Role == "" {
		body.Role = "admin"
	}
	if body.Permissions == nil {
		body.Permissions = []string{}
	}

	claims := jwtutil.GetClaims(c)
	user := &domain.AdminUser{
		Email:       strings.ToLower(strings.TrimSpace(body.Email)),
		Role:        body.Role,
		Permissions: body.Permissions,
		CreatedBy:   claims.Subject,
	}

	if err := h.authService.AddAdminUser(c.Context(), user); err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "this email is already in the team"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add team member"})
	}
	return c.Status(fiber.StatusCreated).JSON(user)
}

// PUT /api/admin/team/:id
func (h *AdminTeamHandler) UpdateTeamMember(c *fiber.Ctx) error {
	if !requireSuperadmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "superadmin only"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	var body struct {
		Role        string   `json:"role"`
		Permissions []string `json:"permissions"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.authService.UpdateAdminUser(c.Context(), id, body.Role, body.Permissions); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update team member"})
	}
	return c.JSON(fiber.Map{"ok": true})
}

// DELETE /api/admin/team/:id
func (h *AdminTeamHandler) RemoveTeamMember(c *fiber.Ctx) error {
	if !requireSuperadmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "superadmin only"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	if err := h.authService.RemoveAdminUser(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to remove team member"})
	}
	return c.JSON(fiber.Map{"ok": true})
}
