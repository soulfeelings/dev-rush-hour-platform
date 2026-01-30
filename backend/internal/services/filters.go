package services

import (
	"log/slog"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
)

func stringPtr(s string) *string {
	return &s
}

type FilterOption struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type FiltersService struct {
	citiesService     *CitiesService
	areasService      *AreasService
	developersService *DevelopersService
	projectsService   *ProjectsService
	logger            *slog.Logger
}

func NewFiltersService(
	citiesService *CitiesService,
	areasService *AreasService,
	developersService *DevelopersService,
	projectsService *ProjectsService,
) *FiltersService {
	return &FiltersService{
		citiesService:     citiesService,
		areasService:      areasService,
		developersService: developersService,
		projectsService:   projectsService,
		logger:            slog.Default(),
	}
}

func (s *FiltersService) GetFilterOptions() (*generated.FilterOptions, error) {
	s.logger.Info("filters_service_get_options_started")

	// Load dynamic options
	cities, err := s.citiesService.List()
	if err != nil {
		s.logger.Error("filters_service_get_cities_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	areas, err := s.areasService.List(false)
	if err != nil {
		s.logger.Error("filters_service_get_areas_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	developers, err := s.developersService.List()
	if err != nil {
		s.logger.Error("filters_service_get_developers_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	projects, err := s.projectsService.List(domain.ProjectFilters{}, domain.ProjectSortNameAsc)
	if err != nil {
		s.logger.Error("filters_service_get_projects_failed",
			"error", err.Error(),
		)
		return nil, err
	}

	// Convert to FilterOption format
	cityOptions := make([]generated.FilterOption, len(cities))
	for i, city := range cities {
		cityOptions[i] = generated.FilterOption{
			Value: city.Slug,
			Label: city.Name,
		}
	}

	areaOptions := make([]generated.FilterOption, len(areas))
	for i, area := range areas {
		areaOptions[i] = generated.FilterOption{
			Value: area.Slug,
			Label: area.Name,
		}
	}

	developerOptions := make([]generated.FilterOption, len(developers))
	for i, dev := range developers {
		developerOptions[i] = generated.FilterOption{
			Value: dev.Slug,
			Label: dev.Name,
		}
	}

	projectOptions := make([]generated.FilterOption, len(projects))
	for i, project := range projects {
		projectOptions[i] = generated.FilterOption{
			Value: project.Slug,
			Label: project.Name,
		}
	}

	// Static options
	propertyTypeOptions := []generated.FilterOption{
		{Value: "all", Label: "All"},
		{Value: "apartment", Label: "Apartment"},
	}

	bedroomOptions := []generated.FilterOption{
		{Value: "all", Label: "All"},
		{Value: "studio", Label: "Studio"},
		{Value: "1", Label: "1 Bedroom"},
		{Value: "2", Label: "2 Bedrooms"},
		{Value: "3", Label: "3 Bedrooms"},
		{Value: "4+", Label: "4+ Bedrooms"},
	}

	bathroomOptions := []generated.FilterOption{
		{Value: "all", Label: "All"},
		{Value: "1", Label: "1 Bathroom"},
		{Value: "2", Label: "2 Bathrooms"},
		{Value: "3", Label: "3 Bathrooms"},
		{Value: "4+", Label: "4+ Bathrooms"},
		{Value: "5+", Label: "5+ Bathrooms"},
		{Value: "6+", Label: "6+ Bathrooms"},
		{Value: "7+", Label: "7+ Bathrooms"},
	}

	priceRangeOptions := []generated.FilterOption{
		{Value: "all", Label: "All"},
		{Value: "0-1m", Label: "Under 1M AED"},
		{Value: "1-2m", Label: "1-2M AED"},
		{Value: "2-5m", Label: "2-5M AED"},
		{Value: "5m+", Label: "5M+ AED"},
	}

	statusOptions := []generated.FilterOption{
		{Value: "all", Label: "All"},
		{Value: "ready", Label: "Ready"},
		{Value: "construction", Label: "Construction"},
		{Value: "planning", Label: "Planning"},
	}

	s.logger.Info("filters_service_get_options_completed",
		"cities_count", len(cityOptions),
		"areas_count", len(areaOptions),
		"developers_count", len(developerOptions),
		"projects_count", len(projectOptions),
	)

	return &generated.FilterOptions{
		Cities:        &cityOptions,
		Areas:         &areaOptions,
		Developers:    &developerOptions,
		Projects:      &projectOptions,
		PropertyTypes: &propertyTypeOptions,
		Bedrooms:      &bedroomOptions,
		Bathrooms:     &bathroomOptions,
		PriceRanges:   &priceRangeOptions,
		Statuses:      &statusOptions,
	}, nil
}
