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
	CreatedAt   time.Time
	UpdatedAt   time.Time
	// Structured data fields (formerly in JSONB `data` column)
	Description       interface{}
	Media             *Media
	FeaturesAmenities []string
	Tags              []string
	IsFeatured        bool
	YoutubeURL        string
	ROI               *float64
	PriceFromUs        *float64
	PriceFromDeveloper *float64
	PaymentPlan       string
	CompletionDate    string
	PriceFrom         *float64
	Currency          string
	PropertyTypes     []string
	Bedrooms          []string
	AreaSize          *float64
	AreaUnit          string
	PricesByType      []PriceByType
	Timeline          *ProjectTimeline
	// Embedded related data (populated by joins)
	Developer *Developer
	Area      *Area
	Badges    []Badge
	DeletedAt *time.Time
}

type PriceByType struct {
	Type  string  `json:"type"`
	Price float64 `json:"price"`
}

type ProjectTimeline struct {
	ProjectAnnouncement          *time.Time `json:"projectAnnouncement,omitempty"`
	BookingStarted               *time.Time `json:"bookingStarted,omitempty"`
	ConstructionStarted          *time.Time `json:"constructionStarted,omitempty"`
	ConstructionProgress         *time.Time `json:"constructionProgress,omitempty"`
	ConstructionProgressPercent  *int       `json:"constructionProgressPercent,omitempty"`
	ExpectedCompletion           *time.Time `json:"expectedCompletion,omitempty"`
}

type Media struct {
	Cover   *MediaItem  `json:"cover,omitempty"`
	Hover   *MediaItem  `json:"hover,omitempty"`
	Logo    *MediaItem  `json:"logo,omitempty"`
	Gallery []MediaItem `json:"gallery,omitempty"`
}

type MediaItem struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

type ProjectSort string

const (
	ProjectSortPriceAsc  ProjectSort = "price_asc"
	ProjectSortPriceDesc ProjectSort = "price_desc"
	ProjectSortNewest    ProjectSort = "newest"
	ProjectSortNameAsc   ProjectSort = "name_asc"
)

type ProjectFilters struct {
	CitySlug      *string  // Filter by city slug
	AreaSlug      *string  // Filter by area slug
	DeveloperSlug *string  // Filter by developer slug
	Bedrooms      []int    // Array for multi-select (e.g., [1, 2, 3])
	Bathrooms     []int    // Array for multi-select
	PriceMin      *float64
	PriceMax      *float64
	Status        *string  // Filter by project status (ready, construction, planning)
	Search        *string  // Search by project name
}

