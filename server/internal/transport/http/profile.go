package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/profile"
)

type ProfileService interface {
	Get(ctx context.Context, userID string) (domain.CandidateProfile, error)
	Save(ctx context.Context, input profile.SaveInput) (domain.CandidateProfile, error)
}

type profileResponse struct {
	Seniority      string   `json:"seniority"`
	PrimaryStack   []string `json:"primaryStack"`
	Locations      []string `json:"locations"`
	RemotePref     string   `json:"remotePref"`
	SalaryMin      int64    `json:"salaryMin"`
	SalaryCurrency string   `json:"salaryCurrency"`
	WantsToBuild   string   `json:"wantsToBuild"`
	Status         string   `json:"status"`
}

type profileRequest struct {
	Seniority      string   `json:"seniority"`
	PrimaryStack   []string `json:"primaryStack"`
	Locations      []string `json:"locations"`
	RemotePref     string   `json:"remotePref"`
	SalaryMin      int64    `json:"salaryMin"`
	SalaryCurrency string   `json:"salaryCurrency"`
	WantsToBuild   string   `json:"wantsToBuild"`
}

const maxProfileBody = 1 << 16

func toProfileResponse(saved domain.CandidateProfile) profileResponse {
	return profileResponse{
		Seniority:      string(saved.Seniority),
		PrimaryStack:   saved.PrimaryStack,
		Locations:      saved.Locations,
		RemotePref:     string(saved.RemotePref),
		SalaryMin:      saved.SalaryMin,
		SalaryCurrency: saved.SalaryCurrency,
		WantsToBuild:   saved.WantsToBuild,
		Status:         string(saved.Status),
	}
}

func handleGetProfile(logger *slog.Logger, profiles ProfileService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "Not signed in.")
			return
		}

		saved, err := profiles.Get(ctx, current.user.ID)
		if errors.Is(err, domain.ErrProfileNotFound) {
			writeError(ctx, logger, w, http.StatusNotFound, "profile_not_found", "No profile yet.")
			return
		}

		if err != nil {
			logger.ErrorContext(ctx, "get profile", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "Something went wrong.")
			return
		}

		writeJSON(ctx, logger, w, http.StatusOK, toProfileResponse(saved))
	}
}

func handlePutProfile(logger *slog.Logger, profiles ProfileService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "Not signed in.")
			return
		}

		var body profileRequest

		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxProfileBody))
		decoder.DisallowUnknownFields()

		if err := decoder.Decode(&body); err != nil {
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_body", "Could not read the profile.")
			return
		}

		saved, err := profiles.Save(ctx, profile.SaveInput{
			UserID:         current.user.ID,
			Seniority:      domain.Seniority(body.Seniority),
			PrimaryStack:   body.PrimaryStack,
			Locations:      body.Locations,
			RemotePref:     domain.RemotePref(body.RemotePref),
			SalaryMin:      body.SalaryMin,
			SalaryCurrency: body.SalaryCurrency,
			WantsToBuild:   body.WantsToBuild,
		})
		if errors.Is(err, domain.ErrInvalidProfile) {
			logger.WarnContext(ctx, "rejected profile", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_profile", "That profile is not valid.")
			return
		}

		if err != nil {
			logger.ErrorContext(ctx, "save profile", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "Something went wrong.")
			return
		}

		writeJSON(ctx, logger, w, http.StatusOK, toProfileResponse(saved))
	}
}
