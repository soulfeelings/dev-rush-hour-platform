package delivery

import (
	"context"
	"fmt"
	"log/slog"
)

// CFImagesDelivery implements MediaDelivery for Cloudflare Images
// Returns base URL without variant (frontend appends variant suffix)
// expires is ignored - CF URLs don't expire
type CFImagesDelivery struct {
	accountHash string
	logger      *slog.Logger
}

// NewCFImagesDelivery creates a new Cloudflare Images delivery instance
func NewCFImagesDelivery(accountHash string) *CFImagesDelivery {
	return &CFImagesDelivery{
		accountHash: accountHash,
		logger:      slog.Default(),
	}
}

// GetReadURL returns base URL: https://imagedelivery.net/{hash}/{imageID}
// Frontend appends /{variant} (e.g. /public, /thumbnail, /card)
func (d *CFImagesDelivery) GetReadURL(ctx context.Context, imageID string) (string, error) {
	d.logger.Info("cf_images_delivery_get_read_url",
		"image_id", imageID,
	)

	return fmt.Sprintf("https://imagedelivery.net/%s/%s", d.accountHash, imageID), nil
}

// Driver returns the delivery driver name
func (d *CFImagesDelivery) Driver() string {
	return "cloudflare_images"
}
