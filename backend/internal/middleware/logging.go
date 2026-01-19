package middleware

import (
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// RequestLogger создает middleware для структурированного логирования
func RequestLogger() fiber.Handler {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	return func(c *fiber.Ctx) error {
		start := time.Now()
		requestID := uuid.New().String()
		
		// Добавляем request ID в контекст для использования в handlers
		c.Locals("requestID", requestID)
		
		// Логируем начало запроса
		logger.Info("request_started",
			"request_id", requestID,
			"method", c.Method(),
			"path", c.Path(),
			"ip", c.IP(),
			"user_agent", c.Get("User-Agent"),
			"query", c.Request().URI().QueryString(),
		)

		// Выполняем запрос
		err := c.Next()

		// Логируем завершение запроса
		status := c.Response().StatusCode()
		duration := time.Since(start)
		
		if status >= 400 {
			logger.Error("request_completed",
				"request_id", requestID,
				"method", c.Method(),
				"path", c.Path(),
				"status", status,
				"duration_ms", duration.Milliseconds(),
				"response_size", len(c.Response().Body()),
			)
		} else {
			logger.Info("request_completed",
				"request_id", requestID,
				"method", c.Method(),
				"path", c.Path(),
				"status", status,
				"duration_ms", duration.Milliseconds(),
				"response_size", len(c.Response().Body()),
			)
		}

		// Логируем ошибки если они есть
		if err != nil {
			logger.Error("request_error",
				"request_id", requestID,
				"method", c.Method(),
				"path", c.Path(),
				"error", err.Error(),
			)
		}

		return err
	}
}