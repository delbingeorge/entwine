package postgres_test

import (
	"context"
	"errors"
	"os"
	"testing"
	"time"

	"gorm.io/gorm"

	"github.com/octane/entwine/server/internal/domain"
	"github.com/octane/entwine/server/internal/storage/postgres"
)

func profileFixture(t *testing.T, userID string) (*gorm.DB, *postgres.CandidateProfileRepo) {
	t.Helper()

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is unset; skipping the scratch-database test")
	}

	db, err := postgres.Open(dsn)
	if err != nil {
		t.Fatalf("open: %v", err)
	}

	t.Cleanup(func() {
		db.Exec("delete from candidate_profiles where user_id = ?", userID)
		db.Exec("delete from users where id = ?", userID)

		if closeErr := postgres.Close(db); closeErr != nil {
			t.Errorf("close: %v", closeErr)
		}
	})

	user, err := domain.NewUser(userID, "profile@entwine.dev", time.Now())
	if err != nil {
		t.Fatalf("build user: %v", err)
	}

	if _, err := postgres.NewUserRepo(db).Upsert(context.Background(), user); err != nil {
		t.Fatalf("seed user: %v", err)
	}

	return db, postgres.NewCandidateProfileRepo(db)
}

func TestCandidateProfileNotFound(t *testing.T) {
	userID := "22222222-2222-2222-2222-222222222222"
	_, repo := profileFixture(t, userID)

	_, err := repo.GetByUserID(context.Background(), userID)

	if !errors.Is(err, domain.ErrProfileNotFound) {
		t.Fatalf("got error %v, want %v", err, domain.ErrProfileNotFound)
	}
}

func TestCandidateProfileSaveAndRead(t *testing.T) {
	userID := "33333333-3333-3333-3333-333333333333"
	_, repo := profileFixture(t, userID)
	ctx := context.Background()
	now := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)

	profile, err := domain.NewCandidateProfile(domain.NewCandidateProfileParams{
		UserID:         userID,
		Seniority:      domain.SenioritySenior,
		Locations:      []string{"Bengaluru", "Anywhere remote"},
		SalaryMin:      2_500_000,
		SalaryCurrency: "INR",
		Status:         domain.ProfileStatusActive,
	})
	if err != nil {
		t.Fatalf("build profile: %v", err)
	}

	if _, err := repo.Save(ctx, profile, now); err != nil {
		t.Fatalf("save: %v", err)
	}

	stored, err := repo.GetByUserID(ctx, userID)
	if err != nil {
		t.Fatalf("read back: %v", err)
	}

	if len(stored.Locations) != 2 || stored.Locations[0] != "Bengaluru" {
		t.Errorf("got locations %v, want the saved text[] round-tripped", stored.Locations)
	}

	if stored.SalaryMin != 2_500_000 {
		t.Errorf("got salary %d, want 2500000", stored.SalaryMin)
	}

	if stored.Status != domain.ProfileStatusActive {
		t.Errorf("got status %q, want active", stored.Status)
	}
}

func TestCandidateProfileSaveIsIdempotentPerUser(t *testing.T) {
	userID := "44444444-4444-4444-4444-444444444444"
	db, repo := profileFixture(t, userID)
	ctx := context.Background()
	now := time.Date(2026, time.August, 15, 9, 0, 0, 0, time.UTC)

	build := func(locations []string) domain.CandidateProfile {
		profile, err := domain.NewCandidateProfile(domain.NewCandidateProfileParams{
			UserID:    userID,
			Seniority: domain.SeniorityMid,
			Locations: locations,
			Status:    domain.ProfileStatusActive,
		})
		if err != nil {
			t.Fatalf("build profile: %v", err)
		}

		return profile
	}

	if _, err := repo.Save(ctx, build([]string{"Bengaluru"}), now); err != nil {
		t.Fatalf("first save: %v", err)
	}

	if _, err := repo.Save(ctx, build([]string{"Pune", "Mumbai"}), now); err != nil {
		t.Fatalf("second save: %v", err)
	}

	var count int64
	db.Raw("select count(*) from candidate_profiles where user_id = ?", userID).Scan(&count)

	if count != 1 {
		t.Errorf("got %d profiles for one user, want 1", count)
	}

	stored, err := repo.GetByUserID(ctx, userID)
	if err != nil {
		t.Fatalf("read back: %v", err)
	}

	if len(stored.Locations) != 2 {
		t.Errorf("got locations %v, want the second save to win", stored.Locations)
	}
}
