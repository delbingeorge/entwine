package domain_test

import (
	"errors"
	"testing"

	"github.com/octane/entwine/server/internal/domain"
)

func validParams() domain.NewCandidateProfileParams {
	return domain.NewCandidateProfileParams{
		UserID:         "11111111-1111-1111-1111-111111111111",
		Seniority:      domain.SenioritySenior,
		Locations:      []string{"Bengaluru"},
		SalaryMin:      2_500_000,
		SalaryCurrency: "INR",
		Status:         domain.ProfileStatusActive,
	}
}

func TestNewCandidateProfile(t *testing.T) {
	tests := []struct {
		name    string
		mutate  func(*domain.NewCandidateProfileParams)
		wantErr error
	}{
		{name: "accepts a complete profile", mutate: func(*domain.NewCandidateProfileParams) {}},
		{
			name:    "rejects a blank user id",
			mutate:  func(p *domain.NewCandidateProfileParams) { p.UserID = "  " },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name:    "rejects an unknown seniority",
			mutate:  func(p *domain.NewCandidateProfileParams) { p.Seniority = "principal" },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name:    "rejects a negative salary floor",
			mutate:  func(p *domain.NewCandidateProfileParams) { p.SalaryMin = -1 },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name:    "rejects an unknown status",
			mutate:  func(p *domain.NewCandidateProfileParams) { p.Status = "archived" },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name: "rejects an active profile with no location",
			mutate: func(p *domain.NewCandidateProfileParams) {
				p.Locations = nil
			},
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name: "allows a draft with no location",
			mutate: func(p *domain.NewCandidateProfileParams) {
				p.Locations = nil
				p.Status = domain.ProfileStatusDraft
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			params := validParams()
			test.mutate(&params)

			profile, err := domain.NewCandidateProfile(params)

			if test.wantErr != nil {
				if !errors.Is(err, test.wantErr) {
					t.Fatalf("got error %v, want %v", err, test.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if profile.UserID != params.UserID {
				t.Errorf("got user id %q, want %q", profile.UserID, params.UserID)
			}
		})
	}
}

func TestNewCandidateProfileDefaultsToDraft(t *testing.T) {
	params := validParams()
	params.Status = ""

	profile, err := domain.NewCandidateProfile(params)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if profile.Status != domain.ProfileStatusDraft {
		t.Errorf("got status %q, want %q", profile.Status, domain.ProfileStatusDraft)
	}
}
