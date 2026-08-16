package chat

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/octane/entwine/server/internal/domain"
)

// ErrQuota reports that the model refused the call because the key is spent.
var ErrQuota = errors.New("model quota exhausted")

type Message struct {
	Role string
	Text string
}

type Responder interface {
	Stream(ctx context.Context, system string, messages []Message, emit func(string) error) error
}

type ThreadRepository interface {
	Create(ctx context.Context, thread domain.Thread, now time.Time) (domain.Thread, error)
	ListByUser(ctx context.Context, userID string) ([]domain.Thread, error)
	Get(ctx context.Context, threadID, userID string) (domain.Thread, error)
	Delete(ctx context.Context, threadID, userID string) error
	Messages(ctx context.Context, threadID string) ([]domain.ChatMessage, error)
	Append(ctx context.Context, message domain.ChatMessage, now time.Time) (domain.ChatMessage, error)
}

type ProfileReader interface {
	GetByUserID(ctx context.Context, userID string) (domain.CandidateProfile, error)
}

type DetailReader interface {
	Get(ctx context.Context, profileID string) (domain.ProfileDetail, error)
}

type Service struct {
	responder Responder
	threads   ThreadRepository
	profiles  ProfileReader
	details   DetailReader
	now       func() time.Time
}

func NewService(
	responder Responder,
	threads ThreadRepository,
	profiles ProfileReader,
	details DetailReader,
	now func() time.Time,
) *Service {
	return &Service{
		responder: responder,
		threads:   threads,
		profiles:  profiles,
		details:   details,
		now:       now,
	}
}

const historyDepth = 30

func (s *Service) StartThread(
	ctx context.Context, userID string, kind domain.ThreadKind, title string,
) (domain.Thread, error) {
	thread, err := domain.NewThread(domain.Thread{UserID: userID, Kind: kind, Title: title})
	if err != nil {
		return domain.Thread{}, err
	}

	created, err := s.threads.Create(ctx, thread, s.now())
	if err != nil {
		return domain.Thread{}, fmt.Errorf("start thread: %w", err)
	}

	return created, nil
}

func (s *Service) ListThreads(ctx context.Context, userID string) ([]domain.Thread, error) {
	threads, err := s.threads.ListByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list threads: %w", err)
	}

	return threads, nil
}

func (s *Service) History(
	ctx context.Context, threadID, userID string,
) ([]domain.ChatMessage, error) {
	if _, err := s.threads.Get(ctx, threadID, userID); err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}

	messages, err := s.threads.Messages(ctx, threadID)
	if err != nil {
		return nil, fmt.Errorf("read history: %w", err)
	}

	return messages, nil
}

func (s *Service) DeleteThread(ctx context.Context, threadID, userID string) error {
	if err := s.threads.Delete(ctx, threadID, userID); err != nil {
		return fmt.Errorf("delete thread: %w", err)
	}

	return nil
}

func (s *Service) Reply(
	ctx context.Context, userID, threadID, text string, emit func(string) error,
) error {
	thread, err := s.threads.Get(ctx, threadID, userID)
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}

	asked, err := domain.NewChatMessage(domain.ChatMessage{
		ThreadID: threadID,
		Role:     domain.MessageRoleUser,
		Content:  text,
	})
	if err != nil {
		return err
	}

	if _, err := s.threads.Append(ctx, asked, s.now()); err != nil {
		return fmt.Errorf("store question: %w", err)
	}

	stored, err := s.threads.Messages(ctx, threadID)
	if err != nil {
		return fmt.Errorf("read history: %w", err)
	}

	if len(stored) > historyDepth {
		stored = stored[len(stored)-historyDepth:]
	}

	messages := make([]Message, 0, len(stored))
	for _, message := range stored {
		messages = append(messages, Message{Role: string(message.Role), Text: message.Content})
	}

	var reply strings.Builder

	streamErr := s.responder.Stream(ctx, s.systemPrompt(ctx, userID, thread), messages, func(token string) error {
		reply.WriteString(token)

		return emit(token)
	})

	if reply.Len() > 0 {
		answered, buildErr := domain.NewChatMessage(domain.ChatMessage{
			ThreadID: threadID,
			Role:     domain.MessageRoleAgent,
			Content:  reply.String(),
		})
		if buildErr == nil {
			// The caller may have walked away mid-reply. Keep what Ellie said.
			keep := context.WithoutCancel(ctx)

			if _, appendErr := s.threads.Append(keep, answered, s.now()); appendErr != nil {
				return fmt.Errorf("store answer: %w", appendErr)
			}
		}
	}

	if streamErr != nil {
		return fmt.Errorf("stream reply: %w", streamErr)
	}

	return nil
}

func (s *Service) systemPrompt(
	ctx context.Context, userID string, thread domain.Thread,
) string {
	var builder strings.Builder

	builder.WriteString(persona)

	if thread.Kind == domain.ThreadKindCoaching {
		fmt.Fprintf(&builder, coachingBrief, thread.Title)
	}

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
				fmt.Fprintf(builder, ". Tech: %s", strings.Join(experience.Tech, ", "))
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
