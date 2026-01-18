package domain

import (
	"time"

	"github.com/google/uuid"
)

type Lead struct {
	ID        uuid.UUID
	Status    LeadStatus
	Type      LeadType
	Source    *string
	ProjectID *uuid.UUID
	LotID     *uuid.UUID
	Name      string
	Phone     string
	Email     *string
	Data      LeadData
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt     *time.Time
}

type LeadData struct {
	Preferred *string                `json:"preferred,omitempty"`
	Comment   *string                `json:"comment,omitempty"`
	PageURL   *string                `json:"pageUrl,omitempty"`
	UTM       map[string]interface{} `json:"utm,omitempty"`
}

