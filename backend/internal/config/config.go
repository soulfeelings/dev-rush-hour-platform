package config

import (
	"os"
	"strconv"
)

type Config struct {
	DB     DBConfig
	Server ServerConfig
	Admin  AdminConfig
	Media  MediaConfig
	S3     S3Config
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type ServerConfig struct {
	Port string
}

type AdminConfig struct {
	APIKey string
}

type MediaConfig struct {
	// Storage driver: "local" or "s3"
	Driver string

	// Local storage settings
	UploadDir string
	PublicURL string

	// Signed URL TTL in seconds (default 3600 = 1 hour)
	SignedTTLSeconds int

	// Delivery mode: "local", "s3_presign", "cloudfront"
	DeliveryMode string
}

type S3Config struct {
	Bucket          string
	Region          string
	Endpoint        string // Optional: for S3-compatible services (e.g., MinIO)
	AccessKeyID     string
	SecretAccessKey string
	ForcePathStyle  bool // For S3-compatible services
}

// CloudFront config placeholder for future use
type CloudFrontConfig struct {
	DistributionDomain string
	KeyPairID          string
	PrivateKeyPath     string
}

func Load() *Config {
	return &Config{
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "rushhour"),
			Password: getEnv("DB_PASSWORD", "rushhour_dev"),
			Name:     getEnv("DB_NAME", "rushhour_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		Admin: AdminConfig{
			APIKey: getEnv("ADMIN_API_KEY", ""),
		},
		Media: MediaConfig{
			Driver:           getEnv("MEDIA_DRIVER", "local"),
			UploadDir:        getEnv("MEDIA_UPLOAD_DIR", "./uploads"),
			PublicURL:        getEnv("MEDIA_PUBLIC_URL", "http://localhost:8080/api/media"),
			SignedTTLSeconds: getEnvInt("MEDIA_SIGNED_TTL_SECONDS", 3600),
			DeliveryMode:     getEnv("MEDIA_DELIVERY", ""), // Auto-detected based on driver if empty
		},
		S3: S3Config{
			Bucket:          getEnv("S3_BUCKET", ""),
			Region:          getEnv("S3_REGION", "us-east-1"),
			Endpoint:        getEnv("S3_ENDPOINT", ""), // Empty for AWS, set for compatible services
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
			ForcePathStyle:  getEnvBool("S3_FORCE_PATH_STYLE", false),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}
