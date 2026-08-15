package llm

import (
	"github.com/octane/entwine/server/internal/domain"
)

const extractionPrompt = `Extract this candidate's work history, education, and technical skills from the attached resume.

Rules:
- Use the resume only. Never infer, embellish, or fill gaps with plausible detail.
- Dates are YYYY-MM (or YYYY-MM-DD when the resume gives a day). Omit endDate for a role the candidate still holds.
- highlights are the candidate's stated achievements, one per entry, kept close to their wording.
- tech lists the technologies named for that specific role, not their whole stack.
- skills.years is only set when the resume states or clearly implies a duration.
- Omit any field the resume does not support.`

type geminiRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text       string      `json:"text,omitempty"`
	InlineData *geminiBlob `json:"inline_data,omitempty"`
}

type geminiBlob struct {
	MimeType string `json:"mime_type"`
	Data     string `json:"data"`
}

type geminiGenerationConfig struct {
	ResponseMimeType string         `json:"responseMimeType"`
	ResponseSchema   map[string]any `json:"responseSchema"`
}

type geminiResponse struct {
	Candidates []struct {
		Content geminiContent `json:"content"`
	} `json:"candidates"`
}

type parsedResume struct {
	Experiences []struct {
		Company        string   `json:"company"`
		Position       string   `json:"position"`
		EmploymentType string   `json:"employmentType"`
		Location       string   `json:"location"`
		StartDate      string   `json:"startDate"`
		EndDate        string   `json:"endDate"`
		Summary        string   `json:"summary"`
		Highlights     []string `json:"highlights"`
		Tech           []string `json:"tech"`
	} `json:"experiences"`
	Educations []struct {
		Institution string `json:"institution"`
		Area        string `json:"area"`
		StudyType   string `json:"studyType"`
		StartDate   string `json:"startDate"`
		EndDate     string `json:"endDate"`
		Score       string `json:"score"`
	} `json:"educations"`
	Skills []struct {
		Name  string  `json:"name"`
		Years float64 `json:"years"`
	} `json:"skills"`
}

func (p parsedResume) toDomain() domain.ProfileDetail {
	detail := domain.ProfileDetail{
		Experiences: make([]domain.Experience, 0, len(p.Experiences)),
		Educations:  make([]domain.Education, 0, len(p.Educations)),
		Skills:      make([]domain.Skill, 0, len(p.Skills)),
	}

	for _, raw := range p.Experiences {
		start := parseDate(raw.StartDate)
		if start == nil {
			continue
		}

		detail.Experiences = append(detail.Experiences, domain.Experience{
			Company:        raw.Company,
			Position:       raw.Position,
			EmploymentType: raw.EmploymentType,
			Location:       raw.Location,
			StartDate:      *start,
			EndDate:        parseDate(raw.EndDate),
			Summary:        raw.Summary,
			Highlights:     raw.Highlights,
			Tech:           raw.Tech,
			Source:         domain.DetailSourceResume,
		})
	}

	for _, raw := range p.Educations {
		detail.Educations = append(detail.Educations, domain.Education{
			Institution: raw.Institution,
			Area:        raw.Area,
			StudyType:   raw.StudyType,
			StartDate:   parseDate(raw.StartDate),
			EndDate:     parseDate(raw.EndDate),
			Score:       raw.Score,
			Source:      domain.DetailSourceResume,
		})
	}

	for _, raw := range p.Skills {
		detail.Skills = append(detail.Skills, domain.Skill{
			Name:   raw.Name,
			Years:  raw.Years,
			Source: domain.DetailSourceResume,
		})
	}

	return detail
}

var resumeSchema = map[string]any{
	"type": "object",
	"properties": map[string]any{
		"experiences": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"company":        map[string]any{"type": "string"},
					"position":       map[string]any{"type": "string"},
					"employmentType": map[string]any{"type": "string"},
					"location":       map[string]any{"type": "string"},
					"startDate":      map[string]any{"type": "string"},
					"endDate":        map[string]any{"type": "string"},
					"summary":        map[string]any{"type": "string"},
					"highlights":     map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
					"tech":           map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				},
				"required": []string{"company", "position", "startDate"},
			},
		},
		"educations": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"institution": map[string]any{"type": "string"},
					"area":        map[string]any{"type": "string"},
					"studyType":   map[string]any{"type": "string"},
					"startDate":   map[string]any{"type": "string"},
					"endDate":     map[string]any{"type": "string"},
					"score":       map[string]any{"type": "string"},
				},
				"required": []string{"institution"},
			},
		},
		"skills": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"name":  map[string]any{"type": "string"},
					"years": map[string]any{"type": "number"},
				},
				"required": []string{"name"},
			},
		},
	},
	"required": []string{"experiences", "educations", "skills"},
}
