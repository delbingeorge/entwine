package profile_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/profile"
)

type fakeProfiles struct {
	stored  domain.CandidateProfile
	saved   []domain.CandidateProfile
	savedAt time.Time
	getErr  error
	saveErr error
}

func (f *fakeProfiles) GetByUserID(_ context.Context, _ string) (domain.CandidateProfile, error) {
	if f.getErr != nil {
		return domain.CandidateProfile{}, f.getErr
	}

	return f.stored, nil
}

func (f *fakeProfiles) Save(
	_ context.Context,
	saved domain.CandidateProfile,
	now time.Time,
) (domain.CandidateProfile, error) {
	if f.saveErr != nil {
		return domain.CandidateProfile{}, f.saveErr
	}

	f.saved = append(f.saved, saved)
	f.savedAt = now

	return saved, nil
}

func validInput() profile.SaveInput {
	return profile.SaveInput{
		UserID:         "11111111-1111-1111-1111-111111111111",
		Seniority:      domain.SenioritySenior,
		Locations:      []string{"Bengaluru"},
		SalaryMin:      2_500_000,
		SalaryCurrency: "INR",
	}
}

func TestSave(t *testing.T) {
	fixedNow := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)

	tests := []struct {
		name    string
		mutate  func(*profile.SaveInput)
		saveErr error
		wantErr error
	}{
		{name: "saves a valid profile", mutate: func(*profile.SaveInput) {}},
		{
			name:    "rejects an unknown seniority",
			mutate:  func(in *profile.SaveInput) { in.Seniority = "principal" },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name:    "rejects an empty location list",
			mutate:  func(in *profile.SaveInput) { in.Locations = nil },
			wantErr: domain.ErrInvalidProfile,
		},
		{
			name:    "propagates repository failures",
			mutate:  func(*profile.SaveInput) {},
			saveErr: errors.New("database down"),
			wantErr: errors.New("database down"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			profiles := &fakeProfiles{saveErr: test.saveErr}
			service := profile.NewService(profiles, func() time.Time { return fixedNow })

			input := validInput()
			test.mutate(&input)

			saved, err := service.Save(context.Background(), input)

			if test.wantErr != nil {
				if err == nil {
					t.Fatalf("got no error, want %v", test.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if saved.Status != domain.ProfileStatusActive {
				t.Errorf("got status %q, want active", saved.Status)
			}

			if !profiles.savedAt.Equal(fixedNow) {
				t.Errorf("got saved at %v, want the injected clock %v", profiles.savedAt, fixedNow)
			}
		})
	}
}

func TestGetPropagatesNotFound(t *testing.T) {
	profiles := &fakeProfiles{getErr: domain.ErrProfileNotFound}
	service := profile.NewService(profiles, time.Now)

	_, err := service.Get(context.Background(), "11111111-1111-1111-1111-111111111111")

	if !errors.Is(err, domain.ErrProfileNotFound) {
		t.Fatalf("got error %v, want %v", err, domain.ErrProfileNotFound)
	}
}
