package config_test

import (
	"errors"
	"os"
	"testing"

	"github.com/octane/entwine/server/internal/config"
)

func TestLoad(t *testing.T) {
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
