package postgres_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/storage/postgres"
)

func TestUserRepoUpsert(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is unset; skipping the scratch-database test")
	}

	db, err := postgres.Open(dsn)
	if err != nil {
		t.Fatalf("open: %v", err)
	}

	t.Cleanup(func() {
		if closeErr := postgres.Close(db); closeErr != nil {
			t.Errorf("close: %v", closeErr)
		}
	})

	repo := postgres.NewUserRepo(db)
	ctx := context.Background()
	id := "11111111-1111-1111-1111-111111111111"
	createdAt := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)

	t.Cleanup(func() {
		db.Exec("delete from users where id = ?", id)
	})

	first, err := domain.NewUser(id, "first@entwine.dev", createdAt)
	if err != nil {
		t.Fatalf("build user: %v", err)
	}

	isNew, err := repo.Upsert(ctx, first)
	if err != nil {
		t.Fatalf("first upsert: %v", err)
	}

	if !isNew {
		t.Error("got isNew false on the first upsert, want true")
	}

	second, err := domain.NewUser(id, "second@entwine.dev", createdAt.Add(time.Hour))
	if err != nil {
		t.Fatalf("build user: %v", err)
	}

	isNew, err = repo.Upsert(ctx, second)
	if err != nil {
		t.Fatalf("second upsert: %v", err)
	}

	if isNew {
		t.Error("got isNew true on the second upsert, want false")
	}

	var (
		count int64
		email string
	)

	db.Raw("select count(*) from users where id = ?", id).Scan(&count)
	db.Raw("select email from users where id = ?", id).Scan(&email)

	if count != 1 {
		t.Errorf("got %d rows for the same id, want 1", count)
	}

	if email != "second@entwine.dev" {
		t.Errorf("got email %q, want the second upsert to win", email)
	}
}
