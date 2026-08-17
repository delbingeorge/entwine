package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/octane/entwine/server/internal/domain"
)

type candidateProfileRow struct {
	ID             string         `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID         string         `gorm:"column:user_id;type:uuid"`
	Seniority      string         `gorm:"column:seniority"`
	Locations      pq.StringArray `gorm:"column:locations;type:text[]"`
	SalaryMin      *int64         `gorm:"column:salary_expectation_min"`
	SalaryCurrency *string        `gorm:"column:salary_currency"`
	Status         string         `gorm:"column:status"`
	UpdatedAt      time.Time      `gorm:"column:updated_at"`
}

func (candidateProfileRow) TableName() string { return "candidate_profiles" }

func (r candidateProfileRow) toDomain() (domain.CandidateProfile, error) {
	return domain.NewCandidateProfile(domain.NewCandidateProfileParams{
		ID:             r.ID,
		UserID:         r.UserID,
		Seniority:      domain.Seniority(r.Seniority),
		Locations:      r.Locations,
		SalaryMin:      derefInt64(r.SalaryMin),
		SalaryCurrency: derefString(r.SalaryCurrency),
		Status:         domain.ProfileStatus(r.Status),
	})
}

func rowFromProfile(profile domain.CandidateProfile, now time.Time) candidateProfileRow {
	return candidateProfileRow{
		UserID:         profile.UserID,
		Seniority:      string(profile.Seniority),
		Locations:      textArray(profile.Locations),
		SalaryMin:      &profile.SalaryMin,
		SalaryCurrency: &profile.SalaryCurrency,
		Status:         string(profile.Status),
		UpdatedAt:      now,
	}
}

type CandidateProfileRepo struct {
	db *gorm.DB
}

func NewCandidateProfileRepo(db *gorm.DB) *CandidateProfileRepo {
	return &CandidateProfileRepo{db: db}
}

func (repo *CandidateProfileRepo) GetByUserID(
	ctx context.Context,
	userID string,
) (domain.CandidateProfile, error) {
	var row candidateProfileRow

	err := repo.db.WithContext(ctx).Where("user_id = ?", userID).First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return domain.CandidateProfile{}, fmt.Errorf(
			"profile for user %s: %w", userID, domain.ErrProfileNotFound)
	}

	if err != nil {
		return domain.CandidateProfile{}, fmt.Errorf("read profile for user %s: %w", userID, err)
	}

	return row.toDomain()
}

func (repo *CandidateProfileRepo) Save(
	ctx context.Context,
	profile domain.CandidateProfile,
	now time.Time,
) (domain.CandidateProfile, error) {
	row := rowFromProfile(profile, now)

	err := repo.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"seniority",
			"locations",
			"salary_expectation_min",
			"salary_currency",
			"status",
			"updated_at",
		}),
	}).Create(&row).Error
	if err != nil {
		return domain.CandidateProfile{}, fmt.Errorf(
			"save profile for user %s: %w", profile.UserID, err)
	}

	return row.toDomain()
}

// textArray keeps nil slices out of not-null text[] columns, where they would
// be written as NULL rather than falling back to the column default.
func textArray(values []string) pq.StringArray {
	if values == nil {
		return pq.StringArray{}
	}

	return values
}

func derefInt64(value *int64) int64 {
	if value == nil {
		return 0
	}

	return *value
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}

	return *value
}
