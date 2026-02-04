package storage

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

// S3Storage implements MediaStorage for AWS S3 or compatible storage
type S3Storage struct {
	client       *s3.Client
	presignClient *s3.PresignClient
	bucket       string
	region       string
	logger       *slog.Logger
}

// S3Config holds S3 connection configuration
type S3Config struct {
	Bucket          string
	Region          string
	Endpoint        string // Optional: for S3-compatible services
	AccessKeyID     string
	SecretAccessKey string
	ForcePathStyle  bool   // For S3-compatible services like MinIO
}

// NewS3Storage creates a new S3 storage instance
func NewS3Storage(ctx context.Context, cfg S3Config) (*S3Storage, error) {
	logger := slog.Default()

	logger.Info("s3_storage_init_started",
		"bucket", cfg.Bucket,
		"region", cfg.Region,
		"endpoint", cfg.Endpoint,
	)

	// Build AWS config
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
		logger.Error("s3_storage_config_load_failed",
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	// Create S3 client options
	s3Opts := []func(*s3.Options){}

	if cfg.Endpoint != "" {
		s3Opts = append(s3Opts, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = cfg.ForcePathStyle
		})
	}

	client := s3.NewFromConfig(awsCfg, s3Opts...)
	presignClient := s3.NewPresignClient(client)

	logger.Info("s3_storage_init_completed",
		"bucket", cfg.Bucket,
	)

	return &S3Storage{
		client:       client,
		presignClient: presignClient,
		bucket:       cfg.Bucket,
		region:       cfg.Region,
		logger:       logger,
	}, nil
}

// CreateUploadPolicy creates a presigned POST policy for direct upload to S3
func (s *S3Storage) CreateUploadPolicy(ctx context.Context, key, contentType string, maxSizeBytes int64, expires time.Duration) (*UploadPolicy, error) {
	s.logger.Info("s3_storage_create_upload_policy_started",
		"key", key,
		"content_type", contentType,
		"max_size", maxSizeBytes,
		"expires", expires,
	)

	// Use presigned PUT URL instead of POST for simplicity
	// The client can use this URL to upload directly via PUT request
	presignReq, err := s.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(maxSizeBytes),
	}, s3.WithPresignExpires(expires))

	if err != nil {
		s.logger.Error("s3_storage_create_upload_policy_failed",
			"key", key,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to create presigned URL: %w", err)
	}

	s.logger.Info("s3_storage_create_upload_policy_completed",
		"key", key,
		"url_preview", presignReq.URL[:min(100, len(presignReq.URL))]+"...",
	)

	return &UploadPolicy{
		URL: presignReq.URL,
		Fields: map[string]string{
			"Content-Type": contentType,
		},
	}, nil
}

// DeleteObject removes an object from S3
func (s *S3Storage) DeleteObject(ctx context.Context, key string) error {
	s.logger.Info("s3_storage_delete_object_started",
		"key", key,
		"bucket", s.bucket,
	)

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		s.logger.Error("s3_storage_delete_object_failed",
			"key", key,
			"error", err.Error(),
		)
		return fmt.Errorf("failed to delete object: %w", err)
	}

	s.logger.Info("s3_storage_delete_object_completed",
		"key", key,
	)

	return nil
}

// HeadObject checks if an object exists and returns its metadata
func (s *S3Storage) HeadObject(ctx context.Context, key string) (*ObjectInfo, error) {
	s.logger.Info("s3_storage_head_object_started",
		"key", key,
		"bucket", s.bucket,
	)

	result, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		// Check if object not found
		s.logger.Warn("s3_storage_head_object_failed",
			"key", key,
			"error", err.Error(),
		)
		return nil, nil // Return nil for not found, consistent with local storage
	}

	var contentType string
	if result.ContentType != nil {
		contentType = *result.ContentType
	}

	var etag string
	if result.ETag != nil {
		etag = *result.ETag
	}

	var size int64
	if result.ContentLength != nil {
		size = *result.ContentLength
	}

	s.logger.Info("s3_storage_head_object_completed",
		"key", key,
		"size", size,
		"content_type", contentType,
	)

	return &ObjectInfo{
		Key:         key,
		Size:        size,
		ContentType: contentType,
		ETag:        etag,
	}, nil
}

// Driver returns the storage driver name
func (s *S3Storage) Driver() string {
	return "s3"
}
