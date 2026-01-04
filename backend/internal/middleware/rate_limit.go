package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// LeadsRateLimit создает rate limiter для POST /api/leads
// Limit: 5 requests per minute per IP
func LeadsRateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        5,
		Expiration: 60, // seconds
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "rate_limit_exceeded",
					"message": "Too many requests. Please try again later.",
				},
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
	})
}

// LeadsRateLimitMiddleware применяет rate limiting только к POST /api/leads
func LeadsRateLimitMiddleware() fiber.Handler {
	limiter := LeadsRateLimit()
	return func(c *fiber.Ctx) error {
		// Применяем rate limiting только к POST /api/leads
		if c.Method() == "POST" && c.Path() == "/api/leads" {
			return limiter(c)
		}
		return c.Next()
	}
}

