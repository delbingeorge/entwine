package domain

import (
	"fmt"
	"strings"
	"time"
)

type ThreadKind string

const (
	ThreadKindMain     ThreadKind = "main"
	ThreadKindJob      ThreadKind = "job"
	ThreadKindCoaching ThreadKind = "coaching"
)

type MessageRole string

const (
	MessageRoleUser  MessageRole = "user"
	MessageRoleAgent MessageRole = "agent"
)

type Thread struct {
	ID            string
	UserID        string
	Kind          ThreadKind
	ParentID      string
	Title         string
	Status        string
	LastMessageAt *time.Time
	CreatedAt     time.Time
}

type ChatMessage struct {
	ID        string
	ThreadID  string
	Seq       int64
	Role      MessageRole
	Content   string
	CreatedAt time.Time
}

const maxTitleRunes = 60

func NewThread(thread Thread) (Thread, error) {
	if strings.TrimSpace(thread.UserID) == "" {
		return Thread{}, fmt.Errorf("user id is empty: %w", ErrInvalidProfile)
	}

	if thread.Kind == "" {
		thread.Kind = ThreadKindMain
	}

	if !thread.Kind.isKnown() {
		return Thread{}, fmt.Errorf("thread kind %q is unknown: %w", thread.Kind, ErrInvalidProfile)
	}

	return thread, nil
}

func (k ThreadKind) isKnown() bool {
	switch k {
	case ThreadKindMain, ThreadKindJob, ThreadKindCoaching:
		return true
	default:
		return false
	}
}

func NewChatMessage(message ChatMessage) (ChatMessage, error) {
	if strings.TrimSpace(message.ThreadID) == "" {
		return ChatMessage{}, fmt.Errorf("thread id is empty: %w", ErrInvalidProfile)
	}

	if message.Role != MessageRoleUser && message.Role != MessageRoleAgent {
		return ChatMessage{}, fmt.Errorf("role %q is unknown: %w", message.Role, ErrInvalidProfile)
	}

	if strings.TrimSpace(message.Content) == "" {
		return ChatMessage{}, fmt.Errorf("content is empty: %w", ErrInvalidProfile)
	}

	return message, nil
}

func TitleFrom(text string) string {
	title := strings.Join(strings.Fields(text), " ")

	runes := []rune(title)
	if len(runes) <= maxTitleRunes {
		return title
	}

	return strings.TrimSpace(string(runes[:maxTitleRunes])) + "…"
}
