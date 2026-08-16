package http

import (
	"net/http"
	"strings"
)

func withCORS(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get("Origin") == allowedOrigin {
				header := w.Header()
				header.Set("Access-Control-Allow-Origin", allowedOrigin)
				header.Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				header.Set("Access-Control-Max-Age", "600")
				header.Add("Vary", "Origin")
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func originHost(origin string) string {
	trimmed := strings.TrimPrefix(strings.TrimPrefix(origin, "https://"), "http://")

	return trimmed
}
