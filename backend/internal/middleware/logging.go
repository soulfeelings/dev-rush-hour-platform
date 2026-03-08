package middleware

import (
	"log/slog"
	"os"
	"rush-hour-platform/backend/internal/jwtutil"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	Level: slog.LevelInfo,
}))

// RequestLogger logs all API requests. For admin routes it includes admin_email from JWT claims.
func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		requestID := uuid.New().String()
		c.Locals("requestID", requestID)

		logger.Info("request_started",
			"request_id", requestID,
			"method", c.Method(),
			"path", c.Path(),
			"ip", c.IP(),
			"user_agent", c.Get("User-Agent"),
			"query", c.Request().URI().QueryString(),
		)

		err := c.Next()

		status := c.Response().StatusCode()
		duration := time.Since(start)

		attrs := []any{
			"request_id", requestID,
			"method", c.Method(),
			"path", c.Path(),
			"status", status,
			"duration_ms", duration.Milliseconds(),
			"response_size", len(c.Response().Body()),
		}

		if strings.HasPrefix(c.Path(), "/api/admin") {
			if claims := jwtutil.GetClaims(c); claims != nil {
				attrs = append(attrs, "admin_email", claims.Subject)
			}
		}

		if status >= 400 {
			logger.Error("request_completed", attrs...)
		} else {
			logger.Info("request_completed", attrs...)
		}

		if err != nil {
			logger.Error("request_error",
				"request_id", requestID,
				"error", err.Error(),
			)
		}

		return err
	}
}