package handlers

import (
	"rush-hour-platform/backend/internal/config"
	"rush-hour-platform/backend/internal/jwtutil"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AdminAuthHandler struct {
	authService *services.AdminAuthService
	cfg         *config.Config
}

func NewAdminAuthHandler(authService *services.AdminAuthService, cfg *config.Config) *AdminAuthHandler {
	return &AdminAuthHandler{authService: authService, cfg: cfg}
}

// POST /api/admin/auth/microsoft
func (h *AdminAuthHandler) LoginWithMicrosoft(c *fiber.Ctx) error {
	var body struct {
		AccessToken string `json:"access_token"`
	}
	if err := c.BodyParser(&body); err != nil || body.AccessToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "access_token is required"})
	}

	email, err := h.authService.VerifyMicrosoftToken(c.Context(), body.AccessToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid microsoft token"})
	}

	user, err := h.authService.Login(c.Context(), email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}
	if user == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not authorized"})
	}

	token, err := jwtutil.Sign(h.cfg.Admin.JWTSecret, user.Email, user.Role, user.Permissions)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to issue token"})
	}

	sameSite := "Lax"
	if h.cfg.Cookie.SameSite == "strict" {
		sameSite = "Strict"
	}

	c.Cookie(&fiber.Cookie{
		Name:     jwtutil.CookieName,
		Value:    token,
		HTTPOnly: true,
		Secure:   h.cfg.Cookie.Secure,
		SameSite: sameSite,
		MaxAge:   int(jwtutil.TTL.Seconds()),
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"email":       user.Email,
		"role":        user.Role,
		"permissions": user.Permissions,
	})
}

// GET /api/admin/auth/me
func (h *AdminAuthHandler) Me(c *fiber.Ctx) error {
	claims := jwtutil.GetClaims(c)
	if claims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "not authenticated"})
	}

	// Re-validate: check user still exists in DB (catches revocation within TTL window)
	user, err := h.authService.GetAdminUser(c.Context(), claims.Subject)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}

	sameSite := "Lax"
	if h.cfg.Cookie.SameSite == "strict" {
		sameSite = "Strict"
	}

	if user == nil {
		// User was removed — clear cookie and reject
		c.Cookie(&fiber.Cookie{
			Name:     jwtutil.CookieName,
			Value:    "",
			HTTPOnly: true,
			Secure:   h.cfg.Cookie.Secure,
			SameSite: sameSite,
			MaxAge:   -1,
			Path:     "/",
		})
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "not authorized"})
	}

	// Issue a fresh 15-min cookie with current role/permissions from DB
	token, err := jwtutil.Sign(h.cfg.Admin.JWTSecret, user.Email, user.Role, user.Permissions)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to issue token"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     jwtutil.CookieName,
		Value:    token,
		HTTPOnly: true,
		Secure:   h.cfg.Cookie.Secure,
		SameSite: sameSite,
		MaxAge:   int(jwtutil.TTL.Seconds()),
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"email":       user.Email,
		"role":        user.Role,
		"permissions": user.Permissions,
	})
}

// POST /api/admin/auth/logout
func (h *AdminAuthHandler) Logout(c *fiber.Ctx) error {
	sameSite := "Lax"
	if h.cfg.Cookie.SameSite == "strict" {
		sameSite = "Strict"
	}

	c.Cookie(&fiber.Cookie{
		Name:     jwtutil.CookieName,
		Value:    "",
		HTTPOnly: true,
		Secure:   h.cfg.Cookie.Secure,
		SameSite: sameSite,
		MaxAge:   -1,
		Path:     "/",
	})
	return c.JSON(fiber.Map{"ok": true})
}
