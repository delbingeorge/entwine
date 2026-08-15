package http

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/profile"
)

type ProfileDetailService interface {
	Get(ctx context.Context, userID string) (domain.ProfileDetail, error)
	ImportResume(ctx context.Context, userID string, resume profile.Resume) (domain.ProfileDetail, error)
}

const (
	maxResumeBytes = 8 << 20
	dateLayout     = "2006-01-02"
)

type experienceResponse struct {
	Company        string   `json:"company"`
	Position       string   `json:"position"`
	EmploymentType string   `json:"employmentType,omitempty"`
	Location       string   `json:"location,omitempty"`
	StartDate      string   `json:"startDate"`
	EndDate        string   `json:"endDate,omitempty"`
	IsCurrent      bool     `json:"isCurrent"`
	Summary        string   `json:"summary,omitempty"`
	Highlights     []string `json:"highlights"`
	Tech           []string `json:"tech"`
}

type educationResponse struct {
	Institution string `json:"institution"`
	Area        string `json:"area,omitempty"`
	StudyType   string `json:"studyType,omitempty"`
	StartDate   string `json:"startDate,omitempty"`
	EndDate     string `json:"endDate,omitempty"`
	Score       string `json:"score,omitempty"`
}

type skillResponse struct {
	Name  string  `json:"name"`
	Years float64 `json:"years,omitempty"`
}

type profileDetailResponse struct {
	Experiences []experienceResponse `json:"experiences"`
	Educations  []educationResponse  `json:"educations"`
	Skills      []skillResponse      `json:"skills"`
}

func handleGetProfileDetail(logger *slog.Logger, details ProfileDetailService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		detail, err := details.Get(ctx, current.user.ID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				writeError(ctx, logger, w, http.StatusNotFound, "not_found", "no profile yet")
				return
			}

			logger.ErrorContext(ctx, "get profile detail", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusInternalServerError, "internal", "could not load")

			return
		}

		writeJSON(ctx, logger, w, http.StatusOK, toDetailResponse(detail))
	}
}

func handleImportResume(logger *slog.Logger, details ProfileDetailService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		current, ok := callerFromContext(ctx)
		if !ok {
			writeError(ctx, logger, w, http.StatusUnauthorized, "unauthorized", "no caller")
			return
		}

		if err := r.ParseMultipartForm(maxResumeBytes); err != nil {
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_upload", "could not read upload")
			return
		}

		file, header, err := r.FormFile("resume")
		if err != nil {
			writeError(ctx, logger, w, http.StatusBadRequest, "invalid_upload", "resume file is missing")
			return
		}
		defer func() { _ = file.Close() }()

		content := make([]byte, 0, header.Size)
		buffer := make([]byte, 32<<10)

		for {
			read, readErr := file.Read(buffer)
			content = append(content, buffer[:read]...)

			if len(content) > maxResumeBytes {
				writeError(ctx, logger, w, http.StatusRequestEntityTooLarge, "too_large", "resume is over 8MB")
				return
			}

			if readErr != nil {
				break
			}
		}

		mimeType := header.Header.Get("Content-Type")
		if mimeType == "" {
			mimeType = "application/pdf"
		}

		detail, err := details.ImportResume(ctx, current.user.ID, profile.Resume{
			Content:  content,
			Filename: header.Filename,
			MimeType: mimeType,
		})
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				writeError(ctx, logger, w, http.StatusNotFound, "not_found", "no profile yet")
				return
			}

			if errors.Is(err, domain.ErrInvalidProfile) {
				logger.WarnContext(ctx, "resume rejected", slog.Any("error", err))
				writeError(ctx, logger, w, http.StatusUnprocessableEntity,
					"unreadable_resume", "could not read that resume")

				return
			}

			logger.ErrorContext(ctx, "import resume", slog.Any("error", err))
			writeError(ctx, logger, w, http.StatusBadGateway, "parser_failed", "the parser is unavailable")

			return
		}

		writeJSON(ctx, logger, w, http.StatusOK, toDetailResponse(detail))
	}
}

func toDetailResponse(detail domain.ProfileDetail) profileDetailResponse {
	response := profileDetailResponse{
		Experiences: make([]experienceResponse, 0, len(detail.Experiences)),
		Educations:  make([]educationResponse, 0, len(detail.Educations)),
		Skills:      make([]skillResponse, 0, len(detail.Skills)),
	}

	for _, experience := range detail.Experiences {
		response.Experiences = append(response.Experiences, experienceResponse{
			Company:        experience.Company,
			Position:       experience.Position,
			EmploymentType: experience.EmploymentType,
			Location:       experience.Location,
			StartDate:      experience.StartDate.Format(dateLayout),
			EndDate:        formatDate(experience.EndDate),
			IsCurrent:      experience.IsCurrent(),
			Summary:        experience.Summary,
			Highlights:     experience.Highlights,
			Tech:           experience.Tech,
		})
	}

	for _, education := range detail.Educations {
		response.Educations = append(response.Educations, educationResponse{
			Institution: education.Institution,
			Area:        education.Area,
			StudyType:   education.StudyType,
			StartDate:   formatDate(education.StartDate),
			EndDate:     formatDate(education.EndDate),
			Score:       education.Score,
		})
	}

	for _, skill := range detail.Skills {
		response.Skills = append(response.Skills, skillResponse{
			Name:  skill.Name,
			Years: skill.Years,
		})
	}

	return response
}

func formatDate(value *time.Time) string {
	if value == nil {
		return ""
	}

	return value.Format(dateLayout)
}
