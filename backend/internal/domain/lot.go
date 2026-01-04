package domain

import (
	"time"

	"github.com/google/uuid"
)

type Lot struct {
	ID            uuid.UUID
	Status        LotStatus
	ProjectID     *uuid.UUID
	DeveloperID   *uuid.UUID
	AreaID        *uuid.UUID
	Type          LotType
	Bedrooms      *int
	Bathrooms     *int
	AreaSqm       *float64
	Floor         *int
	PriceCurrency string
	PriceAmount   float64
	BonusKeys     []string
	Data          LotData
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type LotData struct {
	Media          *LotMedia           `json:"media,omitempty"`
	PaymentPlan    *PaymentPlan        `json:"paymentPlan,omitempty"`
	Bonuses        []Bonus             `json:"bonuses,omitempty"`
	FloorPosition  *FloorPosition      `json:"floorPosition,omitempty"`
	Tags           []string            `json:"tags,omitempty"`
}

type LotMedia struct {
	Photos          []MediaItem `json:"photos,omitempty"`
	FloorPlanImages []MediaItem `json:"floorPlanImages,omitempty"`
	Cover           *MediaItem  `json:"cover,omitempty"`
}

type PaymentPlan struct {
	Schedule []PaymentScheduleItem `json:"schedule,omitempty"`
}

type PaymentScheduleItem struct {
	Stage     string  `json:"stage"`
	Percent   float64 `json:"percent"`
	Amount    float64 `json:"amount,omitempty"`
	DueDate   string  `json:"dueDate,omitempty"`
}

type Bonus struct {
	Title       string `json:"title"`
	Style       string `json:"style,omitempty"`
	Description string `json:"description,omitempty"`
}

type FloorPosition struct {
	Label string  `json:"label"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
}

