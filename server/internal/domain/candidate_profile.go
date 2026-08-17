package domain

import (
	"fmt"
	"strings"
)

type Seniority string

const (
	SeniorityJunior Seniority = "junior"
	SeniorityMid    Seniority = "mid"
	SenioritySenior Seniority = "senior"
	SeniorityStaff  Seniority = "staff"
)

type ProfileStatus string

const (
	ProfileStatusDraft  ProfileStatus = "draft"
	ProfileStatusActive ProfileStatus = "active"
)

type CandidateProfile struct {
	ID             string
	UserID         string
	Seniority      Seniority
	Locations      []string
	SalaryMin      int64
	SalaryCurrency string
	Status         ProfileStatus
}

type NewCandidateProfileParams struct {
	ID             string
	UserID         string
	Seniority      Seniority
	Locations      []string
	SalaryMin      int64
	SalaryCurrency string
	Status         ProfileStatus
}

func NewCandidateProfile(params NewCandidateProfileParams) (CandidateProfile, error) {
	if strings.TrimSpace(params.UserID) == "" {
		return CandidateProfile{}, fmt.Errorf("user id is empty: %w", ErrInvalidProfile)
	}

	if !params.Seniority.isKnown() {
		return CandidateProfile{}, fmt.Errorf(
			"seniority %q is unknown: %w", params.Seniority, ErrInvalidProfile)
	}

	if params.SalaryMin < 0 {
		return CandidateProfile{}, fmt.Errorf(
			"salary floor %d is negative: %w", params.SalaryMin, ErrInvalidProfile)
	}

	status := params.Status
	if status == "" {
		status = ProfileStatusDraft
	}

	if status != ProfileStatusDraft && status != ProfileStatusActive {
		return CandidateProfile{}, fmt.Errorf("status %q is unknown: %w", status, ErrInvalidProfile)
	}

	if status == ProfileStatusActive && len(params.Locations) == 0 {
		return CandidateProfile{}, fmt.Errorf(
			"an active profile needs at least one location: %w", ErrInvalidProfile)
	}

	return CandidateProfile{
		ID:             params.ID,
		UserID:         params.UserID,
		Seniority:      params.Seniority,
		Locations:      params.Locations,
		SalaryMin:      params.SalaryMin,
		SalaryCurrency: params.SalaryCurrency,
		Status:         status,
	}, nil
}

func (s Seniority) isKnown() bool {
	switch s {
	case SeniorityJunior, SeniorityMid, SenioritySenior, SeniorityStaff:
		return true
	default:
		return false
	}
}
