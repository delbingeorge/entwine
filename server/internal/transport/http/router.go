package http

import (
	"log/slog"
	"net/http"
	"time"
)

type meResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
	IsNew     bool      `json:"isNew"`
}

func NewRouter(
	logger *slog.Logger,
	verifier TokenVerifier,
	users UserEnsurer,
	profiles ProfileService,
	details ProfileDetailService,
	chats ChatService,
	voices VoiceService,
	allowedOrigin string,
) http.Handler {
	mux := http.NewServeMux()
	authenticated := requireUser(logger, verifier, users)

	mux.HandleFunc("GET /v1/health", handleHealth(logger))
	mux.Handle("GET /v1/me", authenticated(handleMe(logger)))
	mux.Handle("GET /v1/profile", authenticated(handleGetProfile(logger, profiles)))
	mux.Handle("PUT /v1/profile", authenticated(handlePutProfile(logger, profiles)))
	mux.Handle("GET /v1/profile/detail", authenticated(handleGetProfileDetail(logger, details)))
	mux.Handle("POST /v1/profile/resume", authenticated(handleImportResume(logger, details)))
	mux.Handle("POST /v1/chat", authenticated(handleChat(logger, chats)))
	mux.Handle("GET /v1/threads", authenticated(handleListThreads(logger, chats)))
	mux.Handle("POST /v1/threads", authenticated(handleCreateThread(logger, chats)))
	mux.Handle("GET /v1/threads/{id}/messages", authenticated(handleThreadMessages(logger, chats)))
	mux.Handle("DELETE /v1/threads/{id}", authenticated(handleDeleteThread(logger, chats)))
	mux.HandleFunc("GET /v1/voice", handleVoice(logger, verifier, users, voices, allowedOrigin))

	return withCORS(allowedOrigin)(mux)
}

func handleHealth(logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(r.Context(), logger, w, http.StatusOK, map[string]string{"status": "ok"})
	}
}

func handleMe(logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "Not signed in.")
			return
		}

		writeJSON(ctx, logger, w, http.StatusOK, meResponse{
			ID:        current.user.ID,
			Email:     current.user.Email,
			CreatedAt: current.user.CreatedAt,
			IsNew:     current.isNew,
		})
	}
}
