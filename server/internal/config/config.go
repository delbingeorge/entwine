package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port            int
	ShutdownTimeout time.Duration
}

const (
	defaultPort            = 8080
	defaultShutdownTimeout = 10 * time.Second
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

	return Config{
		Port:            port,
		ShutdownTimeout: defaultShutdownTimeout,
	}, nil
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
