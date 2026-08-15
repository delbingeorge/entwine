package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/octane/entwine/server/internal/usecase/chat"
)

const (
	replyTimeout = 2 * time.Minute
	chunkRunes   = 24
)

type GeminiResponder struct {
	config GeminiConfig
	client *http.Client
}

func NewGeminiResponder(config GeminiConfig) *GeminiResponder {
	return &GeminiResponder{
		config: config,
		client: &http.Client{Timeout: replyTimeout},
	}
}

type geminiChatRequest struct {
	SystemInstruction *geminiContent  `json:"systemInstruction,omitempty"`
	Contents          []geminiContent `json:"contents"`
}

func (r *GeminiResponder) Stream(
	ctx context.Context, system string, messages []chat.Message, emit func(string) error,
) error {
	contents := make([]geminiContent, 0, len(messages))

	for _, message := range messages {
		role := "user"
		if message.Role == "agent" {
			role = "model"
		}

		contents = append(contents, geminiContent{
			Role:  role,
			Parts: []geminiPart{{Text: message.Text}},
		})
	}

	body, err := json.Marshal(geminiChatRequest{
		SystemInstruction: &geminiContent{Parts: []geminiPart{{Text: system}}},
		Contents:          contents,
	})
	if err != nil {
		return fmt.Errorf("encode request: %w", err)
	}

	url := fmt.Sprintf("%s/%s:generateContent", geminiHost, r.config.Model)

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-goog-api-key", r.config.APIKey)

	response, err := r.client.Do(request)
	if err != nil {
		return fmt.Errorf("call gemini: %w", err)
	}
	defer func() { _ = response.Body.Close() }()

	payload, err := io.ReadAll(io.LimitReader(response.Body, 4<<20))
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("gemini returned %d: %s", response.StatusCode, truncate(string(payload), 300))
	}

	var decoded geminiResponse
	if err := json.Unmarshal(payload, &decoded); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}

	var reply strings.Builder

	for _, candidate := range decoded.Candidates {
		for _, part := range candidate.Content.Parts {
			reply.WriteString(part.Text)
		}
	}

	if reply.Len() == 0 {
		return fmt.Errorf("gemini returned no text")
	}

	return emitInChunks(reply.String(), emit)
}

func emitInChunks(reply string, emit func(string) error) error {
	runes := []rune(reply)

	for start := 0; start < len(runes); start += chunkRunes {
		end := min(start+chunkRunes, len(runes))

		if err := emit(string(runes[start:end])); err != nil {
			return fmt.Errorf("emit chunk: %w", err)
		}
	}

	return nil
}
