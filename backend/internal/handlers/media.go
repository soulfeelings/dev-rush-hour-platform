package handlers

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MediaHandler struct {
	uploadDir string
	publicURL string
	logger    *slog.Logger
}

func NewMediaHandler(uploadDir, publicURL string) *MediaHandler {
	// Создаем директорию для загрузок, если её нет
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}

	return &MediaHandler{
		uploadDir: uploadDir,
		publicURL: publicURL,
		logger:    slog.Default(),
	}
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	h.logger.Info("upload_file_started")

	// Проверяем, что это multipart/form-data
	file, err := c.FormFile("file")
	if err != nil {
		h.logger.Error("upload_file_no_file_error",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "No file provided",
			},
		})
	}

	// Проверяем размер файла (максимум 10MB)
	if file.Size > 10*1024*1024 {
		h.logger.Warn("upload_file_size_exceeded",
			"filename", file.Filename,
			"size", file.Size,
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "file_too_large",
				"message": "File size exceeds 10MB limit",
			},
		})
	}

	// Генерируем уникальное имя файла
	ext := filepath.Ext(file.Filename)
	id := uuid.New().String()
	filename := id + ext

	// Сохраняем файл
	savePath := filepath.Join(h.uploadDir, filename)
	if err := c.SaveFile(file, savePath); err != nil {
		h.logger.Error("upload_file_save_failed",
			"filename", filename,
			"save_path", savePath,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "upload_failed",
				"message": fmt.Sprintf("Failed to save file: %v", err),
			},
		})
	}

	// Формируем публичный URL
	url := fmt.Sprintf("%s/%s", h.publicURL, filename)

	h.logger.Info("upload_file_completed",
		"id", id,
		"filename", filename,
		"original_filename", file.Filename,
		"size", file.Size,
	)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":  id,
		"url": url,
	})
}

func (h *MediaHandler) ServeFile(c *fiber.Ctx) error {
	filename := c.Params("filename")

	h.logger.Info("serve_file_started",
		"filename", filename,
	)

	if filename == "" {
		h.logger.Warn("serve_file_no_filename")
		return c.Status(fiber.StatusBadRequest).SendString("Filename required")
	}

	// Проверяем безопасность пути
	if filepath.Base(filename) != filename {
		h.logger.Warn("serve_file_invalid_filename",
			"filename", filename,
		)
		return c.Status(fiber.StatusBadRequest).SendString("Invalid filename")
	}

	filePath := filepath.Join(h.uploadDir, filename)
	
	// Проверяем существование файла
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		h.logger.Warn("serve_file_not_found",
			"filename", filename,
			"file_path", filePath,
		)
		return c.Status(fiber.StatusNotFound).SendString("File not found")
	}

	h.logger.Info("serve_file_completed",
		"filename", filename,
	)

	return c.SendFile(filePath)
}

