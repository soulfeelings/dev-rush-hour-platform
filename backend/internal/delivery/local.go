package delivery

import (
	"context"
	"fmt"
	"log/slog"
	"time"
)

// LocalDelivery implements MediaDelivery for local filesystem
// Returns direct URLs without signing (for development)
type LocalDelivery struct {
	publicURL string
	logger    *slog.Logger
}

// NewLocalDelivery creates a new local delivery instance
func NewLocalDelivery(publicURL string) *LocalDelivery {
	return &LocalDelivery{
		publicURL: publicURL,
		logger:    slog.Default(),
	}
}

// GetReadURL returns a direct public URL for local storage
// No signing needed for local development
func (d *LocalDelivery) GetReadURL(ctx context.Context, key string, expires time.Duration) (string, error) {
	d.logger.Info("local_delivery_get_read_url",
		"key", key,
		"expires", expires,
	)

	return fmt.Sprintf("%s/%s", d.publicURL, key), nil
}

// Driver returns the delivery driver name
func (d *LocalDelivery) Driver() string {
	return "local"
}
