package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/chat"
)

type ChatService interface {
	StartThread(
		ctx context.Context, userID string, kind domain.ThreadKind, title string,
	) (domain.Thread, error)
	ListThreads(ctx context.Context, userID string) ([]domain.Thread, error)
	History(ctx context.Context, threadID, userID string) ([]domain.ChatMessage, error)
	DeleteThread(ctx context.Context, threadID, userID string) error
	Reply(
		ctx context.Context, userID, threadID, text string, attachment *chat.Attachment, emit func(string) error,
	) error
}

const maxChatBody = 1 << 18

var knownAttachmentKinds = map[string]bool{
	"pdf":   true,
	"text":  true,
	"code":  true,
	"image": true,
}

type chatAttachmentRequest struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
	Size string `json:"size"`
}

type chatRequest struct {
	ThreadID   string                 `json:"threadId"`
	Text       string                 `json:"text"`
	Attachment *chatAttachmentRequest `json:"attachment"`
}

func handleChat(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(
				ctx,
				logger,
				w,
				http.StatusUnauthorized,
				"unauthorized",
				"no caller",
			)
			return
		}

		decoder := json.NewDecoder(
			http.MaxBytesReader(w, r.Body, maxChatBody),
		)
		decoder.DisallowUnknownFields()

		var request chatRequest
		if err := decoder.Decode(&request); err != nil {
			logger.WarnContext(ctx, "chat body rejected", slog.Any("error", err))
			writeError(
				ctx,
				logger,
				w,
				http.StatusBadRequest,
				"invalid_body",
				"could not read that",
			)
			return
		}

		if request.ThreadID == "" || strings.TrimSpace(request.Text) == "" {
			writeError(
				ctx,
				logger,
				w,
				http.StatusBadRequest,
				"invalid_body",
				"thread and text are required",
			)
			return
		}

		if request.Attachment != nil && (!knownAttachmentKinds[request.Attachment.Kind] ||
			strings.TrimSpace(request.Attachment.Name) == "" ||
			strings.TrimSpace(request.Attachment.Size) == "") {
			writeError(
				ctx,
				logger,
				w,
				http.StatusBadRequest,
				"invalid_body",
				"attachment is invalid",
			)
			return
		}

		flusher, canFlush := w.(http.Flusher)
		if !canFlush {
			writeError(
				ctx,
				logger,
				w,
				http.StatusInternalServerError,
				"internal",
				"cannot stream",
			)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")
		w.WriteHeader(http.StatusOK)
		flusher.Flush()

		emit := func(token string) error {
			payload, err := json.Marshal(map[string]string{
				"text": token,
			})
			if err != nil {
				return err
			}

			if _, err := w.Write(
				[]byte("data: " + string(payload) + "\n\n"),
			); err != nil {
				return err
			}

			flusher.Flush()
			return nil
		}

		var attachment *chat.Attachment

		if request.Attachment != nil {
			attachment = &chat.Attachment{
				Kind: request.Attachment.Kind,
				Name: request.Attachment.Name,
				Size: request.Attachment.Size,
			}
		}

		if err := chats.Reply(
			ctx,
			current.user.ID,
			request.ThreadID,
			request.Text,
			attachment,
			emit,
		); err != nil {
			logger.ErrorContext(ctx, "chat reply", slog.Any("error", err))

			message := "Ellie could not answer just now."
			if errors.Is(err, chat.ErrQuota) {
				message = "Ellie is off shift. Check back later."
			}

			writeStreamError(w, flusher, message)
			return
		}

		_, _ = w.Write([]byte("event: done\ndata: {}\n\n"))
		flusher.Flush()
	}
}

func writeStreamError(w http.ResponseWriter, flusher http.Flusher, message string) {
	payload, err := json.Marshal(map[string]string{
		"message": message,
	})
	if err != nil {
		return
	}

	_, _ = w.Write(
		[]byte("event: error\ndata: " + string(payload) + "\n\n"),
	)
	flusher.Flush()
}
