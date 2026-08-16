package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port                int
	DatabaseURL         string
	SupabaseJWKSURL     string
	SupabaseJWTIssuer   string
	SupabaseJWTAudience string
	AppOrigin           string
	GeminiAPIKey        string
	GeminiModel         string
	GeminiLiveModel     string
	ShutdownTimeout     time.Duration
}

const (
	defaultPort            = 8080
	defaultShutdownTimeout = 10 * time.Second
	defaultGeminiModel     = "gemini-3.5-flash"
	defaultGeminiLive      = "gemini-3.1-flash-live-preview"
	maxPort                = 65535
)

var ErrInvalidConfig = errors.New("invalid config")

func Load() (Config, error) {
	port, err := intFromEnv("PORT", defaultPort)
	if err != nil {
		return Config{}, err
	}

	if port < 1 || port > maxPort {
		return Config{}, fmt.Errorf("PORT %d out of range 1-%d: %w", port, maxPort, ErrInvalidConfig)
	}

	databaseURL, err := stringFromEnv("DATABASE_URL")
	if err != nil {
		return Config{}, err
	}

	jwksURL, err := stringFromEnv("SUPABASE_JWKS_URL")
	if err != nil {
		return Config{}, err
	}

	issuer, err := stringFromEnv("SUPABASE_JWT_ISSUER")
	if err != nil {
		return Config{}, err
	}

	audience, err := stringFromEnv("SUPABASE_JWT_AUDIENCE")
	if err != nil {
		return Config{}, err
	}

	appOrigin, err := stringFromEnv("APP_ORIGIN")
	if err != nil {
		return Config{}, err
	}

	geminiKey, err := stringFromEnv("GEMINI_API_KEY")
	if err != nil {
		return Config{}, err
	}

	geminiModel := os.Getenv("GEMINI_MODEL")
	if geminiModel == "" {
		geminiModel = defaultGeminiModel
	}

	geminiLive := os.Getenv("GEMINI_LIVE_MODEL")
	if geminiLive == "" {
		geminiLive = defaultGeminiLive
	}

	return Config{
		Port:                port,
		DatabaseURL:         databaseURL,
		SupabaseJWKSURL:     jwksURL,
		SupabaseJWTIssuer:   issuer,
		SupabaseJWTAudience: audience,
		AppOrigin:           appOrigin,
		GeminiAPIKey:        geminiKey,
		GeminiModel:         geminiModel,
		GeminiLiveModel:     geminiLive,
		ShutdownTimeout:     defaultShutdownTimeout,
	}, nil
}

func stringFromEnv(key string) (string, error) {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return "", fmt.Errorf("%s is required: %w", key, ErrInvalidConfig)
	}

	return value, nil
}

func intFromEnv(key string, fallback int) (int, error) {
	raw, ok := os.LookupEnv(key)
	if !ok || raw == "" {
		return fallback, nil
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer, got %q: %w", key, raw, ErrInvalidConfig)
	}

	return value, nil
}
