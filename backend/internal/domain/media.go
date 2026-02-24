package domain

import (
	"time"

	"github.com/google/uuid"
)

// MediaFile represents a stored file in the media service
// Named MediaFile to avoid conflict with existing Media struct for project galleries
type MediaFile struct {
	ID            uuid.UUID
	StorageKey    string
	OriginalName  *string
	MimeType      string
	Ext           string
	SizeBytes     *int64
	StorageDriver StorageDriver
	Status        MediaFileStatus
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time
}

type StorageDriver string

const (
	StorageDriverLocal          StorageDriver = "local"
	StorageDriverCloudflareImages StorageDriver = "cloudflare_images"
)

type MediaFileStatus string

const (
	MediaFileStatusPending MediaFileStatus = "pending"
	MediaFileStatusReady   MediaFileStatus = "ready"
	MediaFileStatusDeleted MediaFileStatus = "deleted"
)

// UploadPolicy represents presigned upload credentials
type UploadPolicy struct {
	URL    string            `json:"url"`
	Fields map[string]string `json:"fields,omitempty"`
}

// MediaURL represents a signed URL for reading media
type MediaURL struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	ExpiresIn int       `json:"expiresIn"`
}

// AllowedMimeTypes maps mime types to file extensions
var AllowedMimeTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

// IsAllowedMimeType checks if the mime type is allowed
func IsAllowedMimeType(mimeType string) bool {
	_, ok := AllowedMimeTypes[mimeType]
	return ok
}

// GetExtForMimeType returns the file extension for a mime type
func GetExtForMimeType(mimeType string) string {
	if ext, ok := AllowedMimeTypes[mimeType]; ok {
		return ext
	}
	return ""
}
