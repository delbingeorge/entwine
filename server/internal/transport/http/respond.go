package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
)

func writeJSON(ctx context.Context, logger *slog.Logger, w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(body); err != nil {
		logger.ErrorContext(ctx, "write response body", slog.Any("error", err))
	}
}
