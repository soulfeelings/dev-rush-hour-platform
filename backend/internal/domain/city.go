package domain

import (
	"time"

	"github.com/google/uuid"
)

type City struct {
	ID        uuid.UUID
	Slug      string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}
