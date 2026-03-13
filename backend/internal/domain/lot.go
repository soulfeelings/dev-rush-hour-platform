package domain

import (
	"time"

	"github.com/google/uuid"
)

type Lot struct {
	ID            uuid.UUID
	Status        LotStatus
	ProjectID     *uuid.UUID
	Type          LotType
	Bedrooms      *int
	Bathrooms     *int
	AreaSqft      *float64
	Floor         *int
	PriceFromUs    float64
	PriceFromDeveloper *float64
	ROI            *float64
	BonusKeys      []string
	BadgeIDs      []uuid.UUID
	DLDPermitNo   string
	Data          LotData
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time
	// Вложенные объекты (загружаются опционально)
	Project       *Project   `json:"project,omitempty"`
	Developer     *Developer `json:"developer,omitempty"`
	Area          *Area      `json:"area,omitempty"`
	Badges        []Badge    `json:"badges,omitempty"`
}

type LotData struct {
	Media          *LotMedia           `json:"media,omitempty"`
	PaymentPlan    *PaymentPlan        `json:"paymentPlan,omitempty"`
	Bonuses        []Bonus             `json:"bonuses,omitempty"`
	FloorPosition  *FloorPosition      `json:"floorPosition,omitempty"`
	Tags           []string            `json:"tags,omitempty"`
	// Дополнительные поля из seed данных
	View           string              `json:"view,omitempty"`
	Furnishing     string              `json:"furnishing,omitempty"`
	Orientation    string              `json:"orientation,omitempty"`
	Features       []string            `json:"features,omitempty"`
}

type LotMedia struct {
	Photos          []MediaItem `json:"photos,omitempty"`
	Gallery         []MediaItem `json:"gallery,omitempty"`
	FloorPlanImages []MediaItem `json:"floorPlanImages,omitempty"`
	ViewPhotos      []MediaItem `json:"viewPhotos,omitempty"`
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

