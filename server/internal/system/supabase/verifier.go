package supabase

import (
	"context"
	"fmt"
	"time"

	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"

	"github.com/octane/entwine/server/internal/domain"
)

type Verifier struct {
	cache    *jwk.Cache
	jwksURL  string
	issuer   string
	audience string
}

const registerTimeout = 15 * time.Second

func NewVerifier(ctx context.Context, jwksURL, issuer, audience string) (*Verifier, error) {
	cache, err := jwk.NewCache(ctx, httprc.NewClient())
	if err != nil {
		return nil, fmt.Errorf("create jwks cache: %w", err)
	}

	// Register fetches the key set eagerly and retries indefinitely, so an
	// unreachable JWKS URL must fail startup rather than hang it.
	registerCtx, cancel := context.WithTimeout(ctx, registerTimeout)
	defer cancel()

	if err := cache.Register(registerCtx, jwksURL); err != nil {
		return nil, fmt.Errorf("register jwks %s: %w", jwksURL, err)
	}

	return &Verifier{cache: cache, jwksURL: jwksURL, issuer: issuer, audience: audience}, nil
}

func (v *Verifier) Verify(ctx context.Context, rawToken string) (domain.Identity, error) {
	keys, err := v.cache.Lookup(ctx, v.jwksURL)
	if err != nil {
		return domain.Identity{}, fmt.Errorf("lookup jwks: %w", err)
	}

	token, err := jwt.Parse([]byte(rawToken), jwt.WithKeySet(keys))
	if err != nil {
		return domain.Identity{}, fmt.Errorf("parse token: %w: %w", domain.ErrUnauthorized, err)
	}

	if err := jwt.Validate(token, jwt.WithIssuer(v.issuer), jwt.WithAudience(v.audience)); err != nil {
		return domain.Identity{}, fmt.Errorf("validate token: %w: %w", domain.ErrUnauthorized, err)
	}

	subject, ok := token.Subject()
	if !ok || subject == "" {
		return domain.Identity{}, fmt.Errorf("token has no subject: %w", domain.ErrUnauthorized)
	}

	var email string
	if err := token.Get("email", &email); err != nil {
		return domain.Identity{}, fmt.Errorf("token has no email: %w", domain.ErrUnauthorized)
	}

	return domain.Identity{ID: subject, Email: email}, nil
}
