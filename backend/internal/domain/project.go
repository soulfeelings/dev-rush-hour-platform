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
	Badges    []Badge
	DeletedAt *time.Time
}

type ProjectData struct {
	Description       interface{}            `json:"description,omitempty"`
	Specs             map[string]interface{} `json:"specs,omitempty"`
	FeaturesAmenities []interface{}          `json:"featuresAmenities,omitempty"`
	Media             *Media                 `json:"media,omitempty"`
	IsRecommended     bool                   `json:"isRecommended,omitempty"`
	IsFeatured        bool                   `json:"isFeatured,omitempty"`
	Tags              []string               `json:"tags,omitempty"`
	YoutubeURL        string                 `json:"youtubeUrl,omitempty"`
	Timeline          *ProjectTimeline       `json:"timeline,omitempty"`
}

type ProjectTimeline struct {
	ProjectAnnouncement  *time.Time `json:"projectAnnouncement,omitempty"`
	BookingStarted       *time.Time `json:"bookingStarted,omitempty"`
	ConstructionStarted  *time.Time `json:"constructionStarted,omitempty"`
	ConstructionProgress *time.Time `json:"constructionProgress,omitempty"`
	ExpectedCompletion   *time.Time `json:"expectedCompletion,omitempty"`
}

type Media struct {
	Cover   *MediaItem   `json:"cover,omitempty"`
	Gallery []MediaItem  `json:"gallery,omitempty"`
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
	AreaSlug      *string
	DeveloperSlug *string
	Bedrooms      *int
	PriceMin      *float64
	PriceMax      *float64
}

