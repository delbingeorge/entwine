package domain

import "errors"

var (
	ErrNotFound     = errors.New("not found")
	ErrConflict     = errors.New("conflict")
	ErrInvalidUser  = errors.New("invalid user")
	ErrUnauthorized = errors.New("unauthorized")
)
