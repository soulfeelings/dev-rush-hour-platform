package domain

import (
	"time"

	"github.com/google/uuid"
)

type Developer struct {
	ID        uuid.UUID
	Slug      string
	Name      string
	Status    DeveloperStatus
	LogoURL   string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

