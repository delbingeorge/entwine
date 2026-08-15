package http

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/octane/entwine/server/internal/domain"
)

type threadResponse struct {
	ID            string     `json:"id"`
	Kind          string     `json:"kind"`
	Title         string     `json:"title"`
	Status        string     `json:"status,omitempty"`
	LastMessageAt *time.Time `json:"lastMessageAt,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
}

type messageResponse struct {
	ID        string    `json:"id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type newThreadRequest struct {
	Kind  string `json:"kind"`
	Title string `json:"title"`
}

func handleCreateThread(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		var request newThreadRequest

		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxProfileBody))
		decoder.DisallowUnknownFields()

		if err := decoder.Decode(&request); err != nil {
			logger.WarnContext(ctx, "thread body rejected", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_body", "could not read that")

			return
		}

		thread, err := chats.StartThread(
			ctx, current.user.ID, domain.ThreadKind(request.Kind), request.Title)
		if err != nil {
			if errors.Is(err, domain.ErrInvalidProfile) {
				writeError(ctx, logger, w, http.StatusBadRequest, "invalid_thread", "unknown chat kind")
				return
			}

			logger.ErrorContext(ctx, "start thread", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "could not start")

			return
		}

		writeJSON(ctx, logger, w, http.StatusCreated, toThreadResponse(thread))
	}
}

func handleListThreads(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		threads, err := chats.ListThreads(ctx, current.user.ID)
		if err != nil {
			logger.ErrorContext(ctx, "list threads", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "could not list")

			return
		}

		response := make([]threadResponse, 0, len(threads))
		for _, thread := range threads {
			response = append(response, toThreadResponse(thread))
		}

		writeJSON(ctx, logger, w, http.StatusOK, response)
	}
}

func handleThreadMessages(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		messages, err := chats.History(ctx, r.PathValue("id"), current.user.ID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				writeError(ctx, logger, w, http.StatusNotFound, "not_found", "no such chat")
				return
			}

			logger.ErrorContext(ctx, "thread history", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "could not load")

			return
		}

		response := make([]messageResponse, 0, len(messages))
		for _, message := range messages {
			response = append(response, messageResponse{
				ID:        message.ID,
				Role:      string(message.Role),
				Content:   message.Content,
				CreatedAt: message.CreatedAt,
			})
		}

		writeJSON(ctx, logger, w, http.StatusOK, response)
	}
}

func handleDeleteThread(logger *slog.Logger, chats ChatService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		if err := chats.DeleteThread(ctx, r.PathValue("id"), current.user.ID); err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				writeError(ctx, logger, w, http.StatusNotFound, "not_found", "no such chat")
				return
			}

			logger.ErrorContext(ctx, "delete thread", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "could not delete")

			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func toThreadResponse(thread domain.Thread) threadResponse {
	return threadResponse{
		ID:            thread.ID,
		Kind:          string(thread.Kind),
		Title:         thread.Title,
		Status:        thread.Status,
		LastMessageAt: thread.LastMessageAt,
		CreatedAt:     thread.CreatedAt,
	}
}
