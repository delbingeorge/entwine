package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
)

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(ctx context.Context, logger *slog.Logger, w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(body); err != nil {
		logger.ErrorContext(ctx, "write response body", slog.Any("error", err))
	}
}

func writeError(ctx context.Context, logger *slog.Logger, w http.ResponseWriter, status int, code, message string) {
	writeJSON(ctx, logger, w, status, errorBody{Code: code, Message: message})
}
