package domain

import (
	"time"

	"github.com/google/uuid"
)

type Badge struct {
	ID              uuid.UUID
	Slug            string
	Name            string
	BackgroundColor string
	TextColor       string
	Icon            *string
	IconColor       string
	SortOrder       int
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

type ProjectBadge struct {
	ProjectID uuid.UUID
	BadgeID   uuid.UUID
	SortOrder int
	CreatedAt time.Time
	Badge     *Badge
}

type LotBadge struct {
	LotID     uuid.UUID
	BadgeID   uuid.UUID
	SortOrder int
	CreatedAt time.Time
	Badge     *Badge
}
