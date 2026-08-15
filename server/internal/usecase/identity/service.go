package identity

import (
	"context"
	"fmt"
	"time"

	"github.com/octane/entwine/server/internal/domain"
)

type UserRepository interface {
	Upsert(ctx context.Context, user domain.User) (isNew bool, err error)
}

type Service struct {
	users UserRepository
	now   func() time.Time
}

func NewService(users UserRepository, now func() time.Time) *Service {
	return &Service{users: users, now: now}
}

func (s *Service) Ensure(ctx context.Context, identity domain.Identity) (domain.User, bool, error) {
	user, err := domain.NewUser(identity.ID, identity.Email, s.now())
	if err != nil {
		return domain.User{}, false, fmt.Errorf("build user %s: %w", identity.ID, err)
	}

	isNew, err := s.users.Upsert(ctx, user)
	if err != nil {
		return domain.User{}, false, fmt.Errorf("upsert user %s: %w", user.ID, err)
	}

	return user, isNew, nil
}
