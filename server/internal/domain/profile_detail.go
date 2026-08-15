package domain

import (
	"fmt"
	"strings"
	"time"
)

type DetailSource string

const (
	DetailSourceManual   DetailSource = "manual"
	DetailSourceResume   DetailSource = "resume"
	DetailSourceInferred DetailSource = "inferred"
)

type Experience struct {
	ID             string
	ProfileID      string
	Company        string
	Position       string
	EmploymentType string
	Location       string
	Remote         string
	StartDate      time.Time
	EndDate        *time.Time
	Summary        string
	Highlights     []string
	Tech           []string
	Source         DetailSource
}

type Education struct {
	ID          string
	ProfileID   string
	Institution string
	Area        string
	StudyType   string
	StartDate   *time.Time
	EndDate     *time.Time
	Score       string
	Source      DetailSource
}

type Skill struct {
	ID            string
	ProfileID     string
	Name          string
	CanonicalName string
	Years         float64
	LastUsed      *time.Time
	Source        DetailSource
}

type ProfileDetail struct {
	Experiences []Experience
	Educations  []Education
	Skills      []Skill
}

func (e Experience) IsCurrent() bool {
	return e.EndDate == nil
}

func NewExperience(experience Experience) (Experience, error) {
	if strings.TrimSpace(experience.Company) == "" {
		return Experience{}, fmt.Errorf("company is empty: %w", ErrInvalidProfile)
	}

	if strings.TrimSpace(experience.Position) == "" {
		return Experience{}, fmt.Errorf("position is empty: %w", ErrInvalidProfile)
	}

	if experience.StartDate.IsZero() {
		return Experience{}, fmt.Errorf("start date is missing: %w", ErrInvalidProfile)
	}

	if experience.EndDate != nil && experience.EndDate.Before(experience.StartDate) {
		return Experience{}, fmt.Errorf("end date precedes start date: %w", ErrInvalidProfile)
	}

	source, err := knownSource(experience.Source)
	if err != nil {
		return Experience{}, err
	}

	experience.Source = source

	return experience, nil
}

func NewEducation(education Education) (Education, error) {
	if strings.TrimSpace(education.Institution) == "" {
		return Education{}, fmt.Errorf("institution is empty: %w", ErrInvalidProfile)
	}

	if education.StartDate != nil && education.EndDate != nil &&
		education.EndDate.Before(*education.StartDate) {
		return Education{}, fmt.Errorf("end date precedes start date: %w", ErrInvalidProfile)
	}

	source, err := knownSource(education.Source)
	if err != nil {
		return Education{}, err
	}

	education.Source = source

	return education, nil
}

func NewSkill(skill Skill) (Skill, error) {
	name := strings.TrimSpace(skill.Name)
	if name == "" {
		return Skill{}, fmt.Errorf("skill name is empty: %w", ErrInvalidProfile)
	}

	if skill.Years < 0 {
		return Skill{}, fmt.Errorf("years %v is negative: %w", skill.Years, ErrInvalidProfile)
	}

	source, err := knownSource(skill.Source)
	if err != nil {
		return Skill{}, err
	}

	skill.Name = name
	skill.CanonicalName = CanonicalSkill(name)
	skill.Source = source

	return skill, nil
}

func knownSource(source DetailSource) (DetailSource, error) {
	if source == "" {
		return DetailSourceManual, nil
	}

	switch source {
	case DetailSourceManual, DetailSourceResume, DetailSourceInferred:
		return source, nil
	default:
		return "", fmt.Errorf("source %q is unknown: %w", source, ErrInvalidProfile)
	}
}
