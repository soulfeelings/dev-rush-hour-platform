package domain

import (
	"time"

	"github.com/google/uuid"
)

type Area struct {
	ID        uuid.UUID
	Slug      string
	Name      string
	City      string // TODO: migrate to CityID
	CityID    *uuid.UUID
	Lat       float64
	Lng       float64
	Status    AreaStatus
	Data      AreaData
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

type AreaData struct {
	Boundary *GeoJSONPolygon `json:"boundary,omitempty"`
	Center   *Point          `json:"center,omitempty"`
	Zoom     *int            `json:"zoom,omitempty"`
	BBox     *BoundingBox    `json:"bbox,omitempty"`
	SEO      map[string]interface{} `json:"seo,omitempty"`
}

type GeoJSONPolygon struct {
	Type        string          `json:"type"`
	Coordinates [][][]float64   `json:"coordinates"`
}

type Point struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type BoundingBox struct {
	SouthWest Point `json:"southWest"`
	NorthEast Point `json:"northEast"`
}

