package delivery

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3PresignDelivery implements MediaDelivery using S3 presigned GET URLs
type S3PresignDelivery struct {
	presignClient *s3.PresignClient
	bucket        string
	logger        *slog.Logger
}

// S3PresignConfig holds S3 configuration for presigned URL generation
type S3PresignConfig struct {
	Bucket          string
	Region          string
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	ForcePathStyle  bool
}

// NewS3PresignDelivery creates a new S3 presign delivery instance
func NewS3PresignDelivery(ctx context.Context, cfg S3PresignConfig) (*S3PresignDelivery, error) {
	logger := slog.Default()

	logger.Info("s3_presign_delivery_init_started",
		"bucket", cfg.Bucket,
		"region", cfg.Region,
	)

	awsOpts := []func(*config.LoadOptions) error{
		config.WithRegion(cfg.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		)),
	}

	awsCfg, err := config.LoadDefaultConfig(ctx, awsOpts...)
	if err != nil {
		logger.Error("s3_presign_delivery_config_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	s3Opts := []func(*s3.Options){}
	if cfg.Endpoint != "" {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = cfg.ForcePathStyle
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)
	presignClient := s3.NewPresignClient(client)

	logger.Info("s3_presign_delivery_init_completed",
		"bucket", cfg.Bucket,
	)

	return &S3PresignDelivery{
		presignClient: presignClient,
		bucket:        cfg.Bucket,
		logger:        logger,
	}, nil
}

// GetReadURL generates a presigned GET URL for reading an object from S3
func (d *S3PresignDelivery) GetReadURL(ctx context.Context, key string, expires time.Duration) (string, error) {
	d.logger.Info("s3_presign_delivery_get_read_url_started",
		"key", key,
		"bucket", d.bucket,
		"expires", expires,
	)

	presignReq, err := d.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(d.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expires))

	if err != nil {
		d.logger.Error("s3_presign_delivery_get_read_url_failed",
			"key", key,
			"error", err.Error(),
		)
		return "", fmt.Errorf("failed to create presigned URL: %w", err)
	}

	d.logger.Info("s3_presign_delivery_get_read_url_completed",
		"key", key,
	)

	return presignReq.URL, nil
}

// Driver returns the delivery driver name
func (d *S3PresignDelivery) Driver() string {
	return "s3_presign"
}
