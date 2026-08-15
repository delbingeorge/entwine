package profile

import (
	"context"
	"fmt"
	"time"

	"github.com/octane/entwine/server/internal/domain"
)

type DetailRepository interface {
	Get(ctx context.Context, profileID string) (domain.ProfileDetail, error)
	Replace(ctx context.Context, profileID string, detail domain.ProfileDetail, now time.Time) error
}

type ResumeParser interface {
	Parse(ctx context.Context, resume Resume) (domain.ProfileDetail, error)
}

type Resume struct {
	Content  []byte
	Filename string
	MimeType string
}

type DetailService struct {
	profiles Repository
	details  DetailRepository
	parser   ResumeParser
	now      func() time.Time
}

func NewDetailService(
	profiles Repository, details DetailRepository, parser ResumeParser, now func() time.Time,
) *DetailService {
	return &DetailService{profiles: profiles, details: details, parser: parser, now: now}
}

func (s *DetailService) Get(ctx context.Context, userID string) (domain.ProfileDetail, error) {
	profile, err := s.profiles.GetByUserID(ctx, userID)
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("get profile: %w", err)
	}

	detail, err := s.details.Get(ctx, profile.ID)
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("get profile detail: %w", err)
	}

	return detail, nil
}

func (s *DetailService) ImportResume(
	ctx context.Context, userID string, resume Resume,
) (domain.ProfileDetail, error) {
	profile, err := s.profiles.GetByUserID(ctx, userID)
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("get profile: %w", err)
	}

	parsed, err := s.parser.Parse(ctx, resume)
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("parse resume: %w", err)
	}

	detail, err := validated(parsed)
	if err != nil {
		return domain.ProfileDetail{}, err
	}

	if err := s.details.Replace(ctx, profile.ID, detail, s.now()); err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("replace profile detail: %w", err)
	}

	return detail, nil
}

func validated(parsed domain.ProfileDetail) (domain.ProfileDetail, error) {
	detail := domain.ProfileDetail{
		Experiences: make([]domain.Experience, 0, len(parsed.Experiences)),
		Educations:  make([]domain.Education, 0, len(parsed.Educations)),
		Skills:      make([]domain.Skill, 0, len(parsed.Skills)),
	}

	seen := make(map[string]bool, len(parsed.Skills))

	for _, raw := range parsed.Experiences {
		experience, err := domain.NewExperience(raw)
		if err != nil {
			return domain.ProfileDetail{}, fmt.Errorf("experience at %s: %w", raw.Company, err)
		}

		detail.Experiences = append(detail.Experiences, experience)
	}

	for _, raw := range parsed.Educations {
		education, err := domain.NewEducation(raw)
		if err != nil {
			return domain.ProfileDetail{}, fmt.Errorf("education at %s: %w", raw.Institution, err)
		}

		detail.Educations = append(detail.Educations, education)
	}

	for _, raw := range parsed.Skills {
		skill, err := domain.NewSkill(raw)
		if err != nil {
			return domain.ProfileDetail{}, fmt.Errorf("skill %s: %w", raw.Name, err)
		}

		if seen[skill.CanonicalName] {
			continue
		}

		seen[skill.CanonicalName] = true
		detail.Skills = append(detail.Skills, skill)
	}

	return detail, nil
}
