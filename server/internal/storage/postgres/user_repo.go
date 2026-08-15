package postgres

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/octane/entwine/server/internal/domain"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}

// Upsert reports whether the row was inserted. Postgres sets xmax to zero on an
// insert and to the updating transaction id on a conflict update.
func (repo *UserRepo) Upsert(ctx context.Context, user domain.User) (bool, error) {
	var result struct {
		IsNew bool
	}

	err := repo.db.WithContext(ctx).Raw(`
		insert into users (id, email, created_at)
		values (?, ?, ?)
		on conflict (id) do update set email = excluded.email
		returning (xmax = 0) as is_new
	`, user.ID, user.Email, user.CreatedAt).Scan(&result).Error
	if err != nil {
		return false, fmt.Errorf("upsert user %s: %w", user.ID, err)
	}

	return result.IsNew, nil
}
