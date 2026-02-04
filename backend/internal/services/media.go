package services

import (
	"context"
	"fmt"
	"log/slog"
	"path/filepath"
	"rush-hour-platform/backend/internal/delivery"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/storage"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	// MaxUploadSize is the maximum file size in bytes (10MB)
	MaxUploadSize int64 = 10 * 1024 * 1024

	// UploadPolicyTTL is the expiration time for upload policies
	UploadPolicyTTL = 5 * time.Minute

	// MaxBatchSize is the maximum number of IDs in a batch request
	MaxBatchSize = 50
)

type MediaService struct {
	repo        *repo.MediaRepo
	storage     storage.MediaStorage
	delivery    delivery.MediaDelivery
	signedTTL   time.Duration
	logger      *slog.Logger
}

// NewMediaService creates a new media service
func NewMediaService(
	repo *repo.MediaRepo,
	storage storage.MediaStorage,
	delivery delivery.MediaDelivery,
	signedTTLSeconds int,
) *MediaService {
	ttl := time.Duration(signedTTLSeconds) * time.Second
	if ttl == 0 {
		ttl = time.Hour // Default 1 hour
	}

	return &MediaService{
		repo:      repo,
		storage:   storage,
		delivery:  delivery,
		signedTTL: ttl,
		logger:    slog.Default(),
	}
}

// InitUploadResult contains the result of initializing an upload
type InitUploadResult struct {
	ID     uuid.UUID
	Key    string
	Upload *storage.UploadPolicy
}

