package domain

import (
	"time"

	"github.com/google/uuid"
)

type City struct {
	ID        uuid.UUID
	Slug      string
	Name      string
	Status    CityStatus
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

type CityStatus string

const (
	CityStatusActive   CityStatus = "active"
	CityStatusInactive CityStatus = "inactive"
)
