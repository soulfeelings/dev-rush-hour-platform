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
	Status          BadgeStatus
	SortOrder       int
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

type BadgeStatus string

const (
	BadgeStatusActive   BadgeStatus = "active"
	BadgeStatusInactive BadgeStatus = "inactive"
)

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
