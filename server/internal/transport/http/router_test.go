package http_test

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	transporthttp "github.com/octane/entwine/server/internal/transport/http"
)

func TestHealth(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		path       string
		wantStatus int
		wantBody   string
	}{
		{name: "ok", method: http.MethodGet, path: "/v1/health", wantStatus: http.StatusOK, wantBody: "{\"status\":\"ok\"}\n"},
		{name: "wrong method", method: http.MethodPost, path: "/v1/health", wantStatus: http.StatusMethodNotAllowed},
		{name: "unknown path", method: http.MethodGet, path: "/v1/nope", wantStatus: http.StatusNotFound},
	}

	router := transporthttp.NewRouter(slog.New(slog.DiscardHandler))

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, httptest.NewRequest(test.method, test.path, nil))

			if recorder.Code != test.wantStatus {
				t.Fatalf("got status %d, want %d", recorder.Code, test.wantStatus)
			}

			if test.wantBody == "" {
				return
			}

			body, err := io.ReadAll(recorder.Body)
			if err != nil {
				t.Fatalf("read body: %v", err)
			}

			if string(body) != test.wantBody {
				t.Errorf("got body %q, want %q", body, test.wantBody)
			}
		})
	}
}
