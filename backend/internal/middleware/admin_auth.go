package middleware

import (
	"rush-hour-platform/backend/internal/config"

	"github.com/gofiber/fiber/v2"
)

func AdminAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Проверяем, является ли путь админским
		path := c.Path()
		if len(path) < 10 || path[:10] != "/api/admin" {
			// Не админский путь, пропускаем
			return c.Next()
		}

		// Если API key не настроен, пропускаем проверку
		if cfg.Admin.APIKey == "" {
			return c.Next()
		}

		apiKey := c.Get("X-Admin-Key")
		if apiKey == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "unauthorized",
					"message": "Missing API key",
				},
			})
		}

		if apiKey != cfg.Admin.APIKey {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "unauthorized",
					"message": "Invalid API key",
				},
			})
		}

		return c.Next()
	}
}

