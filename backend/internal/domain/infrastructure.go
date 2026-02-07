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
	Status          InfrastructureStatus
	SortOrder       int
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

type InfrastructureStatus string

const (
	InfrastructureStatusActive   InfrastructureStatus = "active"
	InfrastructureStatusInactive InfrastructureStatus = "inactive"
)
