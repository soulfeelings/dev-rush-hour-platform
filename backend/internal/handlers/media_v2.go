package handlers

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// MediaV2Handler handles media file operations (local, Cloudflare Images)
type MediaV2Handler struct {
	service       *services.MediaService
	uploadDir     string // For local multipart uploads
	publicURL     string // For local URL generation
	cfAccountHash string // For CF delivery URL (empty if not CF)
	logger        *slog.Logger
}

// NewMediaV2Handler creates a new media v2 handler
func NewMediaV2Handler(service *services.MediaService, uploadDir, publicURL string) *MediaV2Handler {
	// Create upload directory if it doesn't exist (for local mode)
	if uploadDir != "" {
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			slog.Error("media_v2_handler_mkdir_failed",
				"upload_dir", uploadDir,
				"error", err.Error(),
			)
		}
	}

	return &MediaV2Handler{
		service:   service,
		uploadDir: uploadDir,
		publicURL: publicURL,
		logger:    slog.Default(),
	}
}

// === Admin Endpoints ===

// InitUploadRequest is the request body for init upload
type InitUploadRequest struct {
	MimeType     string `json:"mimeType"`
	OriginalName string `json:"originalName"`
}

// InitUploadResponse is the response for init upload
type InitUploadResponse struct {
	ID     string              `json:"id"`
	Key    string              `json:"key"`
	Upload *UploadPolicyOutput `json:"upload"`
}

// UploadPolicyOutput represents upload policy in response
type UploadPolicyOutput struct {
	URL    string            `json:"url"`
	Fields map[string]string `json:"fields,omitempty"`
}

// InitUpload handles POST /api/admin/media/init
func (h *MediaV2Handler) InitUpload(c *fiber.Ctx) error {
	h.logger.Info("media_v2_handler_init_upload_started")

	var req InitUploadRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Warn("media_v2_handler_init_upload_parse_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "Invalid request body",
			},
		})
	}

	// Validate request
	if req.MimeType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "mimeType is required",
			},
		})
	}
	if req.OriginalName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "originalName is required",
			},
		})
	}

	result, err := h.service.InitUpload(c.Context(), req.MimeType, req.OriginalName)
	if err != nil {
		if err == services.ErrInvalidMimeType {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "invalid_mime_type",
					"message": "Mime type is not allowed. Supported: image/jpeg, image/png, image/webp, image/gif",
				},
			})
		}
		if err == services.ErrInvalidOriginalName {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "validation_error",
					"message": "originalName is required",
				},
			})
		}

		h.logger.Error("media_v2_handler_init_upload_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to initialize upload",
			},
		})
	}

	h.logger.Info("media_v2_handler_init_upload_completed",
		"id", result.ID,
		"key", result.Key,
	)

	return c.Status(fiber.StatusOK).JSON(InitUploadResponse{
		ID:  result.ID.String(),
		Key: result.Key,
		Upload: &UploadPolicyOutput{
			URL:    result.Upload.URL,
			Fields: result.Upload.Fields,
		},
	})
}

// CompleteUploadRequest is the request body for complete upload
type CompleteUploadRequest struct {
	ID string `json:"id"`
}

// CompleteUploadResponse is the response for complete upload
type CompleteUploadResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

// CompleteUpload handles POST /api/admin/media/complete
func (h *MediaV2Handler) CompleteUpload(c *fiber.Ctx) error {
	h.logger.Info("media_v2_handler_complete_upload_started")

	var req CompleteUploadRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Warn("media_v2_handler_complete_upload_parse_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "Invalid request body",
			},
		})
	}

	if req.ID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "id is required",
			},
		})
	}

	id, err := uuid.Parse(req.ID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "Invalid id format",
			},
		})
	}

	media, err := h.service.CompleteUpload(c.Context(), id)
	if err != nil {
		if err == services.ErrMediaNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "not_found",
					"message": "Media not found",
				},
			})
		}
		if err == services.ErrUploadNotFound {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "upload_not_found",
					"message": "File not found in storage. Upload may have failed.",
				},
			})
		}

		h.logger.Error("media_v2_handler_complete_upload_failed",
			"id", id,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to complete upload",
			},
		})
	}

	h.logger.Info("media_v2_handler_complete_upload_completed",
		"id", media.ID,
		"status", media.Status,
	)

	return c.Status(fiber.StatusOK).JSON(CompleteUploadResponse{
		ID:     media.ID.String(),
		Status: string(media.Status),
	})
}

