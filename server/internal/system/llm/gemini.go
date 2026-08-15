package llm

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/profile"
)

const (
	geminiHost     = "https://generativelanguage.googleapis.com/v1beta/models"
	requestTimeout = 90 * time.Second
)

type GeminiConfig struct {
	APIKey string
	Model  string
}

type GeminiParser struct {
	config GeminiConfig
	client *http.Client
}

func NewGeminiParser(config GeminiConfig) *GeminiParser {
	return &GeminiParser{
		config: config,
		client: &http.Client{Timeout: requestTimeout},
	}
}

func (p *GeminiParser) Parse(
	ctx context.Context, resume profile.Resume,
) (domain.ProfileDetail, error) {
	body, err := json.Marshal(geminiRequest{
		Contents: []geminiContent{{
			Parts: []geminiPart{
				{InlineData: &geminiBlob{
					MimeType: resume.MimeType,
					Data:     base64.StdEncoding.EncodeToString(resume.Content),
				}},
				{Text: extractionPrompt},
			},
		}},
		GenerationConfig: geminiGenerationConfig{
			ResponseMimeType: "application/json",
			ResponseSchema:   resumeSchema,
		},
	})
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("encode request: %w", err)
	}

	url := fmt.Sprintf("%s/%s:generateContent", geminiHost, p.config.Model)

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("build request: %w", err)
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-goog-api-key", p.config.APIKey)

	response, err := p.client.Do(request)
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("call gemini: %w", err)
	}
	defer func() { _ = response.Body.Close() }()

	payload, err := io.ReadAll(io.LimitReader(response.Body, 4<<20))
	if err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("read response: %w", err)
	}

	if response.StatusCode != http.StatusOK {
		return domain.ProfileDetail{}, fmt.Errorf(
			"gemini returned %d: %s", response.StatusCode, truncate(string(payload), 300))
	}

	var decoded geminiResponse
	if err := json.Unmarshal(payload, &decoded); err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("decode response: %w", err)
	}

	if len(decoded.Candidates) == 0 || len(decoded.Candidates[0].Content.Parts) == 0 {
		return domain.ProfileDetail{}, fmt.Errorf("gemini returned no candidates")
	}

	var parsed parsedResume
	text := decoded.Candidates[0].Content.Parts[0].Text

	if err := json.Unmarshal([]byte(text), &parsed); err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("decode extraction: %w", err)
	}

	return parsed.toDomain(), nil
}

func truncate(value string, limit int) string {
	if len(value) <= limit {
		return value
	}

	return value[:limit] + "…"
}

func parseDate(value string) *time.Time {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}

	for _, layout := range []string{"2006-01-02", "2006-01", "2006"} {
		if parsed, err := time.Parse(layout, value); err == nil {
			return &parsed
		}
	}

	return nil
}
