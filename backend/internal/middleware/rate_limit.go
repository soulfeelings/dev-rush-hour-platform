package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func rateLimitHandler(max int, expiration time.Duration) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: expiration,
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
	})
}

// PublicRateLimit applies rate limiting to public API endpoints (180 req/min per IP).
func PublicRateLimit() fiber.Handler {
	return rateLimitHandler(180, time.Minute)
}

// AuthRateLimit applies strict rate limiting to auth endpoints (10 req/min per IP).
func AuthRateLimit() fiber.Handler {
	return rateLimitHandler(30, time.Minute)
}

// AdminRateLimit applies rate limiting to admin API endpoints (180 req/min per IP).
func AdminRateLimit() fiber.Handler {
	return rateLimitHandler(180, time.Minute)
}
