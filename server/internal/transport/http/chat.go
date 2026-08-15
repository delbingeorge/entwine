package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/octane/entwine/server/internal/usecase/chat"
)

type ChatService interface {
	Reply(ctx context.Context, userID string, messages []chat.Message, emit func(string) error) error
}

const maxChatBody = 1 << 18

type chatRequest struct {
	Messages []struct {
		Role string `json:"role"`
		Text string `json:"text"`
	} `json:"messages"`
}

func handleChat(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxChatBody))
		decoder.DisallowUnknownFields()

		var request chatRequest
		if err := decoder.Decode(&request); err != nil {
			logger.WarnContext(ctx, "chat body rejected", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_body", "could not read that")

			return
		}

		if len(request.Messages) == 0 {
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_body", "no messages")
			return
		}

		flusher, canFlush := w.(http.Flusher)
		if !canFlush {
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "cannot stream")
			return
		}

		messages := make([]chat.Message, 0, len(request.Messages))
		for _, message := range request.Messages {
			messages = append(messages, chat.Message{Role: message.Role, Text: message.Text})
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")
		w.WriteHeader(http.StatusOK)
		flusher.Flush()

		emit := func(token string) error {
			payload, err := json.Marshal(map[string]string{"text": token})
			if err != nil {
				return err
			}

			if _, err := w.Write([]byte("data: " + string(payload) + "\n\n")); err != nil {
				return err
			}

			flusher.Flush()

			return nil
		}

		if err := chats.Reply(ctx, current.user.ID, messages, emit); err != nil {
			logger.ErrorContext(ctx, "chat reply", slog.Any("error", err))
			writeStreamError(w, flusher)

			return
		}

		_, _ = w.Write([]byte("event: done\ndata: {}\n\n"))
		flusher.Flush()
	}
}

func writeStreamError(w http.ResponseWriter, flusher http.Flusher) {
	_, _ = w.Write([]byte(`event: error
data: {"message":"Ellie could not answer just now."}

`))
	flusher.Flush()
}
