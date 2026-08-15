package config_test

import (
	"errors"
	"os"
	"testing"

	"github.com/octane/entwine/server/internal/config"
)

func setRequired(t *testing.T) {
	t.Helper()

	t.Setenv("DATABASE_URL", "postgres://entwine:entwine@localhost:5432/entwine?sslmode=disable")
	t.Setenv("SUPABASE_JWKS_URL", "https://project.supabase.co/auth/v1/.well-known/jwks.json")
	t.Setenv("SUPABASE_JWT_ISSUER", "https://project.supabase.co/auth/v1")
	t.Setenv("SUPABASE_JWT_AUDIENCE", "authenticated")
	t.Setenv("APP_ORIGIN", "http://localhost:5173")
}

func TestLoadPort(t *testing.T) {
	tests := []struct {
		name     string
		port     string
		unset    bool
		wantPort int
		wantErr  error
	}{
		{name: "defaults when unset", unset: true, wantPort: 8080},
		{name: "reads port", port: "9090", wantPort: 9090},
		{name: "empty falls back", port: "", wantPort: 8080},
		{name: "rejects non-integer", port: "http", wantErr: config.ErrInvalidConfig},
		{name: "rejects out of range", port: "70000", wantErr: config.ErrInvalidConfig},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			setRequired(t)

			// t.Setenv first so its cleanup restores the ambient value.
			t.Setenv("PORT", test.port)
			if test.unset {
				if err := os.Unsetenv("PORT"); err != nil {
					t.Fatalf("unsetenv: %v", err)
				}
			}

			got, err := config.Load()

			if test.wantErr != nil {
				if !errors.Is(err, test.wantErr) {
					t.Fatalf("got error %v, want %v", err, test.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got.Port != test.wantPort {
				t.Errorf("got port %d, want %d", got.Port, test.wantPort)
			}
		})
	}
}

func TestLoadRequiresSecrets(t *testing.T) {
	for _, key := range []string{
		"DATABASE_URL",
		"SUPABASE_JWKS_URL",
		"SUPABASE_JWT_ISSUER",
		"SUPABASE_JWT_AUDIENCE",
		"APP_ORIGIN",
	} {
		t.Run("missing "+key, func(t *testing.T) {
			setRequired(t)
			t.Setenv(key, "")

			if _, err := config.Load(); !errors.Is(err, config.ErrInvalidConfig) {
				t.Fatalf("got error %v, want %v", err, config.ErrInvalidConfig)
			}
		})
	}
}

func TestLoadReadsSupabaseSettings(t *testing.T) {
	setRequired(t)

	got, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if got.SupabaseJWTAudience != "authenticated" {
		t.Errorf("got audience %q, want %q", got.SupabaseJWTAudience, "authenticated")
	}

	if got.DatabaseURL == "" {
		t.Error("got empty database url")
	}
}
