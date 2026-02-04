package delivery

import (
	"context"
	"time"
)

// MediaDelivery defines the interface for generating read URLs for media
type MediaDelivery interface {
	// GetReadURL generates a signed URL for reading a media object
	GetReadURL(ctx context.Context, key string, expires time.Duration) (string, error)

	// Driver returns the delivery driver name
	Driver() string
}
