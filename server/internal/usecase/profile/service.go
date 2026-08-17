package profile

import (
	"context"
	"fmt"
	"time"

	"github.com/octane/entwine/server/internal/domain"
)

type Repository interface {
	GetByUserID(ctx context.Context, userID string) (domain.CandidateProfile, error)
	Save(ctx context.Context, profile domain.CandidateProfile, now time.Time) (domain.CandidateProfile, error)
}

type Service struct {
	profiles Repository
	now      func() time.Time
}

func NewService(profiles Repository, now func() time.Time) *Service {
	return &Service{profiles: profiles, now: now}
}

func (s *Service) Get(ctx context.Context, userID string) (domain.CandidateProfile, error) {
	profile, err := s.profiles.GetByUserID(ctx, userID)
	if err != nil {
		return domain.CandidateProfile{}, fmt.Errorf("get profile: %w", err)
	}

	return profile, nil
}

type SaveInput struct {
	UserID         string
	Seniority      domain.Seniority
	Locations      []string
	SalaryMin      int64
	SalaryCurrency string
}

func (s *Service) Save(ctx context.Context, input SaveInput) (domain.CandidateProfile, error) {
	profile, err := domain.NewCandidateProfile(domain.NewCandidateProfileParams{
		UserID:         input.UserID,
		Seniority:      input.Seniority,
		Locations:      input.Locations,
		SalaryMin:      input.SalaryMin,
		SalaryCurrency: input.SalaryCurrency,
		Status:         domain.ProfileStatusActive,
	})
	if err != nil {
		return domain.CandidateProfile{}, fmt.Errorf("build profile: %w", err)
	}

	saved, err := s.profiles.Save(ctx, profile, s.now())
	if err != nil {
		return domain.CandidateProfile{}, fmt.Errorf("save profile: %w", err)
	}

	return saved, nil
}
