package http

import (
	"log/slog"
	"net/http"
)

func NewRouter(logger *slog.Logger) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", handleHealth(logger))

	return mux
}

func handleHealth(logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(r.Context(), logger, w, http.StatusOK, map[string]string{"status": "ok"})
	}
}
