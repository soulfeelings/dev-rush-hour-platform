package handlers

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	uploadDir string
	publicURL string
}

func NewMediaHandler(uploadDir, publicURL string) *MediaHandler {
	// Создаем директорию для загрузок, если её нет
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}

	return &MediaHandler{
		uploadDir: uploadDir,
		publicURL: publicURL,
	}
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	// Проверяем, что это multipart/form-data
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "No file provided",
			},
		})
	}

	// Проверяем размер файла (максимум 10MB)
	if file.Size > 10*1024*1024 {
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "upload_failed",
				"message": fmt.Sprintf("Failed to save file: %v", err),
			},
		})
	}

	// Формируем публичный URL
	url := fmt.Sprintf("%s/%s", h.publicURL, filename)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":  id,
		"url": url,
	})
}

func (h *MediaHandler) ServeFile(c *fiber.Ctx) error {
	filename := c.Params("filename")
	if filename == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Filename required")
	}

	// Проверяем безопасность пути
	if filepath.Base(filename) != filename {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid filename")
	}

	filePath := filepath.Join(h.uploadDir, filename)
	
	// Проверяем существование файла
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(fiber.StatusNotFound).SendString("File not found")
	}

	return c.SendFile(filePath)
}

