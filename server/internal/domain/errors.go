package domain

import "errors"

var (
	ErrNotFound        = errors.New("not found")
	ErrConflict        = errors.New("conflict")
	ErrInvalidUser     = errors.New("invalid user")
	ErrInvalidProfile  = errors.New("invalid profile")
	ErrProfileNotFound = errors.New("profile not found")
	ErrUnauthorized    = errors.New("unauthorized")
)