// InitUpload creates a new media record and returns upload credentials
func (s *MediaService) InitUpload(ctx context.Context, mimeType, originalName string) (*InitUploadResult, error) {
	s.logger.Info("media_service_init_upload_started",
		"mime_type", mimeType,
		"original_name", originalName,
	)

	// Validate mime type
	if !domain.IsAllowedMimeType(mimeType) {
		s.logger.Warn("media_service_init_upload_invalid_mime_type",
			"mime_type", mimeType,
		)
		return nil, ErrInvalidMimeType
	}

	// Validate original name
	if strings.TrimSpace(originalName) == "" {
		s.logger.Warn("media_service_init_upload_empty_name")
		return nil, ErrInvalidOriginalName
	}

	// Generate storage key
	ext := domain.GetExtForMimeType(mimeType)
	id := uuid.New()
	storageKey := fmt.Sprintf("%s%s", id.String(), ext)

	// Create media record
	media := &domain.MediaFile{
		StorageKey:    storageKey,
		OriginalName:  &originalName,
		MimeType:      mimeType,
		Ext:           ext,
		StorageDriver: domain.StorageDriver(s.storage.Driver()),
		Status:        domain.MediaFileStatusPending,
	}

	if err := s.repo.Create(media); err != nil {
		s.logger.Error("media_service_init_upload_create_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to create media record: %w", err)
	}

	// Create upload policy
	policy, err := s.storage.CreateUploadPolicy(ctx, storageKey, mimeType, MaxUploadSize, UploadPolicyTTL)
	if err != nil {
		s.logger.Error("media_service_init_upload_policy_failed",
			"id", media.ID,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to create upload policy: %w", err)
	}

	s.logger.Info("media_service_init_upload_completed",
		"id", media.ID,
		"key", storageKey,
		"driver", s.storage.Driver(),
	)

	return &InitUploadResult{
		ID:     media.ID,
		Key:    storageKey,
		Upload: policy,
	}, nil
}

// CompleteUpload marks an upload as complete and verifies the file exists
func (s *MediaService) CompleteUpload(ctx context.Context, id uuid.UUID) (*domain.MediaFile, error) {
	s.logger.Info("media_service_complete_upload_started",
		"id", id,
	)

	// Get media record
	media, err := s.repo.GetByID(id)
	if err != nil {
		s.logger.Error("media_service_complete_upload_get_failed",
			"id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get media: %w", err)
	}
	if media == nil {
		s.logger.Warn("media_service_complete_upload_not_found",
			"id", id,
		)
		return nil, ErrMediaNotFound
	}

	// Check if already completed
	if media.Status == domain.MediaFileStatusReady {
		s.logger.Info("media_service_complete_upload_already_ready",
			"id", id,
		)
		return media, nil
	}

	// Verify file exists in storage (for S3)
	if s.storage.Driver() == "s3" {
		info, err := s.storage.HeadObject(ctx, media.StorageKey)
		if err != nil {
			s.logger.Error("media_service_complete_upload_head_failed",
				"id", id,
				"key", media.StorageKey,
				"error", err.Error(),
			)
			return nil, fmt.Errorf("failed to verify upload: %w", err)
		}
		if info == nil {
			s.logger.Warn("media_service_complete_upload_file_not_found",
				"id", id,
				"key", media.StorageKey,
			)
			return nil, ErrUploadNotFound
		}

		// Update size
		if info.Size > 0 {
			if err := s.repo.UpdateSizeBytes(id, info.Size); err != nil {
				s.logger.Error("media_service_complete_upload_update_size_failed",
					"id", id,
					"error", err.Error(),
				)
				// Non-fatal, continue
			}
			media.SizeBytes = &info.Size
		}
	}

	// Update status to ready
	if err := s.repo.UpdateStatus(id, domain.MediaFileStatusReady); err != nil {
		s.logger.Error("media_service_complete_upload_status_failed",
			"id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to update status: %w", err)
	}

	media.Status = domain.MediaFileStatusReady

	s.logger.Info("media_service_complete_upload_completed",
		"id", id,
		"key", media.StorageKey,
	)

	return media, nil
}

// Delete removes a media file (soft delete in DB, hard delete in storage)
func (s *MediaService) Delete(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("media_service_delete_started",
		"id", id,
	)

	// Get media record
	media, err := s.repo.GetByID(id)
	if err != nil {
		s.logger.Error("media_service_delete_get_failed",
			"id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to get media: %w", err)
	}
	if media == nil {
		s.logger.Warn("media_service_delete_not_found",
			"id", id,
		)
		return ErrMediaNotFound
	}

	// Delete from storage first
	if err := s.storage.DeleteObject(ctx, media.StorageKey); err != nil {
		s.logger.Error("media_service_delete_storage_failed",
			"id", id,
			"key", media.StorageKey,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to delete from storage: %w", err)
	}

	// Soft delete in DB
	if err := s.repo.SoftDelete(id); err != nil {
		s.logger.Error("media_service_delete_db_failed",
			"id", id,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to delete from database: %w", err)
	}

	s.logger.Info("media_service_delete_completed",
		"id", id,
		"key", media.StorageKey,
	)

	return nil
}

// GetURL returns a signed URL for reading a media file
func (s *MediaService) GetURL(ctx context.Context, id uuid.UUID) (*domain.MediaURL, error) {
	s.logger.Info("media_service_get_url_started",
		"id", id,
	)

	// Get media record
	media, err := s.repo.GetByID(id)
	if err != nil {
		s.logger.Error("media_service_get_url_get_failed",
			"id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get media: %w", err)
	}
	if media == nil || media.Status != domain.MediaFileStatusReady {
		s.logger.Warn("media_service_get_url_not_found_or_not_ready",
			"id", id,
			"media", media,
		)
		return nil, ErrMediaNotFound
	}

	// Get signed URL
	url, err := s.delivery.GetReadURL(ctx, media.StorageKey, s.signedTTL)
	if err != nil {
		s.logger.Error("media_service_get_url_sign_failed",
			"id", id,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to generate signed URL: %w", err)
	}

	s.logger.Info("media_service_get_url_completed",
		"id", id,
	)

	return &domain.MediaURL{
		ID:        media.ID,
		URL:       url,
		ExpiresIn: int(s.signedTTL.Seconds()),
	}, nil
}

// GetURLsResult contains the result of batch URL generation
type GetURLsResult struct {
	Items    []domain.MediaURL
	NotFound []uuid.UUID
}

// GetURLs returns signed URLs for multiple media files
func (s *MediaService) GetURLs(ctx context.Context, ids []uuid.UUID) (*GetURLsResult, error) {
	s.logger.Info("media_service_get_urls_started",
		"count", len(ids),
	)

	// Validate batch size
	if len(ids) > MaxBatchSize {
		s.logger.Warn("media_service_get_urls_batch_too_large",
			"count", len(ids),
			"max", MaxBatchSize,
		)
		return nil, ErrBatchTooLarge
	}

	// Deduplicate IDs
	seen := make(map[uuid.UUID]bool)
	var uniqueIDs []uuid.UUID
	for _, id := range ids {
		if !seen[id] {
			seen[id] = true
			uniqueIDs = append(uniqueIDs, id)
		}
	}

	// Get media records
	mediaList, notFound, err := s.repo.GetByIDs(uniqueIDs)
	if err != nil {
		s.logger.Error("media_service_get_urls_get_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to get media: %w", err)
	}

	// Generate URLs
	var items []domain.MediaURL
	for _, media := range mediaList {
		url, err := s.delivery.GetReadURL(ctx, media.StorageKey, s.signedTTL)
		if err != nil {
			s.logger.Error("media_service_get_urls_sign_failed",
				"id", media.ID,
				"error", err.Error(),
			)
			notFound = append(notFound, media.ID)
			continue
		}

		items = append(items, domain.MediaURL{
			ID:        media.ID,
			URL:       url,
			ExpiresIn: int(s.signedTTL.Seconds()),
		})
	}

	s.logger.Info("media_service_get_urls_completed",
		"found", len(items),
		"not_found", len(notFound),
	)

	return &GetURLsResult{
		Items:    items,
		NotFound: notFound,
	}, nil
}

// List returns media records with optional filters
func (s *MediaService) List(status *string, limit, offset int) ([]domain.MediaFile, error) {
	s.logger.Info("media_service_list_started",
		"status", status,
		"limit", limit,
		"offset", offset,
	)

	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	media, err := s.repo.List(status, limit, offset)
	if err != nil {
		s.logger.Error("media_service_list_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to list media: %w", err)
	}

	s.logger.Info("media_service_list_completed",
		"count", len(media),
	)

	return media, nil
}

// CreateFromMultipart creates a media record for a locally uploaded file
// Used for backward compatibility with the existing multipart upload
func (s *MediaService) CreateFromMultipart(ctx context.Context, filename string, originalName string, mimeType string, sizeBytes int64) (*domain.MediaFile, error) {
	s.logger.Info("media_service_create_from_multipart_started",
		"filename", filename,
		"original_name", originalName,
		"mime_type", mimeType,
		"size", sizeBytes,
	)

	// Get extension from filename
	ext := filepath.Ext(filename)

	// Create media record with ready status (file already uploaded)
	media := &domain.MediaFile{
		StorageKey:    filename,
		OriginalName:  &originalName,
		MimeType:      mimeType,
		Ext:           ext,
		SizeBytes:     &sizeBytes,
		StorageDriver: domain.StorageDriverLocal,
		Status:        domain.MediaFileStatusReady,
	}

	if err := s.repo.Create(media); err != nil {
		s.logger.Error("media_service_create_from_multipart_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to create media record: %w", err)
	}

	s.logger.Info("media_service_create_from_multipart_completed",
		"id", media.ID,
		"key", media.StorageKey,
	)

	return media, nil
}

// GetByID returns a media record by ID
func (s *MediaService) GetByID(ctx context.Context, id uuid.UUID) (*domain.MediaFile, error) {
	media, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get media: %w", err)
	}
	if media == nil {
		return nil, ErrMediaNotFound
	}
	return media, nil
}
