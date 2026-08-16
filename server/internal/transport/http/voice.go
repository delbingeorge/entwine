package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/coder/websocket"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/voice"
)

type VoiceService interface {
	Start(ctx context.Context, userID, threadID string) (voice.Session, error)
}

const (
	voiceReadLimit  = 4 << 20
	handshakeWindow = 10 * time.Second
	maxCallLength   = 20 * time.Minute
)

type voiceHandshake struct {
	ThreadID string `json:"threadId"`
	Token    string `json:"token"`
}

type voiceNotice struct {
	Text string `json:"text,omitempty"`
	Type string `json:"type"`
}

func handleVoice(
	logger *slog.Logger, verifier TokenVerifier, users UserEnsurer, voices VoiceService, origin string,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			OriginPatterns: []string{originHost(origin)},
		})
		if err != nil {
			logger.WarnContext(r.Context(), "voice upgrade failed", slog.Any("error", err))
			return
		}

		defer func() { _ = conn.CloseNow() }()

		conn.SetReadLimit(voiceReadLimit)

		ctx, cancel := context.WithTimeout(r.Context(), maxCallLength)
		defer cancel()

		caller, threadID, err := authenticateVoice(ctx, conn, verifier, users)
		if err != nil {
			logger.WarnContext(ctx, "voice auth failed", slog.Any("error", err))
			_ = conn.Close(websocket.StatusPolicyViolation, "unauthorized")

			return
		}

		session, err := voices.Start(ctx, caller.ID, threadID)
		if err != nil {
			logger.ErrorContext(ctx, "voice session failed", slog.Any("error", err))
			_ = conn.Close(websocket.StatusInternalError, "could not start")

			return
		}

		defer func() { _ = session.Close() }()

		notify(ctx, conn, voiceNotice{Type: "ready"})

		go pumpToClient(ctx, conn, session)

		pumpToModel(ctx, conn, session)
	}
}

func authenticateVoice(
	ctx context.Context, conn *websocket.Conn, verifier TokenVerifier, users UserEnsurer,
) (domain.User, string, error) {
	handshakeCtx, cancel := context.WithTimeout(ctx, handshakeWindow)
	defer cancel()

	_, data, err := conn.Read(handshakeCtx)
	if err != nil {
		return domain.User{}, "", err
	}

	var handshake voiceHandshake
	if err := json.Unmarshal(data, &handshake); err != nil {
		return domain.User{}, "", err
	}

	if handshake.Token == "" || handshake.ThreadID == "" {
		return domain.User{}, "", errors.New("missing token or thread")
	}

	identity, err := verifier.Verify(ctx, handshake.Token)
	if err != nil {
		return domain.User{}, "", err
	}

	user, _, err := users.Ensure(ctx, identity)
	if err != nil {
		return domain.User{}, "", err
	}

	return user, handshake.ThreadID, nil
}

func pumpToClient(ctx context.Context, conn *websocket.Conn, session voice.Session) {
	for event := range session.Events() {
		if len(event.Audio) > 0 {
			if err := conn.Write(ctx, websocket.MessageBinary, event.Audio); err != nil {
				return
			}
		}

		switch {
		case event.Interrupted:
			notify(ctx, conn, voiceNotice{Type: "interrupted"})
		case event.TurnComplete:
			notify(ctx, conn, voiceNotice{Type: "turn_complete"})
		case event.Text != "":
			notify(ctx, conn, voiceNotice{Text: event.Text, Type: "transcript"})
		}
	}
}

func pumpToModel(ctx context.Context, conn *websocket.Conn, session voice.Session) {
	for {
		kind, data, err := conn.Read(ctx)
		if err != nil {
			return
		}

		if kind != websocket.MessageBinary {
			continue
		}

		if err := session.Send(ctx, data); err != nil {
			return
		}
	}
}

func notify(ctx context.Context, conn *websocket.Conn, notice voiceNotice) {
	body, err := json.Marshal(notice)
	if err != nil {
		return
	}

	_ = conn.Write(ctx, websocket.MessageText, body)
}
