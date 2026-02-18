package middleware

import (
	"rush-hour-platform/backend/internal/config"
	"rush-hour-platform/backend/internal/jwtutil"

	"github.com/gofiber/fiber/v2"
)

// AdminAuth validates the JWT cookie on all /api/admin/* routes.
// The login endpoint (/api/admin/auth/microsoft) is whitelisted.
func AdminAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		path := c.Path()

		// Only enforce on admin routes
		if len(path) < 10 || path[:10] != "/api/admin" {
			return c.Next()
		}

		// Skip CORS preflight
		if c.Method() == "OPTIONS" {
			return c.Next()
		}

		// Whitelist: login endpoints do not require an existing token
		if path == "/api/admin/auth/microsoft" {
			return c.Next()
		}

		tokenStr := c.Cookies(jwtutil.CookieName)
		if tokenStr == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{"code": "unauthorized", "message": "not authenticated"},
			})
		}

		claims, err := jwtutil.Verify(cfg.Admin.JWTSecret, tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{"code": "unauthorized", "message": "invalid or expired token"},
			})
		}

		jwtutil.SetClaims(c, claims)
		return c.Next()
	}
}
