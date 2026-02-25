package delivery

import "context"

// MediaDelivery defines the interface for generating read URLs for media
type MediaDelivery interface {
	// GetReadURL returns a public URL for reading a media object
	GetReadURL(ctx context.Context, key string) (string, error)

	// Driver returns the delivery driver name
	Driver() string
}
