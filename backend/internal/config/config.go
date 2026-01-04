package config

import (
	"os"
)

type Config struct {
	DB DBConfig
	Server ServerConfig
	Admin AdminConfig
	Media MediaConfig
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
	UploadDir string
	PublicURL string
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
			UploadDir: getEnv("MEDIA_UPLOAD_DIR", "./uploads"),
			PublicURL: getEnv("MEDIA_PUBLIC_URL", "http://localhost:8080/api/media"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

