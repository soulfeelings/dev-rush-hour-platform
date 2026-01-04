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
	Data      map[string]interface{}
	CreatedAt time.Time
	UpdatedAt time.Time
}

