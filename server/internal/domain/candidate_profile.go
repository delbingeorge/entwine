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

type RemotePref string

const (
	RemotePrefRemote RemotePref = "remote"
	RemotePrefHybrid RemotePref = "hybrid"
	RemotePrefOnsite RemotePref = "onsite"
	RemotePrefAny    RemotePref = "any"
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
	PrimaryStack   []string
	Locations      []string
	RemotePref     RemotePref
	SalaryMin      int64
	SalaryCurrency string
	WantsToBuild   string
	Status         ProfileStatus
}

type NewCandidateProfileParams struct {
	ID             string
	UserID         string
	Seniority      Seniority
	PrimaryStack   []string
	Locations      []string
	RemotePref     RemotePref
	SalaryMin      int64
	SalaryCurrency string
	WantsToBuild   string
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

	if !params.RemotePref.isKnown() {
		return CandidateProfile{}, fmt.Errorf(
			"remote preference %q is unknown: %w", params.RemotePref, ErrInvalidProfile)
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

	if status == ProfileStatusActive && len(params.PrimaryStack) == 0 {
		return CandidateProfile{}, fmt.Errorf(
			"an active profile needs a stack: %w", ErrInvalidProfile)
	}

	return CandidateProfile{
		ID:             params.ID,
		UserID:         params.UserID,
		Seniority:      params.Seniority,
		PrimaryStack:   params.PrimaryStack,
		Locations:      params.Locations,
		RemotePref:     params.RemotePref,
		SalaryMin:      params.SalaryMin,
		SalaryCurrency: params.SalaryCurrency,
		WantsToBuild:   params.WantsToBuild,
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

func (r RemotePref) isKnown() bool {
	switch r {
	case RemotePrefRemote, RemotePrefHybrid, RemotePrefOnsite, RemotePrefAny:
		return true
	default:
		return false
	}
}
