package config

import (
	"os"
	"strconv"
)

type Config struct {
	DB                DBConfig
	Server            ServerConfig
	Admin             AdminConfig
	CORS              CORSConfig
	Cookie            CookieConfig
	Media             MediaConfig
	CloudflareImages  CloudflareImagesConfig
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
	JWTSecret       string
	SuperadminEmail string
}

type CORSConfig struct {
	AllowedOrigin string
}

type CookieConfig struct {
	SameSite string // strict | lax | none
	Secure   bool
}

type MediaConfig struct {
	// Storage driver: "local" or "cloudflare_images"
	Driver string

	// Local storage settings
	UploadDir string
	PublicURL string

	// Signed URL TTL in seconds (default 3600 = 1 hour)
	SignedTTLSeconds int

	// Delivery mode (auto-detected from driver if empty)
	DeliveryMode string
}

type CloudflareImagesConfig struct {
	AccountID  string
	APIToken   string
	AccountHash string // For delivery URL: imagedelivery.net/{hash}/{id}
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
			JWTSecret:       getEnv("JWT_SECRET", ""),
			SuperadminEmail: getEnv("SUPERADMIN_EMAIL", ""),
		},
		CORS: CORSConfig{
			AllowedOrigin: getEnv("CORS_ALLOWED_ORIGIN", "http://localhost:5173"),
		},
		Cookie: CookieConfig{
			SameSite: getEnv("COOKIE_SAME_SITE", "lax"),
			Secure:   getEnvBool("COOKIE_SECURE", false),
		},
		Media: MediaConfig{
			Driver:           getEnv("MEDIA_DRIVER", "local"),
			UploadDir:        getEnv("MEDIA_UPLOAD_DIR", "./uploads"),
			PublicURL:        getEnv("MEDIA_PUBLIC_URL", "http://localhost:8080/api/media"),
			SignedTTLSeconds: getEnvInt("MEDIA_SIGNED_TTL_SECONDS", 3600),
			DeliveryMode:     getEnv("MEDIA_DELIVERY", ""),
		},
		CloudflareImages: CloudflareImagesConfig{
			AccountID:   getEnv("CLOUDFLARE_ACCOUNT_ID", ""),
			APIToken:    getEnv("CLOUDFLARE_API_TOKEN", ""),
			AccountHash: getEnv("CLOUDFLARE_IMAGES_ACCOUNT_HASH", ""),
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
