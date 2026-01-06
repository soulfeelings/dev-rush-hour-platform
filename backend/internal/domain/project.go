package domain

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID
	Slug        string
	Name        string
	Status      ProjectStatus
	Sale        string
	DeveloperID *uuid.UUID
	AreaID      *uuid.UUID
	Lat         *float64
	Lng         *float64
	Data        ProjectData
	CreatedAt   time.Time
	UpdatedAt   time.Time
	// Embedded related data (populated by joins)
	Developer *Developer
	Area      *Area
}

type ProjectData struct {
	Description       interface{}            `json:"description,omitempty"`
	Specs             map[string]interface{} `json:"specs,omitempty"`
	FeaturesAmenities []interface{}          `json:"featuresAmenities,omitempty"`
	Media             *Media                 `json:"media,omitempty"`
	IsRecommended     bool                   `json:"isRecommended,omitempty"`
	IsFeatured        bool                   `json:"isFeatured,omitempty"`
	Tags              []string               `json:"tags,omitempty"`
}

type Media struct {
	Cover   *MediaItem   `json:"cover,omitempty"`
	Gallery []MediaItem  `json:"gallery,omitempty"`
}

type MediaItem struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

