package http_test

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	transporthttp "github.com/octane/entwine/server/internal/transport/http"
)

type fakeVerifier struct {
	identity domain.Identity
	err      error
	seen     string
}

func (f *fakeVerifier) Verify(_ context.Context, rawToken string) (domain.Identity, error) {
	f.seen = rawToken

	if f.err != nil {
		return domain.Identity{}, f.err
	}

	return f.identity, nil
}

type fakeEnsurer struct {
	user  domain.User
	isNew bool
	err   error
	calls int
}

func (f *fakeEnsurer) Ensure(_ context.Context, _ domain.Identity) (domain.User, bool, error) {
	f.calls++

	if f.err != nil {
		return domain.User{}, false, f.err
	}

	return f.user, f.isNew, nil
}

const testOrigin = "http://localhost:5173"

func newTestRouter(verifier transporthttp.TokenVerifier, users transporthttp.UserEnsurer) http.Handler {
	return transporthttp.NewRouter(
		slog.New(slog.DiscardHandler), verifier, users, &fakeProfiles{}, testOrigin)
}

func newProfileRouter(profiles transporthttp.ProfileService) http.Handler {
	verifier := &fakeVerifier{identity: domain.Identity{ID: "sub-1", Email: "dev@entwine.dev"}}
	users := &fakeEnsurer{user: domain.User{ID: "sub-1", Email: "dev@entwine.dev"}}

	return transporthttp.NewRouter(
		slog.New(slog.DiscardHandler), verifier, users, profiles, testOrigin)
}

func TestHealthNeedsNoToken(t *testing.T) {
	router := newTestRouter(&fakeVerifier{}, &fakeEnsurer{})
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/v1/health", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d", recorder.Code, http.StatusOK)
	}
}

func TestMeRejectsBadTokens(t *testing.T) {
	tests := []struct {
		name        string
		authHeader  string
		verifyErr   error
		wantEnsures int
	}{
		{name: "no header"},
		{name: "wrong scheme", authHeader: "Basic abc123"},
		{name: "empty bearer", authHeader: "Bearer "},
		{name: "rejected token", authHeader: "Bearer bad", verifyErr: domain.ErrUnauthorized},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			users := &fakeEnsurer{}
			router := newTestRouter(&fakeVerifier{err: test.verifyErr}, users)

			request := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
			if test.authHeader != "" {
				request.Header.Set("Authorization", test.authHeader)
			}

			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, request)

			if recorder.Code != http.StatusUnauthorized {
				t.Fatalf("got status %d, want %d", recorder.Code, http.StatusUnauthorized)
			}

			var body struct {
				Code string `json:"code"`
			}

			if err := json.NewDecoder(recorder.Body).Decode(&body); err != nil {
				t.Fatalf("decode body: %v", err)
			}

			if body.Code != "unauthorized" {
				t.Errorf("got code %q, want %q", body.Code, "unauthorized")
			}

			if users.calls != test.wantEnsures {
				t.Errorf("got %d ensure calls, want %d", users.calls, test.wantEnsures)
			}
		})
	}
}

func TestMeReturnsTheUser(t *testing.T) {
	createdAt := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)
	verifier := &fakeVerifier{identity: domain.Identity{ID: "sub-1", Email: "dev@entwine.dev"}}
	users := &fakeEnsurer{user: domain.User{ID: "sub-1", Email: "dev@entwine.dev", CreatedAt: createdAt}}

	request := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	request.Header.Set("Authorization", "Bearer good-token")

	recorder := httptest.NewRecorder()
	newTestRouter(verifier, users).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d", recorder.Code, http.StatusOK)
	}

	if verifier.seen != "good-token" {
		t.Errorf("got token %q, want %q", verifier.seen, "good-token")
	}

	if users.calls != 1 {
		t.Errorf("got %d ensure calls, want 1", users.calls)
	}

	var body struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}

	if err := json.NewDecoder(recorder.Body).Decode(&body); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	if body.ID != "sub-1" || body.Email != "dev@entwine.dev" {
		t.Errorf("got body %+v, want sub-1 and dev@entwine.dev", body)
	}
}

func TestMeFailsClosedWhenTheUserCannotBeStored(t *testing.T) {
	verifier := &fakeVerifier{identity: domain.Identity{ID: "sub-1", Email: "dev@entwine.dev"}}
	users := &fakeEnsurer{err: errors.New("database down")}

	request := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	request.Header.Set("Authorization", "Bearer good-token")

	recorder := httptest.NewRecorder()
	newTestRouter(verifier, users).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("got status %d, want %d", recorder.Code, http.StatusInternalServerError)
	}
}

func TestCORS(t *testing.T) {
	router := newTestRouter(&fakeVerifier{}, &fakeEnsurer{})

	tests := []struct {
		name        string
		method      string
		origin      string
		wantStatus  int
		wantAllowed string
	}{
		{
			name:        "preflight from the app is allowed",
			method:      http.MethodOptions,
			origin:      testOrigin,
			wantStatus:  http.StatusNoContent,
			wantAllowed: testOrigin,
		},
		{
			name:       "preflight from another origin gets no allow header",
			method:     http.MethodOptions,
			origin:     "https://evil.example",
			wantStatus: http.StatusNoContent,
		},
		{
			name:        "simple request from the app is allowed",
			method:      http.MethodGet,
			origin:      testOrigin,
			wantStatus:  http.StatusOK,
			wantAllowed: testOrigin,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(test.method, "/v1/health", nil)
			request.Header.Set("Origin", test.origin)

			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, request)

			if recorder.Code != test.wantStatus {
				t.Fatalf("got status %d, want %d", recorder.Code, test.wantStatus)
			}

			if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != test.wantAllowed {
				t.Errorf("got allow-origin %q, want %q", got, test.wantAllowed)
			}
		})
	}
}
