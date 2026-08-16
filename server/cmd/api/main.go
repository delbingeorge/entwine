package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/octane/entwine/server/internal/config"
	"github.com/octane/entwine/server/internal/storage/postgres"
	"github.com/octane/entwine/server/internal/system/llm"
	"github.com/octane/entwine/server/internal/system/supabase"
	transporthttp "github.com/octane/entwine/server/internal/transport/http"
	"github.com/octane/entwine/server/internal/usecase/chat"
	"github.com/octane/entwine/server/internal/usecase/identity"
	"github.com/octane/entwine/server/internal/usecase/profile"
	"github.com/octane/entwine/server/internal/usecase/voice"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	if err := run(logger); err != nil {
		logger.Error("server stopped", slog.Any("error", err))
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := postgres.Open(cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}

	defer func() {
		if closeErr := postgres.Close(db); closeErr != nil {
			logger.Error("close database", slog.Any("error", closeErr))
		}
	}()

	verifier, err := supabase.NewVerifier(ctx, cfg.SupabaseJWKSURL, cfg.SupabaseJWTIssuer, cfg.SupabaseJWTAudience)
	if err != nil {
		return fmt.Errorf("build token verifier: %w", err)
	}

	users := identity.NewService(postgres.NewUserRepo(db), time.Now)
	profileRepo := postgres.NewCandidateProfileRepo(db)
	profiles := profile.NewService(profileRepo, time.Now)
	parser := llm.NewGeminiParser(llm.GeminiConfig{APIKey: cfg.GeminiAPIKey, Model: cfg.GeminiModel})
	detailRepo := postgres.NewProfileDetailRepo(db)
	details := profile.NewDetailService(profileRepo, detailRepo, parser, time.Now)
	threadRepo := postgres.NewThreadRepo(db)
	chats := chat.NewService(
		llm.NewGeminiResponder(llm.GeminiConfig{APIKey: cfg.GeminiAPIKey, Model: cfg.GeminiModel}),
		threadRepo, profileRepo, detailRepo, time.Now)

	voices := voice.NewService(
		llm.NewGeminiLive(llm.LiveConfig{APIKey: cfg.GeminiAPIKey, Model: cfg.GeminiLiveModel}),
		threadRepo)

	server := &http.Server{
		Addr: net.JoinHostPort("", strconv.Itoa(cfg.Port)),
		Handler: transporthttp.NewRouter(
			logger, verifier, users, profiles, details, chats, voices, cfg.AppOrigin),
		ReadHeaderTimeout: 5 * time.Second,
	}

	errs := make(chan error, 1)

	go func() {
		logger.Info("api listening", slog.Int("port", cfg.Port))

		if listenErr := server.ListenAndServe(); listenErr != nil &&
			!errors.Is(listenErr, http.ErrServerClosed) {
			errs <- listenErr
			return
		}

		errs <- nil
	}()

	select {
	case listenErr := <-errs:
		return listenErr
	case <-ctx.Done():
		logger.Info("shutting down")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown: %w", err)
	}

	return nil
}
