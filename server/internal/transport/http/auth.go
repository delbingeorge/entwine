package http

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/octane/entwine/server/internal/domain"
)

type TokenVerifier interface {
	Verify(ctx context.Context, rawToken string) (domain.Identity, error)
}

type UserEnsurer interface {
	Ensure(ctx context.Context, identity domain.Identity) (domain.User, bool, error)
}

type caller struct {
	user  domain.User
	isNew bool
}

type contextKey struct{}

var callerContextKey contextKey

func callerFromContext(ctx context.Context) (caller, bool) {
	value, ok := ctx.Value(callerContextKey).(caller)

	return value, ok
}

func requireUser(logger *slog.Logger, verifier TokenVerifier, users UserEnsurer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			rawToken, ok := bearerToken(r)
			if !ok {
				writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "Missing bearer token.")
				return
			}

			identity, err := verifier.Verify(ctx, rawToken)
			if err != nil {
				logger.WarnContext(ctx, "token rejected", slog.Any("error", err))
				writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "Invalid or expired token.")
				return
			}

			user, isNew, err := users.Ensure(ctx, identity)
			if err != nil {
				logger.ErrorContext(ctx, "ensure user", slog.Any("error", err))
				writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "Something went wrong.")
				return
			}

			authenticated := context.WithValue(ctx, callerContextKey, caller{user: user, isNew: isNew})

			next.ServeHTTP(w, r.WithContext(authenticated))
		})
	}
}

func bearerToken(r *http.Request) (string, bool) {
	header := r.Header.Get("Authorization")

	prefix := "Bearer "
	if len(header) <= len(prefix) || !strings.EqualFold(header[:len(prefix)], prefix) {
		return "", false
	}

	token := strings.TrimSpace(header[len(prefix):])

	return token, token != ""
}
