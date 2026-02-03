package delivery

import (
	"context"
	"fmt"
	"log/slog"
	"time"
)

// CloudFrontDelivery implements MediaDelivery using CloudFront signed URLs
// This is a placeholder for future CloudFront integration
type CloudFrontDelivery struct {
	distributionDomain string
	keyPairID          string
	privateKey         []byte
	logger             *slog.Logger
}

// CloudFrontConfig holds CloudFront configuration
type CloudFrontConfig struct {
	DistributionDomain string // e.g., "d111111abcdef8.cloudfront.net"
	KeyPairID          string // CloudFront key pair ID
	PrivateKeyPath     string // Path to private key PEM file
}

// NewCloudFrontDelivery creates a new CloudFront delivery instance
// NOTE: This is a placeholder implementation for future use
func NewCloudFrontDelivery(cfg CloudFrontConfig) (*CloudFrontDelivery, error) {
	logger := slog.Default()

	logger.Warn("cloudfront_delivery_init",
		"status", "not_implemented",
		"message", "CloudFront delivery is not yet implemented, use S3 presign instead",
	)

	return nil, fmt.Errorf("CloudFront delivery is not yet implemented")
}

// GetReadURL generates a CloudFront signed URL
// NOTE: Not implemented yet
func (d *CloudFrontDelivery) GetReadURL(ctx context.Context, key string, expires time.Duration) (string, error) {
	d.logger.Warn("cloudfront_delivery_get_read_url",
		"status", "not_implemented",
	)

	// Placeholder: would use crypto/rsa to sign URL with private key
	// URL format: https://{domain}/{key}?Expires={}&Signature={}&Key-Pair-Id={}

	return "", fmt.Errorf("CloudFront delivery is not yet implemented")
}

// Driver returns the delivery driver name
func (d *CloudFrontDelivery) Driver() string {
	return "cloudfront"
}
