package voice

import (
	"context"
	"fmt"

	"github.com/octane/entwine/server/internal/domain"
)

type Event struct {
	Audio        []byte
	Interrupted  bool
	Text         string
	TurnComplete bool
}

type Session interface {
	Close() error
	Events() <-chan Event
	Send(ctx context.Context, pcm []byte) error
}

type Opener interface {
	Open(ctx context.Context, brief string) (Session, error)
}

type ThreadReader interface {
	Get(ctx context.Context, threadID, userID string) (domain.Thread, error)
	Messages(ctx context.Context, threadID string) ([]domain.ChatMessage, error)
}

type Service struct {
	opener  Opener
	threads ThreadReader
}

func NewService(opener Opener, threads ThreadReader) *Service {
	return &Service{opener: opener, threads: threads}
}

func (s *Service) Start(ctx context.Context, userID, threadID string) (Session, error) {
	thread, err := s.threads.Get(ctx, threadID, userID)
	if err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}

	messages, err := s.threads.Messages(ctx, threadID)
	if err != nil {
		return nil, fmt.Errorf("read history: %w", err)
	}

	session, err := s.opener.Open(ctx, spokenBrief(thread, messages))
	if err != nil {
		return nil, fmt.Errorf("open voice session: %w", err)
	}

	return session, nil
}