// DeleteResponse is the response for delete
type DeleteResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

// Delete handles DELETE /api/admin/media/:id
func (h *MediaV2Handler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")

	h.logger.Info("media_v2_handler_delete_started",
		"id", idStr,
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "Invalid id format",
			},
		})
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		if err == services.ErrMediaNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "not_found",
					"message": "Media not found",
				},
			})
		}

		h.logger.Error("media_v2_handler_delete_failed",
			"id", id,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to delete media",
			},
		})
	}

	h.logger.Info("media_v2_handler_delete_completed",
		"id", id,
	)

	return c.Status(fiber.StatusOK).JSON(DeleteResponse{
		ID:     id.String(),
		Status: "deleted",
	})
}

// MediaListItem is a single item in the list response
type MediaListItem struct {
	ID        string  `json:"id"`
	MimeType  string  `json:"mimeType"`
	Ext       string  `json:"ext"`
	SizeBytes *int64  `json:"sizeBytes,omitempty"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"createdAt"`
	URL       *string `json:"url,omitempty"`
}

// List handles GET /api/admin/media
func (h *MediaV2Handler) List(c *fiber.Ctx) error {
	h.logger.Info("media_v2_handler_list_started")

	status := c.Query("status")
	var statusPtr *string
	if status != "" {
		statusPtr = &status
	}

	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	media, err := h.service.List(statusPtr, limit, offset)
	if err != nil {
		h.logger.Error("media_v2_handler_list_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to list media",
			},
		})
	}

	items := make([]MediaListItem, len(media))
	for i, m := range media {
		items[i] = MediaListItem{
			ID:        m.ID.String(),
			MimeType:  m.MimeType,
			Ext:       m.Ext,
			SizeBytes: m.SizeBytes,
			Status:    string(m.Status),
			CreatedAt: m.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	h.logger.Info("media_v2_handler_list_completed",
		"count", len(items),
	)

	return c.Status(fiber.StatusOK).JSON(items)
}

// === Public Endpoints ===

// GetURLResponse is the response for get URL
type GetURLResponse struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	ExpiresIn int    `json:"expiresIn"`
}

// GetURL handles GET /api/media/:id/url
func (h *MediaV2Handler) GetURL(c *fiber.Ctx) error {
	idStr := c.Params("id")

	h.logger.Info("media_v2_handler_get_url_started",
		"id", idStr,
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "validation_error",
				"message": "Invalid id format",
			},
		})
	}

	mediaURL, err := h.service.GetURL(c.Context(), id)
	if err != nil {
		if err == services.ErrMediaNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "not_found",
					"message": "Media not found",
				},
			})
		}

		h.logger.Error("media_v2_handler_get_url_failed",
			"id", id,
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to get URL",
			},
		})
	}

	h.logger.Info("media_v2_handler_get_url_completed",
		"id", id,
	)

	return c.Status(fiber.StatusOK).JSON(GetURLResponse{
		ID:        mediaURL.ID.String(),
		URL:       mediaURL.URL,
		ExpiresIn: mediaURL.ExpiresIn,
	})
}

// GetURLsRequest is the request body for batch URL generation
type GetURLsRequest struct {
	IDs []string `json:"ids"`
}

// GetURLsResponse is the response for batch URL generation
type GetURLsResponse struct {
	Items    []GetURLResponse `json:"items"`
	NotFound []string         `json:"notFound"`
}

