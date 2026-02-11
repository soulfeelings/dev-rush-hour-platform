package domain

import (
	"time"

	"github.com/google/uuid"
)

type Infrastructure struct {
	ID              uuid.UUID
	Slug            string
	Name            string
	BackgroundColor string
	TextColor       string
	Icon            *string
	SortOrder       int
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}
