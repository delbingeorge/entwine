package chat

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/octane/entwine/server/internal/domain"
)

type Message struct {
	Role string
	Text string
}

type Responder interface {
	Stream(ctx context.Context, system string, messages []Message, emit func(string) error) error
}

type ProfileReader interface {
	GetByUserID(ctx context.Context, userID string) (domain.CandidateProfile, error)
}

type DetailReader interface {
	Get(ctx context.Context, profileID string) (domain.ProfileDetail, error)
}

type Service struct {
	responder Responder
	profiles  ProfileReader
	details   DetailReader
}

func NewService(responder Responder, profiles ProfileReader, details DetailReader) *Service {
	return &Service{responder: responder, profiles: profiles, details: details}
}

func (s *Service) Reply(
	ctx context.Context, userID string, messages []Message, emit func(string) error,
) error {
	if len(messages) == 0 {
		return fmt.Errorf("no messages: %w", domain.ErrInvalidProfile)
	}

	system := s.systemPrompt(ctx, userID)

	if err := s.responder.Stream(ctx, system, messages, emit); err != nil {
		return fmt.Errorf("stream reply: %w", err)
	}

	return nil
}

func (s *Service) systemPrompt(ctx context.Context, userID string) string {
	var builder strings.Builder

	builder.WriteString(persona)

	profile, err := s.profiles.GetByUserID(ctx, userID)
	if err != nil {
		if !errors.Is(err, domain.ErrNotFound) {
			return builder.String()
		}

		builder.WriteString("\n\nThis candidate has not filled in their profile yet.")

		return builder.String()
	}

	builder.WriteString("\n\n## This candidate\n")
	fmt.Fprintf(&builder, "- Seniority: %s\n", profile.Seniority)

	if len(profile.PrimaryStack) > 0 {
		fmt.Fprintf(&builder, "- Stack: %s\n", strings.Join(profile.PrimaryStack, ", "))
	}

	if len(profile.Locations) > 0 {
		fmt.Fprintf(&builder, "- Locations: %s\n", strings.Join(profile.Locations, ", "))
	}

	fmt.Fprintf(&builder, "- Work preference: %s\n", profile.RemotePref)

	if profile.SalaryMin > 0 {
		fmt.Fprintf(&builder, "- Salary floor: %s %d\n", profile.SalaryCurrency, profile.SalaryMin)
	}

	if profile.WantsToBuild != "" {
		fmt.Fprintf(&builder, "- Wants to build: %s\n", profile.WantsToBuild)
	}

	detail, err := s.details.Get(ctx, profile.ID)
	if err != nil {
		return builder.String()
	}

	writeDetail(&builder, detail)

	return builder.String()
}

func writeDetail(builder *strings.Builder, detail domain.ProfileDetail) {
	if len(detail.Experiences) > 0 {
		builder.WriteString("\n### Experience\n")

		for _, experience := range detail.Experiences {
			until := "present"
			if !experience.IsCurrent() {
				until = experience.EndDate.Format("Jan 2006")
			}

			fmt.Fprintf(builder, "- %s at %s (%s – %s)",
				experience.Position, experience.Company,
				experience.StartDate.Format("Jan 2006"), until)

			if len(experience.Tech) > 0 {
				fmt.Fprintf(builder, " — %s", strings.Join(experience.Tech, ", "))
			}

			builder.WriteString("\n")
		}
	}

	if len(detail.Skills) > 0 {
		names := make([]string, 0, len(detail.Skills))
		for _, skill := range detail.Skills {
			names = append(names, skill.Name)
		}

		fmt.Fprintf(builder, "\n### Skills\n%s\n", strings.Join(names, ", "))
	}
}
