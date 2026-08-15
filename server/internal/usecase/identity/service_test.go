package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/usecase/identity"
)

type fakeUsers struct {
	saved   []domain.User
	failErr error
	isNew   bool
}

func (f *fakeUsers) Upsert(_ context.Context, user domain.User) (bool, error) {
	if f.failErr != nil {
		return false, f.failErr
	}

	f.saved = append(f.saved, user)

	return f.isNew, nil
}

func TestEnsure(t *testing.T) {
	fixedNow := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)
	repoErr := errors.New("database down")

	tests := []struct {
		name      string
		identity  domain.Identity
		repoErr   error
		wantErr   error
		wantSaved int
	}{
		{
			name:      "upserts a valid identity",
			identity:  domain.Identity{ID: "a1", Email: "dev@entwine.dev"},
			wantSaved: 1,
		},
		{
			name:     "rejects a blank id",
			identity: domain.Identity{ID: "  ", Email: "dev@entwine.dev"},
			wantErr:  domain.ErrInvalidUser,
		},
		{
			name:     "rejects a malformed email",
			identity: domain.Identity{ID: "a1", Email: "not-an-address"},
			wantErr:  domain.ErrInvalidUser,
		},
		{
			name:     "propagates repository failures",
			identity: domain.Identity{ID: "a1", Email: "dev@entwine.dev"},
			repoErr:  repoErr,
			wantErr:  repoErr,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			users := &fakeUsers{failErr: test.repoErr}
			service := identity.NewService(users, func() time.Time { return fixedNow })

			user, _, err := service.Ensure(context.Background(), test.identity)

			if test.wantErr != nil {
				if !errors.Is(err, test.wantErr) {
					t.Fatalf("got error %v, want %v", err, test.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if user.ID != test.identity.ID || user.Email != test.identity.Email {
				t.Errorf("got user %+v, want id %s and email %s", user, test.identity.ID, test.identity.Email)
			}

			if !user.CreatedAt.Equal(fixedNow) {
				t.Errorf("got created at %v, want the injected clock %v", user.CreatedAt, fixedNow)
			}

			if len(users.saved) != test.wantSaved {
				t.Errorf("got %d saved users, want %d", len(users.saved), test.wantSaved)
			}
		})
	}
}
