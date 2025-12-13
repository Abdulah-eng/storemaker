package config

import (
	"os"
)

type Config struct {
	DatabaseURL  string
	JWTSecret    string
	Port         string
	Environment  string
	OpenAIAPIKey string
	ServerURL    string
}

func LoadConfig() *Config {
	return &Config{
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:password@localhost:5432/storemaker?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
		Port:         getEnv("PORT", "8080"),
		Environment:  getEnv("ENVIRONMENT", "development"),
		OpenAIAPIKey: getEnv("OPENAI_API_KEY", ""),
		ServerURL:    getEnv("SERVER_URL", "http://localhost:8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
