package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"

	"github.com/octane/entwine/server/internal/domain"
)

type experienceRow struct {
	ID             string         `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	ProfileID      string         `gorm:"column:profile_id;type:uuid"`
	Company        string         `gorm:"column:company"`
	Position       string         `gorm:"column:position"`
	EmploymentType *string        `gorm:"column:employment_type"`
	Location       *string        `gorm:"column:location"`
	Remote         *string        `gorm:"column:remote"`
	StartDate      time.Time      `gorm:"column:start_date"`
	EndDate        *time.Time     `gorm:"column:end_date"`
	Summary        *string        `gorm:"column:summary"`
	Highlights     pq.StringArray `gorm:"column:highlights;type:text[]"`
	Tech           pq.StringArray `gorm:"column:tech;type:text[]"`
	Source         string         `gorm:"column:source"`
	UpdatedAt      time.Time      `gorm:"column:updated_at"`
}

func (experienceRow) TableName() string { return "profile_experiences" }

type educationRow struct {
	ID          string     `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	ProfileID   string     `gorm:"column:profile_id;type:uuid"`
	Institution string     `gorm:"column:institution"`
	Area        *string    `gorm:"column:area"`
	StudyType   *string    `gorm:"column:study_type"`
	StartDate   *time.Time `gorm:"column:start_date"`
	EndDate     *time.Time `gorm:"column:end_date"`
	Score       *string    `gorm:"column:score"`
	Source      string     `gorm:"column:source"`
	UpdatedAt   time.Time  `gorm:"column:updated_at"`
}

func (educationRow) TableName() string { return "profile_educations" }

