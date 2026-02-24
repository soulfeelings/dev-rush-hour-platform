package storage

import (
	"context"
	"time"
)

// MediaStorage defines the interface for object storage operations
type MediaStorage interface {
	// CreateUploadPolicy creates a presigned upload policy for direct client upload
	// For Local/CF proxy: returns backend upload URL
	CreateUploadPolicy(ctx context.Context, key, contentType string, maxSizeBytes int64, expires time.Duration) (*UploadPolicy, error)

	// DeleteObject removes an object from storage
	DeleteObject(ctx context.Context, key string) error

	// HeadObject checks if an object exists and returns its metadata
	HeadObject(ctx context.Context, key string) (*ObjectInfo, error)

	// Driver returns the storage driver name
	Driver() string
}

// UploadPolicy represents presigned upload credentials
type UploadPolicy struct {
	URL    string            `json:"url"`
	Fields map[string]string `json:"fields,omitempty"`
}

// ObjectInfo contains metadata about a stored object
type ObjectInfo struct {
	Key         string
	Size        int64
	ContentType string
	ETag        string
}
