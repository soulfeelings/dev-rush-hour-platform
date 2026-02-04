package storage

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"time"
)

// LocalStorage implements MediaStorage for local filesystem
type LocalStorage struct {
	uploadDir string
	publicURL string
	logger    *slog.Logger
}

// NewLocalStorage creates a new local storage instance
func NewLocalStorage(uploadDir, publicURL string) (*LocalStorage, error) {
	// Create directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	return &LocalStorage{
		uploadDir: uploadDir,
		publicURL: publicURL,
		logger:    slog.Default(),
	}, nil
}

// CreateUploadPolicy for local storage returns empty policy
// Local storage uses traditional multipart upload instead of presigned URLs
func (s *LocalStorage) CreateUploadPolicy(ctx context.Context, key, contentType string, maxSizeBytes int64, expires time.Duration) (*UploadPolicy, error) {
	s.logger.Info("local_storage_create_upload_policy",
		"key", key,
		"content_type", contentType,
	)

	// Local storage doesn't use presigned uploads
	// Return the local upload endpoint URL
	return &UploadPolicy{
		URL:    fmt.Sprintf("%s/upload", s.publicURL),
		Fields: nil,
	}, nil
}

// DeleteObject removes a file from local storage
func (s *LocalStorage) DeleteObject(ctx context.Context, key string) error {
	s.logger.Info("local_storage_delete_object_started",
		"key", key,
	)

	filePath := filepath.Join(s.uploadDir, key)

	// Check path safety
	if filepath.Base(key) != key {
		s.logger.Warn("local_storage_delete_invalid_key",
			"key", key,
		)
		return fmt.Errorf("invalid key: path traversal detected")
	}

	if err := os.Remove(filePath); err != nil {
		if os.IsNotExist(err) {
			s.logger.Warn("local_storage_delete_not_found",
				"key", key,
			)
			return nil // File already doesn't exist
		}
		s.logger.Error("local_storage_delete_failed",
			"key", key,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to delete file: %w", err)
	}

	s.logger.Info("local_storage_delete_object_completed",
		"key", key,
	)

	return nil
}

// HeadObject checks if a file exists and returns its metadata
func (s *LocalStorage) HeadObject(ctx context.Context, key string) (*ObjectInfo, error) {
	s.logger.Info("local_storage_head_object_started",
		"key", key,
	)

	// Check path safety
	if filepath.Base(key) != key {
		s.logger.Warn("local_storage_head_invalid_key",
			"key", key,
		)
		return nil, fmt.Errorf("invalid key: path traversal detected")
	}

	filePath := filepath.Join(s.uploadDir, key)

	info, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			s.logger.Warn("local_storage_head_not_found",
				"key", key,
			)
			return nil, nil
		}
		s.logger.Error("local_storage_head_failed",
			"key", key,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}

	s.logger.Info("local_storage_head_object_completed",
		"key", key,
		"size", info.Size(),
	)

	return &ObjectInfo{
		Key:  key,
		Size: info.Size(),
	}, nil
}

// Driver returns the storage driver name
func (s *LocalStorage) Driver() string {
	return "local"
}

// GetFilePath returns the full file path for a key (local storage specific)
func (s *LocalStorage) GetFilePath(key string) string {
	return filepath.Join(s.uploadDir, key)
}

// GetPublicURL returns the public URL for a key (local storage specific)
func (s *LocalStorage) GetPublicURL(key string) string {
	return fmt.Sprintf("%s/%s", s.publicURL, key)
}
