package llm

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/coder/websocket"

	"github.com/octane/entwine/server/internal/usecase/voice"
)

const (
	liveEndpoint = "wss://generativelanguage.googleapis.com/ws/" +
		"google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
	inputMimeType = "audio/pcm;rate=16000"
	readLimit     = 32 << 20
	eventBuffer   = 64
)

type LiveConfig struct {
	APIKey string
	Model  string
}

type GeminiLive struct {
	config LiveConfig
}

func NewGeminiLive(config LiveConfig) *GeminiLive {
	return &GeminiLive{config: config}
}

type liveContent struct {
	Parts []livePart `json:"parts"`
	Role  string     `json:"role,omitempty"`
}

type livePart struct {
	InlineData *liveBlob `json:"inlineData,omitempty"`
	Text       string    `json:"text,omitempty"`
}

type liveBlob struct {
	Data     string `json:"data"`
	MimeType string `json:"mimeType"`
}

type liveSetup struct {
	Setup struct {
		GenerationConfig struct {
			ResponseModalities []string `json:"responseModalities"`
		} `json:"generationConfig"`
		Model             string       `json:"model"`
		SystemInstruction *liveContent `json:"systemInstruction,omitempty"`
	} `json:"setup"`
}

type liveRealtimeInput struct {
	RealtimeInput struct {
		MediaChunks []liveBlob `json:"mediaChunks"`
	} `json:"realtimeInput"`
}

type liveServerMessage struct {
	ServerContent *struct {
		Interrupted  bool         `json:"interrupted"`
		ModelTurn    *liveContent `json:"modelTurn"`
		TurnComplete bool         `json:"turnComplete"`
	} `json:"serverContent"`
	SetupComplete *struct{} `json:"setupComplete"`
}

type liveSession struct {
	cancel context.CancelFunc
	closed sync.Once
	conn   *websocket.Conn
	events chan voice.Event
	writes sync.Mutex
}

func (g *GeminiLive) Open(ctx context.Context, brief string) (voice.Session, error) {
	sessionCtx, cancel := context.WithCancel(context.WithoutCancel(ctx))

	conn, response, err := websocket.Dial(sessionCtx, liveEndpoint+"?key="+g.config.APIKey, nil)
	if response != nil && response.Body != nil {
		_ = response.Body.Close()
	}

	if err != nil {
		cancel()

		return nil, fmt.Errorf("dial gemini live: %w", err)
	}

	conn.SetReadLimit(readLimit)

	var setup liveSetup
	setup.Setup.Model = "models/" + g.config.Model
	setup.Setup.GenerationConfig.ResponseModalities = []string{"AUDIO"}
	setup.Setup.SystemInstruction = &liveContent{Parts: []livePart{{Text: brief}}}

	session := &liveSession{
		cancel: cancel,
		conn:   conn,
		events: make(chan voice.Event, eventBuffer),
	}

	if err := session.write(sessionCtx, setup); err != nil {
		_ = session.Close()

		return nil, fmt.Errorf("send setup: %w", err)
	}

	go session.read(sessionCtx)

	return session, nil
}

func (s *liveSession) Events() <-chan voice.Event {
	return s.events
}

func (s *liveSession) Send(ctx context.Context, pcm []byte) error {
	var input liveRealtimeInput
	input.RealtimeInput.MediaChunks = []liveBlob{{
		Data:     base64.StdEncoding.EncodeToString(pcm),
		MimeType: inputMimeType,
	}}

	if err := s.write(ctx, input); err != nil {
		return fmt.Errorf("send audio: %w", err)
	}

	return nil
}

func (s *liveSession) Close() error {
	s.closed.Do(func() {
		s.cancel()
		_ = s.conn.CloseNow()
		close(s.events)
	})

	return nil
}

func (s *liveSession) write(ctx context.Context, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("encode message: %w", err)
	}

	s.writes.Lock()
	defer s.writes.Unlock()

	return s.conn.Write(ctx, websocket.MessageText, body)
}

func (s *liveSession) read(ctx context.Context) {
	defer func() { _ = s.Close() }()

	for {
		_, data, err := s.conn.Read(ctx)
		if err != nil {
			return
		}

		var message liveServerMessage
		if err := json.Unmarshal(data, &message); err != nil {
			continue
		}

		if message.ServerContent == nil {
			continue
		}

		if message.ServerContent.Interrupted {
			s.emit(ctx, voice.Event{Interrupted: true})
		}

		if message.ServerContent.ModelTurn != nil {
			for _, part := range message.ServerContent.ModelTurn.Parts {
				s.emitPart(ctx, part)
			}
		}

		if message.ServerContent.TurnComplete {
			s.emit(ctx, voice.Event{TurnComplete: true})
		}
	}
}

func (s *liveSession) emitPart(ctx context.Context, part livePart) {
	if part.Text != "" {
		s.emit(ctx, voice.Event{Text: part.Text})
	}

	if part.InlineData == nil {
		return
	}

	audio, err := base64.StdEncoding.DecodeString(part.InlineData.Data)
	if err != nil {
		return
	}

	s.emit(ctx, voice.Event{Audio: audio})
}

func (s *liveSession) emit(ctx context.Context, event voice.Event) {
	select {
	case s.events <- event:
	case <-ctx.Done():
	}
}