type skillRow struct {
	ID            string     `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	ProfileID     string     `gorm:"column:profile_id;type:uuid"`
	Name          string     `gorm:"column:name"`
	CanonicalName string     `gorm:"column:canonical_name"`
	Years         *float64   `gorm:"column:years"`
	LastUsed      *time.Time `gorm:"column:last_used"`
	Source        string     `gorm:"column:source"`
	UpdatedAt     time.Time  `gorm:"column:updated_at"`
}

func (skillRow) TableName() string { return "profile_skills" }

type ProfileDetailRepo struct {
	db *gorm.DB
}

func NewProfileDetailRepo(db *gorm.DB) *ProfileDetailRepo {
	return &ProfileDetailRepo{db: db}
}

func (r *ProfileDetailRepo) Get(ctx context.Context, profileID string) (domain.ProfileDetail, error) {
	var experiences []experienceRow
	if err := r.db.WithContext(ctx).
		Where("profile_id = ?", profileID).
		Order("end_date desc nulls first, start_date desc").
		Find(&experiences).Error; err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("list experiences: %w", err)
	}

	var educations []educationRow
	if err := r.db.WithContext(ctx).
		Where("profile_id = ?", profileID).
		Order("end_date desc nulls first").
		Find(&educations).Error; err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("list educations: %w", err)
	}

	var skills []skillRow
	if err := r.db.WithContext(ctx).
		Where("profile_id = ?", profileID).
		Order("years desc nulls last, canonical_name").
		Find(&skills).Error; err != nil {
		return domain.ProfileDetail{}, fmt.Errorf("list skills: %w", err)
	}

	detail := domain.ProfileDetail{
		Experiences: make([]domain.Experience, 0, len(experiences)),
		Educations:  make([]domain.Education, 0, len(educations)),
		Skills:      make([]domain.Skill, 0, len(skills)),
	}

	for _, row := range experiences {
		detail.Experiences = append(detail.Experiences, row.toDomain())
	}

	for _, row := range educations {
		detail.Educations = append(detail.Educations, row.toDomain())
	}

	for _, row := range skills {
		detail.Skills = append(detail.Skills, row.toDomain())
	}

	return detail, nil
}

func (r *ProfileDetailRepo) Replace(
	ctx context.Context, profileID string, detail domain.ProfileDetail, now time.Time,
) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, table := range []string{"profile_experiences", "profile_educations", "profile_skills"} {
			if err := tx.Exec("delete from "+table+" where profile_id = ?", profileID).Error; err != nil {
				return fmt.Errorf("clear %s: %w", table, err)
			}
		}

		if len(detail.Experiences) > 0 {
			rows := make([]experienceRow, 0, len(detail.Experiences))
			for _, experience := range detail.Experiences {
				rows = append(rows, rowFromExperience(profileID, experience, now))
			}

			if err := tx.Create(&rows).Error; err != nil {
				return fmt.Errorf("insert experiences: %w", err)
			}
		}

		if len(detail.Educations) > 0 {
			rows := make([]educationRow, 0, len(detail.Educations))
			for _, education := range detail.Educations {
				rows = append(rows, rowFromEducation(profileID, education, now))
			}

			if err := tx.Create(&rows).Error; err != nil {
				return fmt.Errorf("insert educations: %w", err)
			}
		}

		if len(detail.Skills) > 0 {
			rows := make([]skillRow, 0, len(detail.Skills))
			for _, skill := range detail.Skills {
				rows = append(rows, rowFromSkill(profileID, skill, now))
			}

			if err := tx.Create(&rows).Error; err != nil {
				return fmt.Errorf("insert skills: %w", err)
			}
		}

		return nil
	})
}

func (r experienceRow) toDomain() domain.Experience {
	return domain.Experience{
		ID:             r.ID,
		ProfileID:      r.ProfileID,
		Company:        r.Company,
		Position:       r.Position,
		EmploymentType: derefString(r.EmploymentType),
		Location:       derefString(r.Location),
		Remote:         derefString(r.Remote),
		StartDate:      r.StartDate,
		EndDate:        r.EndDate,
		Summary:        derefString(r.Summary),
		Highlights:     r.Highlights,
		Tech:           r.Tech,
		Source:         domain.DetailSource(r.Source),
	}
}

func (r educationRow) toDomain() domain.Education {
	return domain.Education{
		ID:          r.ID,
		ProfileID:   r.ProfileID,
		Institution: r.Institution,
		Area:        derefString(r.Area),
		StudyType:   derefString(r.StudyType),
		StartDate:   r.StartDate,
		EndDate:     r.EndDate,
		Score:       derefString(r.Score),
		Source:      domain.DetailSource(r.Source),
	}
}

func (r skillRow) toDomain() domain.Skill {
	years := 0.0
	if r.Years != nil {
		years = *r.Years
	}

	return domain.Skill{
		ID:            r.ID,
		ProfileID:     r.ProfileID,
		Name:          r.Name,
		CanonicalName: r.CanonicalName,
		Years:         years,
		LastUsed:      r.LastUsed,
		Source:        domain.DetailSource(r.Source),
	}
}

func rowFromExperience(profileID string, e domain.Experience, now time.Time) experienceRow {
	return experienceRow{
		ProfileID:      profileID,
		Company:        e.Company,
		Position:       e.Position,
		EmploymentType: nullableString(e.EmploymentType),
		Location:       nullableString(e.Location),
		Remote:         nullableString(e.Remote),
		StartDate:      e.StartDate,
		EndDate:        e.EndDate,
		Summary:        nullableString(e.Summary),
		Highlights:     textArray(e.Highlights),
		Tech:           textArray(e.Tech),
		Source:         string(e.Source),
		UpdatedAt:      now,
	}
}

func rowFromEducation(profileID string, e domain.Education, now time.Time) educationRow {
	return educationRow{
		ProfileID:   profileID,
		Institution: e.Institution,
		Area:        nullableString(e.Area),
		StudyType:   nullableString(e.StudyType),
		StartDate:   e.StartDate,
		EndDate:     e.EndDate,
		Score:       nullableString(e.Score),
		Source:      string(e.Source),
		UpdatedAt:   now,
	}
}

func rowFromSkill(profileID string, s domain.Skill, now time.Time) skillRow {
	var years *float64
	if s.Years > 0 {
		years = &s.Years
	}

	return skillRow{
		ProfileID:     profileID,
		Name:          s.Name,
		CanonicalName: s.CanonicalName,
		Years:         years,
		LastUsed:      s.LastUsed,
		Source:        string(s.Source),
		UpdatedAt:     now,
	}
}

func nullableString(value string) *string {
	if value == "" {
		return nil
	}

	return &value
}
