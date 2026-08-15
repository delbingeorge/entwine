package domain

import (
	"fmt"
	"strings"
	"time"
)

type Identity struct {
	ID    string
	Email string
}

type User struct {
	ID        string
	Email     string
	CreatedAt time.Time
}

func NewUser(id, email string, createdAt time.Time) (User, error) {
	if strings.TrimSpace(id) == "" {
		return User{}, fmt.Errorf("id is empty: %w", ErrInvalidUser)
	}

	if !strings.Contains(email, "@") {
		return User{}, fmt.Errorf("email %q is not an address: %w", email, ErrInvalidUser)
	}

	if createdAt.IsZero() {
		return User{}, fmt.Errorf("created at is zero: %w", ErrInvalidUser)
	}

	return User{ID: id, Email: email, CreatedAt: createdAt}, nil
}