// GetURLs handles POST /api/media/urls
func (h *MediaV2Handler) GetURLs(c *fiber.Ctx) error {
	h.logger.Info("media_v2_handler_get_urls_started")

	var req GetURLsRequest
	if err := c.BodyParser(&req); err != nil {
		h.logger.Warn("media_v2_handler_get_urls_parse_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "Invalid request body",
			},
		})
	}

	// Validate batch size
	if len(req.IDs) > 50 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "batch_too_large",
				"message": "Maximum 50 IDs allowed per request",
			},
		})
	}

	if len(req.IDs) == 0 {
		return c.Status(fiber.StatusOK).JSON(GetURLsResponse{
			Items:    []GetURLResponse{},
			NotFound: []string{},
		})
	}

	// Parse UUIDs
	var uuids []uuid.UUID
	var invalidIDs []string
	for _, idStr := range req.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			invalidIDs = append(invalidIDs, idStr)
			continue
		}
		uuids = append(uuids, id)
	}

	result, err := h.service.GetURLs(c.Context(), uuids)
	if err != nil {
		if err == services.ErrBatchTooLarge {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "batch_too_large",
					"message": "Maximum 50 IDs allowed per request",
				},
			})
		}

		h.logger.Error("media_v2_handler_get_urls_failed",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "internal_error",
				"message": "Failed to get URLs",
			},
		})
	}

	// Build response
	items := make([]GetURLResponse, len(result.Items))
	for i, item := range result.Items {
		items[i] = GetURLResponse{
			ID:        item.ID.String(),
			URL:       item.URL,
			ExpiresIn: item.ExpiresIn,
		}
	}

	notFound := make([]string, 0, len(result.NotFound)+len(invalidIDs))
	for _, id := range result.NotFound {
		notFound = append(notFound, id.String())
	}
	notFound = append(notFound, invalidIDs...)

	h.logger.Info("media_v2_handler_get_urls_completed",
		"found", len(items),
		"not_found", len(notFound),
	)

	return c.Status(fiber.StatusOK).JSON(GetURLsResponse{
		Items:    items,
		NotFound: notFound,
	})
}

// === Legacy Multipart Upload (backward compatibility) ===

// Upload handles POST /api/admin/media/upload (multipart)
// For cloudflare_images: proxies file to CF Images
// For local: saves to disk and creates record
func (h *MediaV2Handler) Upload(c *fiber.Ctx) error {
	h.logger.Info("media_v2_handler_upload_started")

	file, err := c.FormFile("file")
	if err != nil {
		h.logger.Error("media_v2_handler_upload_no_file",
			"error", err.Error(),
		)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "invalid_request",
				"message": "No file provided",
			},
		})
	}

	if file.Size > 10*1024*1024 {
		h.logger.Warn("media_v2_handler_upload_file_too_large",
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

	ext := filepath.Ext(file.Filename)
	mimeType := getMimeTypeFromExt(ext)

	// Cloudflare Images: proxy upload
	if h.service.StorageDriver() == "cloudflare_images" {
		f, err := file.Open()
		if err != nil {
			h.logger.Error("media_v2_handler_upload_open_failed", "error", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"code": "upload_failed", "message": "Failed to read file"},
			})
		}
		defer f.Close()

		media, err := h.service.CreateFromCFUpload(c.Context(), f, file.Filename, file.Filename, mimeType, file.Size)
		if err != nil {
			h.logger.Error("media_v2_handler_upload_cf_failed", "error", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"code": "upload_failed", "message": err.Error()},
			})
		}

		url, _ := h.service.GetURL(c.Context(), media.ID)
		urlStr := ""
		if url != nil {
			urlStr = url.URL
		}

		h.logger.Info("media_v2_handler_upload_completed", "id", media.ID, "original", file.Filename)
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"id":  media.ID.String(),
			"url": urlStr,
		})
	}

	// Local: save to disk and create record
	filename := uuid.New().String() + ext
	savePath := filepath.Join(h.uploadDir, filename)
	if err := c.SaveFile(file, savePath); err != nil {
		h.logger.Error("media_v2_handler_upload_save_failed", "filename", filename, "error", err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{"code": "upload_failed", "message": fmt.Sprintf("Failed to save file: %v", err)},
		})
	}

	media, err := h.service.CreateFromMultipart(c.Context(), filename, file.Filename, mimeType, file.Size)
	if err != nil {
		h.logger.Error("media_v2_handler_upload_db_failed", "filename", filename, "error", err.Error())
		os.Remove(savePath)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fiber.Map{"code": "upload_failed", "message": "Failed to create media record"},
		})
	}

	url := fmt.Sprintf("%s/%s", h.publicURL, filename)
	h.logger.Info("media_v2_handler_upload_completed", "id", media.ID, "filename", filename)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":  media.ID.String(),
		"url": url,
	})
}

// Helper to get mime type from extension
func getMimeTypeFromExt(ext string) string {
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}
