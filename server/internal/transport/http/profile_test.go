package http_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/profile"
)

type fakeProfiles struct {
	stored  domain.CandidateProfile
	getErr  error
	saveErr error
	saved   []profile.SaveInput
}

func (f *fakeProfiles) Get(_ context.Context, _ string) (domain.CandidateProfile, error) {
	if f.getErr != nil {
		return domain.CandidateProfile{}, f.getErr
	}

	return f.stored, nil
}

func (f *fakeProfiles) Save(
	_ context.Context,
	input profile.SaveInput,
) (domain.CandidateProfile, error) {
	if f.saveErr != nil {
		return domain.CandidateProfile{}, f.saveErr
	}

	f.saved = append(f.saved, input)

	return domain.CandidateProfile{
		UserID:       input.UserID,
		Seniority:    input.Seniority,
		PrimaryStack: input.PrimaryStack,
		RemotePref:   input.RemotePref,
		SalaryMin:    input.SalaryMin,
		Status:       domain.ProfileStatusActive,
	}, nil
}

func signedInRequest(method, path, body string) *http.Request {
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set("Authorization", "Bearer good-token")

	return request
}

func TestGetProfileNotFound(t *testing.T) {
	profiles := &fakeProfiles{getErr: domain.ErrProfileNotFound}
	router := newProfileRouter(profiles)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, signedInRequest(http.MethodGet, "/v1/profile", ""))

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("got status %d, want %d", recorder.Code, http.StatusNotFound)
	}

	var body struct {
		Code string `json:"code"`
	}

	if err := json.NewDecoder(recorder.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}

	if body.Code != "profile_not_found" {
		t.Errorf("got code %q, want profile_not_found", body.Code)
	}
}

func TestGetProfileNeedsAToken(t *testing.T) {
	router := newProfileRouter(&fakeProfiles{})

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/v1/profile", nil))

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("got status %d, want %d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestPutProfileSaves(t *testing.T) {
	profiles := &fakeProfiles{}
	router := newProfileRouter(profiles)

	body := `{"seniority":"senior","primaryStack":["Go"],"locations":["Bengaluru"],
		"remotePref":"remote","salaryMin":2500000,"salaryCurrency":"INR","wantsToBuild":"systems"}`

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, signedInRequest(http.MethodPut, "/v1/profile", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d, body %s", recorder.Code, http.StatusOK, recorder.Body)
	}

	if len(profiles.saved) != 1 {
		t.Fatalf("got %d saves, want 1", len(profiles.saved))
	}

	if profiles.saved[0].UserID != "sub-1" {
		t.Errorf("got user id %q, want the caller from the token", profiles.saved[0].UserID)
	}

	if profiles.saved[0].SalaryMin != 2_500_000 {
		t.Errorf("got salary %d, want 2500000", profiles.saved[0].SalaryMin)
	}
}

func TestPutProfileRejectsBadInput(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		saveErr    error
		wantStatus int
		wantCode   string
	}{
		{
			name:       "malformed json",
			body:       "{not json",
			wantStatus: http.StatusBadRequest,
			wantCode:   "invalid_body",
		},
		{
			name:       "unknown field",
			body:       `{"seniority":"senior","surprise":true}`,
			wantStatus: http.StatusBadRequest,
			wantCode:   "invalid_body",
		},
		{
			name:       "domain rejects it",
			body:       `{"seniority":"principal"}`,
			saveErr:    domain.ErrInvalidProfile,
			wantStatus: http.StatusBadRequest,
			wantCode:   "invalid_profile",
		},
		{
			name:       "storage failure",
			body:       `{"seniority":"senior"}`,
			saveErr:    errors.New("database down"),
			wantStatus: http.StatusInternalServerError,
			wantCode:   "internal",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			router := newProfileRouter(&fakeProfiles{saveErr: test.saveErr})

			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, signedInRequest(http.MethodPut, "/v1/profile", test.body))

			if recorder.Code != test.wantStatus {
				t.Fatalf("got status %d, want %d", recorder.Code, test.wantStatus)
			}

			var body struct {
				Code string `json:"code"`
			}

			if err := json.NewDecoder(recorder.Body).Decode(&body); err != nil {
				t.Fatalf("decode: %v", err)
			}

			if body.Code != test.wantCode {
				t.Errorf("got code %q, want %q", body.Code, test.wantCode)
			}
		})
	}
}
