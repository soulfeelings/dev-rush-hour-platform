package mappers

import (
	"encoding/json"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// Generated -> Domain (для request в handlers)

func GeneratedLeadToDomain(req *generated.LeadCreateRequest) (*domain.Lead, error) {
	lead := &domain.Lead{
		Status: domain.LeadStatusNew,
		Type:   domain.LeadType(req.Type),
		Name:   req.Name,
		Phone:  req.Phone,
	}

	if req.Data != nil {
		lead.Data = domain.LeadData{
			Preferred: req.Data.Preferred,
			Comment:   req.Data.Comment,
			PageURL:   req.Data.PageUrl,
		}
		if req.Data.Utm != nil {
			lead.Data.UTM = *req.Data.Utm
		}
	}

	if req.Source != nil {
		lead.Source = req.Source
	}
	if req.Email != nil {
		emailStr := string(*req.Email)
		lead.Email = &emailStr
	}

	if req.ProjectId != nil {
		projectID := uuid.UUID(*req.ProjectId)
		lead.ProjectID = &projectID
	}

	if req.LotId != nil {
		lotID := uuid.UUID(*req.LotId)
		lead.LotID = &lotID
	}

	return lead, nil
}

// Domain -> Generated (для response из handlers)

func DomainAreaToGenerated(area *domain.Area) *generated.Area {
	if area == nil {
		return nil
	}
	id := openapi_types.UUID(area.ID)
	status := generated.AreaStatus(area.Status)
	result := &generated.Area{
		Id:        &id,
		Slug:      &area.Slug,
		Name:      &area.Name,
		City:      &area.City,
		Lat:       float32Ptr(float32(area.Lat)),
		Lng:       float32Ptr(float32(area.Lng)),
		Status:    &status,
		CreatedAt: timePtr(area.CreatedAt),
		UpdatedAt: timePtr(area.UpdatedAt),
	}

	if area.Data.Boundary != nil || area.Data.Center != nil || area.Data.Zoom != nil || area.Data.BBox != nil || area.Data.SEO != nil {
		result.Data = &generated.AreaData{
			Boundary: domainGeoJSONToGenerated(area.Data.Boundary),
			Center:   domainPointToGenerated(area.Data.Center),
			Zoom:     area.Data.Zoom,
			Bbox:     domainBBoxToGenerated(area.Data.BBox),
		}
		if len(area.Data.SEO) > 0 {
			result.Data.Seo = &area.Data.SEO
		}
	}

	return result
}

func DomainProjectToGenerated(project *domain.Project) *generated.Project {
	if project == nil {
		return nil
	}
	id := openapi_types.UUID(project.ID)
	status := generated.ProjectStatus(project.Status)
	result := &generated.Project{
		Id:     &id,
		Slug:   &project.Slug,
		Name:   &project.Name,
		Status: &status,
		Sale: func() *generated.ProjectSale {
			if project.Sale == "" {
				return nil
			}
			sale := generated.ProjectSale(project.Sale)
			return &sale
		}(),
		CreatedAt: timePtr(project.CreatedAt),
		UpdatedAt: timePtr(project.UpdatedAt),
	}

	if project.DeveloperID != nil {
		devID := openapi_types.UUID(*project.DeveloperID)
		result.DeveloperId = &devID
	}
	if project.AreaID != nil {
		areaID := openapi_types.UUID(*project.AreaID)
		result.AreaId = &areaID
	}
	if project.Lat != nil {
		result.Lat = float32Ptr(float32(*project.Lat))
	}
	if project.Lng != nil {
		result.Lng = float32Ptr(float32(*project.Lng))
	}

	// Include embedded developer info
	if project.Developer != nil {
		result.Developer = &generated.Developer{
			Id:     &project.Developer.ID,
			Slug:   &project.Developer.Slug,
			Name:   &project.Developer.Name,
			Status: (*generated.DeveloperStatus)(&project.Developer.Status),
		}
		if project.Developer.LogoURL != "" {
			result.Developer.LogoUrl = &project.Developer.LogoURL
		}
	}

	// Include embedded area info
	if project.Area != nil {
		result.Area = &generated.Area{
			Id:     &project.Area.ID,
			Slug:   &project.Area.Slug,
			Name:   &project.Area.Name,
			City:   &project.Area.City,
			Status: (*generated.AreaStatus)(&project.Area.Status),
		}
	}

	// Flat project fields
	result.Media = domainMediaToGenerated(project.Media)
	result.IsFeatured = &project.IsFeatured
	if len(project.FeaturesAmenities) > 0 {
		result.FeaturesAmenities = &project.FeaturesAmenities
	}
	if len(project.Tags) > 0 {
		result.Tags = &project.Tags
	}
	if project.Description != nil {
		descBytes, _ := json.Marshal(project.Description)
		result.Description = &generated.Project_Description{}
		result.Description.UnmarshalJSON(descBytes)
	}
	if project.YoutubeURL != "" {
		result.YoutubeUrl = &project.YoutubeURL
	}
	if project.Timeline != nil {
		result.Timeline = domainTimelineToGenerated(project.Timeline)
	}
	if project.ROI != nil {
		result.Roi = float32Ptr(float32(*project.ROI))
	}
	if project.PriceFromUs != nil {
		result.PriceFromUs = float32Ptr(float32(*project.PriceFromUs))
	}
	if project.PriceFromDeveloper != nil {
		result.PriceFromDeveloper = float32Ptr(float32(*project.PriceFromDeveloper))
	}
	if project.PaymentPlan != "" {
		result.PaymentPlan = &project.PaymentPlan
	}
	if project.CompletionDate != "" {
		result.CompletionDate = &project.CompletionDate
	}
	if project.Currency != "" {
		result.Currency = &project.Currency
	}
	if len(project.PropertyTypes) > 0 {
		result.PropertyTypes = &project.PropertyTypes
	}
	if len(project.Bedrooms) > 0 {
		result.Bedrooms = &project.Bedrooms
	}
	if project.AreaSize != nil {
		result.AreaSize = float32Ptr(float32(*project.AreaSize))
	}
	if project.AreaUnit != "" {
		result.AreaUnit = &project.AreaUnit
	}
	if len(project.PricesByType) > 0 {
		pbt := make([]struct {
			Price *float32 `json:"price,omitempty"`
			Type  *string  `json:"type,omitempty"`
		}, len(project.PricesByType))
		for i, p := range project.PricesByType {
			pbt[i].Price = float32Ptr(float32(p.Price))
			pbt[i].Type = stringPtr(p.Type)
		}
		result.PricesByType = &pbt
	}

	// Include badges
	if len(project.Badges) > 0 {
		badges := make([]generated.Badge, len(project.Badges))
		for i := range project.Badges {
			badges[i] = *DomainBadgeToGenerated(&project.Badges[i])
		}
		result.Badges = &badges
	}

	return result
}

func DomainLotToGenerated(lot *domain.Lot) *generated.Lot {
	if lot == nil {
		return nil
	}
	id := openapi_types.UUID(lot.ID)
	status := generated.LotStatus(lot.Status)
	lotType := generated.LotType(lot.Type)
	result := &generated.Lot{
		Id:            &id,
		Status:        &status,
		Type:          &lotType,
		PriceFromUs:   float32Ptr(float32(lot.PriceFromUs)),
		CreatedAt:     timePtr(lot.CreatedAt),
		UpdatedAt:     timePtr(lot.UpdatedAt),
	}

	if lot.PriceFromDeveloper != nil {
		result.PriceFromDeveloper = float32Ptr(float32(*lot.PriceFromDeveloper))
	}
	if lot.ROI != nil {
		result.Roi = float32Ptr(float32(*lot.ROI))
	}
	if len(lot.BonusKeys) > 0 {
		result.BonusKeys = &lot.BonusKeys
	}
	if len(lot.BadgeIDs) > 0 {
		ids := make([]openapi_types.UUID, len(lot.BadgeIDs))
		for i, id := range lot.BadgeIDs {
			ids[i] = openapi_types.UUID(id)
		}
		result.BadgeIds = &ids
	}
	if len(lot.Badges) > 0 {
		badges := make([]generated.Badge, len(lot.Badges))
		for i := range lot.Badges {
			badges[i] = *DomainBadgeToGenerated(&lot.Badges[i])
		}
		result.Badges = &badges
	}
	if lot.ProjectID != nil {
		projectID := openapi_types.UUID(*lot.ProjectID)
		result.ProjectId = &projectID
	}
	if lot.Bedrooms != nil {
		result.Bedrooms = lot.Bedrooms
	}
	if lot.Bathrooms != nil {
		result.Bathrooms = lot.Bathrooms
	}
	if lot.AreaSqm != nil {
		result.AreaSqm = float32Ptr(float32(*lot.AreaSqm))
	}
	if lot.Floor != nil {
		result.Floor = lot.Floor
	}

	if lot.Data.Media != nil || lot.Data.PaymentPlan != nil || lot.Data.Bonuses != nil || lot.Data.FloorPosition != nil || lot.Data.Tags != nil || lot.Data.View != "" || lot.Data.Orientation != "" {
		result.Data = &generated.LotData{
			Media:         domainLotMediaToGenerated(lot.Data.Media),
			PaymentPlan:   domainPaymentPlanToGenerated(lot.Data.PaymentPlan),
			Bonuses:       domainBonusesToGenerated(lot.Data.Bonuses),
			FloorPosition: domainFloorPositionToGenerated(lot.Data.FloorPosition),
			Tags:          domainTagsToGenerated(lot.Data.Tags),
		}
		if lot.Data.View != "" {
			result.Data.View = &lot.Data.View
		}
		if lot.Data.Orientation != "" {
			result.Data.Orientation = &lot.Data.Orientation
		}
	}

	return result
}

func DomainLotToGeneratedLotListItem(lot *domain.Lot) *generated.LotListItem {
	if lot == nil {
		return nil
	}
	id := openapi_types.UUID(lot.ID)
	status := generated.LotListItemStatus(lot.Status)
	lotType := generated.LotType(lot.Type)
	result := &generated.LotListItem{
		Id:            &id,
		Status:        &status,
		Type:          &lotType,
		PriceFromUs:   float32Ptr(float32(lot.PriceFromUs)),
		CreatedAt:     timePtr(lot.CreatedAt),
		UpdatedAt:     timePtr(lot.UpdatedAt),
	}

	if lot.PriceFromDeveloper != nil {
		result.PriceFromDeveloper = float32Ptr(float32(*lot.PriceFromDeveloper))
	}
	if lot.ROI != nil {
		result.Roi = float32Ptr(float32(*lot.ROI))
	}
	if len(lot.BonusKeys) > 0 {
		result.BonusKeys = &lot.BonusKeys
	}
	if len(lot.BadgeIDs) > 0 {
		ids := make([]openapi_types.UUID, len(lot.BadgeIDs))
		for i, id := range lot.BadgeIDs {
			ids[i] = openapi_types.UUID(id)
		}
		result.BadgeIds = &ids
	}
	if len(lot.Badges) > 0 {
		badges := make([]generated.Badge, len(lot.Badges))
		for i := range lot.Badges {
			badges[i] = *DomainBadgeToGenerated(&lot.Badges[i])
		}
		result.Badges = &badges
	}
	if lot.ProjectID != nil {
		projectID := openapi_types.UUID(*lot.ProjectID)
		result.ProjectId = &projectID
	}
	if lot.Bedrooms != nil {
		result.Bedrooms = lot.Bedrooms
	}
	if lot.Bathrooms != nil {
		result.Bathrooms = lot.Bathrooms
	}
	if lot.AreaSqm != nil {
		result.AreaSqm = float32Ptr(float32(*lot.AreaSqm))
	}
	if lot.Floor != nil {
		result.Floor = lot.Floor
	}

	if lot.Data.Media != nil || lot.Data.PaymentPlan != nil || lot.Data.Bonuses != nil || lot.Data.FloorPosition != nil || lot.Data.Tags != nil || lot.Data.View != "" || lot.Data.Orientation != "" {
		result.Data = &generated.LotData{
			Media:         domainLotMediaToGenerated(lot.Data.Media),
			PaymentPlan:   domainPaymentPlanToGenerated(lot.Data.PaymentPlan),
			Bonuses:       domainBonusesToGenerated(lot.Data.Bonuses),
			FloorPosition: domainFloorPositionToGenerated(lot.Data.FloorPosition),
			Tags:          domainTagsToGenerated(lot.Data.Tags),
		}
		if lot.Data.View != "" {
			result.Data.View = &lot.Data.View
		}
		if lot.Data.Orientation != "" {
			result.Data.Orientation = &lot.Data.Orientation
		}
	}

	// Add nested objects
	if lot.Project != nil {
		result.Project = DomainProjectToGenerated(lot.Project)
	}

	return result
}

func DomainLeadToGenerated(lead *domain.Lead) *generated.Lead {
	if lead == nil {
		return nil
	}
	id := openapi_types.UUID(lead.ID)
	status := generated.LeadStatus(lead.Status)
	leadType := generated.LeadType(lead.Type)
	result := &generated.Lead{
		Id:        &id,
		Status:    &status,
		Type:      &leadType,
		Name:      &lead.Name,
		Phone:     &lead.Phone,
		CreatedAt: timePtr(lead.CreatedAt),
		UpdatedAt: timePtr(lead.UpdatedAt),
	}

	if lead.Source != nil {
		result.Source = lead.Source
	}
	if lead.Email != nil {
		result.Email = lead.Email
	}
	if lead.ProjectID != nil {
		projectID := openapi_types.UUID(*lead.ProjectID)
		result.ProjectId = &projectID
	}
	if lead.LotID != nil {
		lotID := openapi_types.UUID(*lead.LotID)
		result.LotId = &lotID
	}

	if lead.Data.Preferred != nil || lead.Data.Comment != nil || lead.Data.PageURL != nil || lead.Data.UTM != nil {
		result.Data = &generated.LeadData{
			Preferred: lead.Data.Preferred,
			Comment:   lead.Data.Comment,
			PageUrl:   lead.Data.PageURL,
		}
		if lead.Data.UTM != nil {
			result.Data.Utm = &lead.Data.UTM
		}
	}

	return result
}

// Helper functions

func domainGeoJSONToGenerated(gj *domain.GeoJSONPolygon) *generated.GeoJSONPolygon {
	if gj == nil {
		return nil
	}
	coords := make([][][]float32, len(gj.Coordinates))
	for i, ring := range gj.Coordinates {
		coords[i] = make([][]float32, len(ring))
		for j, point := range ring {
			coords[i][j] = []float32{float32(point[0]), float32(point[1])}
		}
	}
	geoType := generated.GeoJSONPolygonType(gj.Type)
	return &generated.GeoJSONPolygon{
		Type:        &geoType,
		Coordinates: &coords,
	}
}

func domainPointToGenerated(p *domain.Point) *generated.Point {
	if p == nil {
		return nil
	}
	return &generated.Point{
		Lat: float32Ptr(float32(p.Lat)),
		Lng: float32Ptr(float32(p.Lng)),
	}
}

func domainBBoxToGenerated(bbox *domain.BoundingBox) *generated.BoundingBox {
	if bbox == nil {
		return nil
	}
	return &generated.BoundingBox{
		SouthWest: domainPointToGenerated(&bbox.SouthWest),
		NorthEast: domainPointToGenerated(&bbox.NorthEast),
	}
}


func domainMediaToGenerated(media *domain.Media) *generated.Media {
	if media == nil {
		return nil
	}
	result := &generated.Media{}
	if media.Cover != nil {
		result.Cover = domainMediaItemToGenerated(media.Cover)
	}
	if media.Hover != nil {
		result.Hover = domainMediaItemToGenerated(media.Hover)
	}
	if media.Logo != nil {
		result.Logo = domainMediaItemToGenerated(media.Logo)
	}
	if len(media.Gallery) > 0 {
		gallery := make([]generated.MediaItem, len(media.Gallery))
		for i := range media.Gallery {
			gallery[i] = *domainMediaItemToGenerated(&media.Gallery[i])
		}
		result.Gallery = &gallery
	}
	return result
}

func domainMediaItemToGenerated(item *domain.MediaItem) *generated.MediaItem {
	if item == nil {
		return nil
	}
	return &generated.MediaItem{
		Id:  &item.ID,
		Url: &item.URL,
	}
}

func domainLotMediaToGenerated(media *domain.LotMedia) *generated.LotMedia {
	if media == nil {
		return nil
	}
	result := &generated.LotMedia{}
	if len(media.Photos) > 0 {
		photos := make([]generated.MediaItem, len(media.Photos))
		for i := range media.Photos {
			photos[i] = *domainMediaItemToGenerated(&media.Photos[i])
		}
		result.Photos = &photos
	}
	if len(media.Gallery) > 0 {
		gallery := make([]generated.MediaItem, len(media.Gallery))
		for i := range media.Gallery {
			gallery[i] = *domainMediaItemToGenerated(&media.Gallery[i])
		}
		result.Photos = &gallery // Map gallery to photos for backward compatibility with generated API
	}
	if len(media.FloorPlanImages) > 0 {
		images := make([]generated.MediaItem, len(media.FloorPlanImages))
		for i := range media.FloorPlanImages {
			images[i] = *domainMediaItemToGenerated(&media.FloorPlanImages[i])
		}
		result.FloorPlanImages = &images
	}
	if len(media.ViewPhotos) > 0 {
		viewPhotos := make([]generated.MediaItem, len(media.ViewPhotos))
		for i := range media.ViewPhotos {
			viewPhotos[i] = *domainMediaItemToGenerated(&media.ViewPhotos[i])
		}
		result.ViewPhotos = &viewPhotos
	}
	if media.Cover != nil {
		result.Cover = domainMediaItemToGenerated(media.Cover)
	}
	return result
}

func domainPaymentPlanToGenerated(plan *domain.PaymentPlan) *generated.PaymentPlan {
	if plan == nil || len(plan.Schedule) == 0 {
		return nil
	}
	schedule := make([]generated.PaymentScheduleItem, len(plan.Schedule))
	for i := range plan.Schedule {
		schedule[i] = generated.PaymentScheduleItem{
			Stage:   &plan.Schedule[i].Stage,
			Percent: float32Ptr(float32(plan.Schedule[i].Percent)),
			Amount:  float32Ptr(float32(plan.Schedule[i].Amount)),
			DueDate: &plan.Schedule[i].DueDate,
		}
	}
	return &generated.PaymentPlan{
		Schedule: &schedule,
	}
}

func domainBonusesToGenerated(bonuses []domain.Bonus) *[]generated.Bonus {
	if len(bonuses) == 0 {
		return nil
	}
	result := make([]generated.Bonus, len(bonuses))
	for i := range bonuses {
		result[i] = generated.Bonus{
			Title:       &bonuses[i].Title,
			Style:       &bonuses[i].Style,
			Description: &bonuses[i].Description,
		}
	}
	return &result
}

func domainFloorPositionToGenerated(fp *domain.FloorPosition) *generated.FloorPosition {
	if fp == nil {
		return nil
	}
	return &generated.FloorPosition{
		Label: &fp.Label,
		X:     float32Ptr(float32(fp.X)),
		Y:     float32Ptr(float32(fp.Y)),
	}
}

func domainTagsToGenerated(tags []string) *[]string {
	if len(tags) == 0 {
		return nil
	}
	return &tags
}

func float32Ptr(f float32) *float32 {
	return &f
}

func timePtr(t time.Time) *time.Time {
	return &t
}

func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

// Admin mappers: Generated -> Domain

func GeneratedDeveloperCreateToDomain(req *generated.DeveloperCreateRequest) (*domain.Developer, error) {
	dev := &domain.Developer{
		Slug:   req.Slug,
		Name:   req.Name,
		Status: domain.DeveloperStatusActive,
	}

	if req.Status != nil {
		dev.Status = domain.DeveloperStatus(*req.Status)
	}
	if req.LogoUrl != nil {
		dev.LogoURL = *req.LogoUrl
	}

	return dev, nil
}

func GeneratedDeveloperUpdateToDomain(req *generated.DeveloperUpdateRequest) (*domain.Developer, error) {
	dev := &domain.Developer{}

	if req.Slug != nil {
		dev.Slug = *req.Slug
	}
	if req.Name != nil {
		dev.Name = *req.Name
	}
	if req.Status != nil {
		dev.Status = domain.DeveloperStatus(*req.Status)
	}
	if req.LogoUrl != nil {
		dev.LogoURL = *req.LogoUrl
	}

	return dev, nil
}

func DomainDeveloperToGenerated(dev *domain.Developer) *generated.Developer {
	if dev == nil {
		return nil
	}
	id := openapi_types.UUID(dev.ID)
	status := generated.DeveloperStatus(dev.Status)
	result := &generated.Developer{
		Id:        &id,
		Slug:      &dev.Slug,
		Name:      &dev.Name,
		Status:    &status,
		CreatedAt: timePtr(dev.CreatedAt),
		UpdatedAt: timePtr(dev.UpdatedAt),
	}
	if dev.LogoURL != "" {
		result.LogoUrl = &dev.LogoURL
	}
	return result
}

func DomainCityToGenerated(city *domain.City) *generated.City {
	if city == nil {
		return nil
	}
	id := openapi_types.UUID(city.ID)
	result := &generated.City{
		Id:        &id,
		Slug:      &city.Slug,
		Name:      &city.Name,
		CreatedAt: timePtr(city.CreatedAt),
		UpdatedAt: timePtr(city.UpdatedAt),
	}
	return result
}

func GeneratedCityCreateToDomain(req *generated.CityCreateRequest) (*domain.City, error) {
	city := &domain.City{
		Slug: req.Slug,
		Name: req.Name,
	}

	return city, nil
}

func ApplyCityUpdateRequest(existing *domain.City, req *generated.CityUpdateRequest) *domain.City {
	if existing == nil || req == nil {
		return nil
	}
	updated := *existing

	if req.Slug != nil {
		updated.Slug = *req.Slug
	}
	if req.Name != nil {
		updated.Name = *req.Name
	}

	return &updated
}

func GeneratedAreaCreateToDomain(req *generated.AreaCreateRequest) (*domain.Area, error) {
	area := &domain.Area{
		Slug:   req.Slug,
		Name:   req.Name,
		City:   req.City,
		Lat:    float64(req.Lat),
		Lng:    float64(req.Lng),
		Status: domain.AreaStatusActive,
	}

	if req.Status != nil {
		area.Status = domain.AreaStatus(*req.Status)
	}
	if req.Data != nil {
		area.Data = AreaDataFromGenerated(req.Data)
	}

	return area, nil
}

func ApplyAreaUpdateRequest(existing *domain.Area, req *generated.AreaUpdateRequest) *domain.Area {
	if existing == nil || req == nil {
		return nil
	}
	updated := *existing

	if req.Slug != nil {
		updated.Slug = *req.Slug
	}
	if req.Name != nil {
		updated.Name = *req.Name
	}
	if req.City != nil {
		updated.City = *req.City
	}
	if req.Lat != nil {
		updated.Lat = float64(*req.Lat)
	}
	if req.Lng != nil {
		updated.Lng = float64(*req.Lng)
	}
	if req.Status != nil {
		updated.Status = domain.AreaStatus(*req.Status)
	}
	if req.Data != nil {
		updated.Data = AreaDataFromGenerated(req.Data)
	}

	return &updated
}

func AreaDataFromGenerated(data *generated.AreaData) domain.AreaData {
	result := domain.AreaData{}
	if data.Boundary != nil {
		result.Boundary = generatedGeoJSONToDomain(data.Boundary)
	}
	if data.Center != nil {
		result.Center = generatedPointToDomain(data.Center)
	}
	if data.Zoom != nil {
		result.Zoom = data.Zoom
	}
	if data.Bbox != nil {
		result.BBox = generatedBBoxToDomain(data.Bbox)
	}
	if data.Seo != nil {
		result.SEO = *data.Seo
	}
	return result
}

func generatedGeoJSONToDomain(gj *generated.GeoJSONPolygon) *domain.GeoJSONPolygon {
	if gj == nil {
		return nil
	}
	coords := make([][][]float64, len(*gj.Coordinates))
	for i, ring := range *gj.Coordinates {
		coords[i] = make([][]float64, len(ring))
		for j, point := range ring {
			coords[i][j] = make([]float64, len(point))
			for k, val := range point {
				coords[i][j][k] = float64(val)
			}
		}
	}
	return &domain.GeoJSONPolygon{
		Type:        string(*gj.Type),
		Coordinates: coords,
	}
}

func generatedPointToDomain(p *generated.Point) *domain.Point {
	if p == nil {
		return nil
	}
	return &domain.Point{
		Lat: float64(*p.Lat),
		Lng: float64(*p.Lng),
	}
}

func generatedBBoxToDomain(bbox *generated.BoundingBox) *domain.BoundingBox {
	if bbox == nil {
		return nil
	}
	return &domain.BoundingBox{
		SouthWest: *generatedPointToDomain(bbox.SouthWest),
		NorthEast: *generatedPointToDomain(bbox.NorthEast),
	}
}

func GeneratedProjectCreateToDomain(req *generated.ProjectCreateRequest) (*domain.Project, error) {
	project := &domain.Project{
		Slug:   req.Slug,
		Name:   req.Name,
		Status: domain.ProjectStatusActive,
	}

	if req.Status != nil {
		project.Status = domain.ProjectStatus(*req.Status)
	}
	if req.Sale != nil {
		project.Sale = string(*req.Sale)
	}
	if req.DeveloperId != nil {
		id := uuid.UUID(*req.DeveloperId)
		project.DeveloperID = &id
	}
	if req.AreaId != nil {
		id := uuid.UUID(*req.AreaId)
		project.AreaID = &id
	}
	if req.Lat != nil {
		lat := float64(*req.Lat)
		project.Lat = &lat
	}
	if req.Lng != nil {
		lng := float64(*req.Lng)
		project.Lng = &lng
	}
	if req.Description != nil {
		project.Description = req.Description
	}
	if req.FeaturesAmenities != nil {
		project.FeaturesAmenities = *req.FeaturesAmenities
	}
	if req.Media != nil {
		project.Media = generatedMediaToDomain(req.Media)
	}
	if req.YoutubeUrl != nil {
		project.YoutubeURL = *req.YoutubeUrl
	}
	if req.Timeline != nil {
		project.Timeline = generatedTimelineToDomain(req.Timeline)
	}
	if req.Roi != nil {
		roi := float64(*req.Roi)
		project.ROI = &roi
	}
	if req.PriceFromUs != nil {
		ourPrice := float64(*req.PriceFromUs)
		project.PriceFromUs = &ourPrice
	}
	if req.PriceFromDeveloper != nil {
		developerPrice := float64(*req.PriceFromDeveloper)
		project.PriceFromDeveloper = &developerPrice
	}
	if req.PaymentPlan != nil {
		project.PaymentPlan = *req.PaymentPlan
	}
	if req.CompletionDate != nil {
		project.CompletionDate = *req.CompletionDate
	}
	if req.IsFeatured != nil {
		project.IsFeatured = *req.IsFeatured
	}
	if req.Tags != nil {
		project.Tags = *req.Tags
	}
	if req.Currency != nil {
		project.Currency = *req.Currency
	}
	if req.PropertyTypes != nil {
		project.PropertyTypes = *req.PropertyTypes
	}
	if req.Bedrooms != nil {
		project.Bedrooms = *req.Bedrooms
	}
	if req.AreaSize != nil {
		as := float64(*req.AreaSize)
		project.AreaSize = &as
	}
	if req.AreaUnit != nil {
		project.AreaUnit = *req.AreaUnit
	}
	if req.PricesByType != nil {
		pbt := make([]domain.PriceByType, len(*req.PricesByType))
		for i, item := range *req.PricesByType {
			if item.Type != nil {
				pbt[i].Type = *item.Type
			}
			if item.Price != nil {
				pbt[i].Price = float64(*item.Price)
			}
		}
		project.PricesByType = pbt
	}
	if req.BadgeIds != nil {
		project.BadgeIDs = make([]uuid.UUID, len(*req.BadgeIds))
		for i, id := range *req.BadgeIds {
			project.BadgeIDs[i] = uuid.UUID(id)
		}
	}
	if req.InfrastructureIds != nil {
		project.InfrastructureIDs = make([]uuid.UUID, len(*req.InfrastructureIds))
		for i, id := range *req.InfrastructureIds {
			project.InfrastructureIDs[i] = uuid.UUID(id)
		}
	}

	return project, nil
}

func GeneratedProjectUpdateToDomain(req *generated.ProjectUpdateRequest) (*domain.Project, error) {
	project := &domain.Project{}

	if req.Slug != nil {
		project.Slug = *req.Slug
	}
	if req.Name != nil && *req.Name != "" {
		project.Name = *req.Name
	}
	if req.Status != nil {
		project.Status = domain.ProjectStatus(*req.Status)
	}
	if req.Sale != nil {
		project.Sale = string(*req.Sale)
	}
	if req.DeveloperId != nil {
		id := uuid.UUID(*req.DeveloperId)
		project.DeveloperID = &id
	}
	if req.AreaId != nil {
		id := uuid.UUID(*req.AreaId)
		project.AreaID = &id
	}
	if req.Lat != nil {
		lat := float64(*req.Lat)
		project.Lat = &lat
	}
	if req.Lng != nil {
		lng := float64(*req.Lng)
		project.Lng = &lng
	}
	if req.Description != nil {
		project.Description = req.Description
	}
	if req.FeaturesAmenities != nil {
		project.FeaturesAmenities = *req.FeaturesAmenities
	}
	if req.Media != nil {
		project.Media = generatedMediaToDomain(req.Media)
	}
	if req.YoutubeUrl != nil {
		project.YoutubeURL = *req.YoutubeUrl
	}
	if req.Timeline != nil {
		project.Timeline = generatedTimelineToDomain(req.Timeline)
	}
	if req.Roi != nil {
		roi := float64(*req.Roi)
		project.ROI = &roi
	}
	if req.PriceFromUs != nil {
		ourPrice := float64(*req.PriceFromUs)
		project.PriceFromUs = &ourPrice
	}
	if req.PriceFromDeveloper != nil {
		developerPrice := float64(*req.PriceFromDeveloper)
		project.PriceFromDeveloper = &developerPrice
	}
	if req.PaymentPlan != nil {
		project.PaymentPlan = *req.PaymentPlan
	}
	if req.CompletionDate != nil {
		project.CompletionDate = *req.CompletionDate
	}
	if req.IsFeatured != nil {
		project.IsFeatured = *req.IsFeatured
	}
	if req.Tags != nil {
		project.Tags = *req.Tags
	}
	if req.Currency != nil {
		project.Currency = *req.Currency
	}
	if req.PropertyTypes != nil {
		project.PropertyTypes = *req.PropertyTypes
	}
	if req.Bedrooms != nil {
		project.Bedrooms = *req.Bedrooms
	}
	if req.AreaSize != nil {
		as := float64(*req.AreaSize)
		project.AreaSize = &as
	}
	if req.AreaUnit != nil {
		project.AreaUnit = *req.AreaUnit
	}
	if req.PricesByType != nil {
		pbt := make([]domain.PriceByType, len(*req.PricesByType))
		for i, item := range *req.PricesByType {
			if item.Type != nil {
				pbt[i].Type = *item.Type
			}
			if item.Price != nil {
				pbt[i].Price = float64(*item.Price)
			}
		}
		project.PricesByType = pbt
	}
	if req.BadgeIds != nil {
		project.BadgeIDs = make([]uuid.UUID, len(*req.BadgeIds))
		for i, id := range *req.BadgeIds {
			project.BadgeIDs[i] = uuid.UUID(id)
		}
	}
	if req.InfrastructureIds != nil {
		project.InfrastructureIDs = make([]uuid.UUID, len(*req.InfrastructureIds))
		for i, id := range *req.InfrastructureIds {
			project.InfrastructureIDs[i] = uuid.UUID(id)
		}
	}

	return project, nil
}

func generatedTimelineToDomain(timeline *generated.ProjectTimeline) *domain.ProjectTimeline {
	if timeline == nil {
		return nil
	}
	result := &domain.ProjectTimeline{}
	if timeline.ProjectAnnouncement != nil {
		t := timeline.ProjectAnnouncement.Time
		result.ProjectAnnouncement = &t
	}
	if timeline.BookingStarted != nil {
		t := timeline.BookingStarted.Time
		result.BookingStarted = &t
	}
	if timeline.ConstructionStarted != nil {
		t := timeline.ConstructionStarted.Time
		result.ConstructionStarted = &t
	}
	if timeline.ConstructionProgress != nil {
		t := timeline.ConstructionProgress.Time
		result.ConstructionProgress = &t
	}
	if timeline.ConstructionProgressPercent != nil {
		result.ConstructionProgressPercent = timeline.ConstructionProgressPercent
	}
	if timeline.ExpectedCompletion != nil {
		t := timeline.ExpectedCompletion.Time
		result.ExpectedCompletion = &t
	}
	return result
}

func domainTimelineToGenerated(timeline *domain.ProjectTimeline) *generated.ProjectTimeline {
	if timeline == nil {
		return nil
	}
	result := &generated.ProjectTimeline{}
	if timeline.ProjectAnnouncement != nil {
		d := openapi_types.Date{Time: *timeline.ProjectAnnouncement}
		result.ProjectAnnouncement = &d
	}
	if timeline.BookingStarted != nil {
		d := openapi_types.Date{Time: *timeline.BookingStarted}
		result.BookingStarted = &d
	}
	if timeline.ConstructionStarted != nil {
		d := openapi_types.Date{Time: *timeline.ConstructionStarted}
		result.ConstructionStarted = &d
	}
	if timeline.ConstructionProgress != nil {
		d := openapi_types.Date{Time: *timeline.ConstructionProgress}
		result.ConstructionProgress = &d
	}
	if timeline.ConstructionProgressPercent != nil {
		result.ConstructionProgressPercent = timeline.ConstructionProgressPercent
	}
	if timeline.ExpectedCompletion != nil {
		d := openapi_types.Date{Time: *timeline.ExpectedCompletion}
		result.ExpectedCompletion = &d
	}
	return result
}

func generatedMediaToDomain(media *generated.Media) *domain.Media {
	if media == nil {
		return nil
	}
	result := &domain.Media{}
	if media.Cover != nil {
		result.Cover = generatedMediaItemToDomain(media.Cover)
	}
	if media.Hover != nil {
		result.Hover = generatedMediaItemToDomain(media.Hover)
	}
	if media.Logo != nil {
		result.Logo = generatedMediaItemToDomain(media.Logo)
	}
	if media.Gallery != nil {
		result.Gallery = make([]domain.MediaItem, len(*media.Gallery))
		for i, item := range *media.Gallery {
			result.Gallery[i] = *generatedMediaItemToDomain(&item)
		}
	}
	return result
}

func generatedMediaItemToDomain(item *generated.MediaItem) *domain.MediaItem {
	if item == nil {
		return nil
	}
	result := &domain.MediaItem{}
	if item.Id != nil {
		result.ID = *item.Id
	}
	if item.Url != nil {
		result.URL = *item.Url
	}
	return result
}

func GeneratedLotCreateToDomain(req *generated.LotCreateRequest) (*domain.Lot, error) {
	projectID := uuid.UUID(req.ProjectId)
	lot := &domain.Lot{
		ProjectID:     &projectID,
		Type:          domain.LotType(req.Type),
		Status:        domain.LotStatusActive,
		PriceFromUs:   float64(req.PriceFromUs),
		BonusKeys:     []string{},
	}
	if req.PriceFromDeveloper != nil {
		dp := float64(*req.PriceFromDeveloper)
		lot.PriceFromDeveloper = &dp
	}
	if req.Roi != nil {
		roi := float64(*req.Roi)
		lot.ROI = &roi
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
	}

	if req.Status != nil {
		lot.Status = domain.LotStatus(*req.Status)
	}
	if req.Bedrooms != nil {
		bedrooms := int(*req.Bedrooms)
		lot.Bedrooms = &bedrooms
	}
	if req.Bathrooms != nil {
		bathrooms := int(*req.Bathrooms)
		lot.Bathrooms = &bathrooms
	}
	if req.AreaSqm != nil {
		areaSqm := float64(*req.AreaSqm)
		lot.AreaSqm = &areaSqm
	}
	if req.Floor != nil {
		floor := int(*req.Floor)
		lot.Floor = &floor
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
	}
	if req.BadgeIds != nil {
		lot.BadgeIDs = make([]uuid.UUID, len(*req.BadgeIds))
		for i, id := range *req.BadgeIds {
			lot.BadgeIDs[i] = uuid.UUID(id)
		}
	}
	if req.Data != nil {
		lot.Data = domainLotDataFromGenerated(req.Data)
	}

	return lot, nil
}

func GeneratedLotUpdateToDomain(req *generated.LotUpdateRequest) (*domain.Lot, error) {
	lot := &domain.Lot{}

	if req.ProjectId != nil {
		id := uuid.UUID(*req.ProjectId)
		lot.ProjectID = &id
	}
	if req.Type != nil {
		lot.Type = domain.LotType(*req.Type)
	}
	if req.Status != nil {
		lot.Status = domain.LotStatus(*req.Status)
	}
	if req.Bedrooms != nil {
		bedrooms := int(*req.Bedrooms)
		lot.Bedrooms = &bedrooms
	}
	if req.Bathrooms != nil {
		bathrooms := int(*req.Bathrooms)
		lot.Bathrooms = &bathrooms
	}
	if req.AreaSqm != nil {
		areaSqm := float64(*req.AreaSqm)
		lot.AreaSqm = &areaSqm
	}
	if req.Floor != nil {
		floor := int(*req.Floor)
		lot.Floor = &floor
	}
	if req.PriceFromUs != nil {
		lot.PriceFromUs = float64(*req.PriceFromUs)
	}
	if req.PriceFromDeveloper != nil {
		dp := float64(*req.PriceFromDeveloper)
		lot.PriceFromDeveloper = &dp
	}
	if req.Roi != nil {
		roi := float64(*req.Roi)
		lot.ROI = &roi
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
	}
	if req.BadgeIds != nil {
		lot.BadgeIDs = make([]uuid.UUID, len(*req.BadgeIds))
		for i, id := range *req.BadgeIds {
			lot.BadgeIDs[i] = uuid.UUID(id)
		}
	}
	if req.Data != nil {
		lot.Data = domainLotDataFromGenerated(req.Data)
	}

	return lot, nil
}

func domainLotDataFromGenerated(data *generated.LotData) domain.LotData {
	result := domain.LotData{}
	if data.Media != nil {
		result.Media = generatedLotMediaToDomain(data.Media)
	}
	if data.PaymentPlan != nil {
		result.PaymentPlan = generatedPaymentPlanToDomain(data.PaymentPlan)
	}
	if data.Bonuses != nil {
		result.Bonuses = generatedBonusesToDomain(*data.Bonuses)
	}
	if data.FloorPosition != nil {
		result.FloorPosition = generatedFloorPositionToDomain(data.FloorPosition)
	}
	if data.Tags != nil {
		result.Tags = *data.Tags
	}
	if data.View != nil {
		result.View = *data.View
	}
	if data.Orientation != nil {
		result.Orientation = *data.Orientation
	}
	return result
}

func generatedLotMediaToDomain(media *generated.LotMedia) *domain.LotMedia {
	if media == nil {
		return nil
	}
	result := &domain.LotMedia{}
	if media.Photos != nil {
		result.Photos = make([]domain.MediaItem, len(*media.Photos))
		for i, item := range *media.Photos {
			if m := generatedMediaItemToDomain(&item); m != nil {
				result.Photos[i] = *m
			}
		}
	}
	if media.FloorPlanImages != nil {
		result.FloorPlanImages = make([]domain.MediaItem, len(*media.FloorPlanImages))
		for i, item := range *media.FloorPlanImages {
			if m := generatedMediaItemToDomain(&item); m != nil {
				result.FloorPlanImages[i] = *m
			}
		}
	}
	if media.ViewPhotos != nil {
		result.ViewPhotos = make([]domain.MediaItem, len(*media.ViewPhotos))
		for i, item := range *media.ViewPhotos {
			if m := generatedMediaItemToDomain(&item); m != nil {
				result.ViewPhotos[i] = *m
			}
		}
	}
	if media.Cover != nil {
		result.Cover = generatedMediaItemToDomain(media.Cover)
	}
	return result
}

func GeneratedLeadUpdateToDomain(req *generated.LeadUpdateRequest) (*domain.Lead, error) {
	lead := &domain.Lead{}

	if req.Status != nil {
		lead.Status = domain.LeadStatus(*req.Status)
	}
	if req.Type != nil {
		lead.Type = domain.LeadType(*req.Type)
	}
	if req.Source != nil {
		lead.Source = req.Source
	}
	if req.ProjectId != nil {
		id := uuid.UUID(*req.ProjectId)
		lead.ProjectID = &id
	}
	if req.LotId != nil {
		id := uuid.UUID(*req.LotId)
		lead.LotID = &id
	}
	if req.Name != nil && *req.Name != "" {
		lead.Name = *req.Name
	}
	if req.Phone != nil {
		lead.Phone = *req.Phone
	}
	if req.Email != nil {
		emailStr := string(*req.Email)
		lead.Email = &emailStr
	}
	if req.Data != nil {
		lead.Data = domain.LeadData{
			Preferred: req.Data.Preferred,
			Comment:   req.Data.Comment,
			PageURL:   req.Data.PageUrl,
		}
		if req.Data.Utm != nil {
			lead.Data.UTM = *req.Data.Utm
		}
	}

	return lead, nil
}

func generatedPaymentPlanToDomain(plan *generated.PaymentPlan) *domain.PaymentPlan {
	if plan == nil || plan.Schedule == nil {
		return nil
	}
	result := &domain.PaymentPlan{
		Schedule: make([]domain.PaymentScheduleItem, len(*plan.Schedule)),
	}
	for i, item := range *plan.Schedule {
		stage := ""
		if item.Stage != nil {
			stage = *item.Stage
		}
		dueDate := ""
		if item.DueDate != nil {
			dueDate = *item.DueDate
		}
		result.Schedule[i] = domain.PaymentScheduleItem{
			Stage:   stage,
			Percent: float64(*item.Percent),
			Amount:  float64(*item.Amount),
			DueDate: dueDate,
		}
	}
	return result
}

func generatedBonusesToDomain(bonuses []generated.Bonus) []domain.Bonus {
	result := make([]domain.Bonus, len(bonuses))
	for i, b := range bonuses {
		title := ""
		if b.Title != nil {
			title = *b.Title
		}
		style := ""
		if b.Style != nil {
			style = *b.Style
		}
		description := ""
		if b.Description != nil {
			description = *b.Description
		}
		result[i] = domain.Bonus{
			Title:       title,
			Style:       style,
			Description: description,
		}
	}
	return result
}

func generatedFloorPositionToDomain(fp *generated.FloorPosition) *domain.FloorPosition {
	if fp == nil {
		return nil
	}
	return &domain.FloorPosition{
		Label: *fp.Label,
		X:     float64(*fp.X),
		Y:     float64(*fp.Y),
	}
}

// Badge mappers

func DomainBadgeToGenerated(badge *domain.Badge) *generated.Badge {
	if badge == nil {
		return nil
	}
	id := openapi_types.UUID(badge.ID)
	result := &generated.Badge{
		Id:              &id,
		Slug:            &badge.Slug,
		Name:            &badge.Name,
		BackgroundColor: &badge.BackgroundColor,
		TextColor:       &badge.TextColor,
		Icon:            badge.Icon,
		IconColor:       &badge.IconColor,
		SortOrder:       intPtr(badge.SortOrder),
		CreatedAt:       timePtr(badge.CreatedAt),
		UpdatedAt:       timePtr(badge.UpdatedAt),
	}
	return result
}

func GeneratedBadgeCreateToDomain(req *generated.BadgeCreateRequest) (*domain.Badge, error) {
	badge := &domain.Badge{
		Slug:            req.Slug,
		Name:            req.Name,
		BackgroundColor: "#000000",
		TextColor:       "#FFFFFF",
		IconColor:       "#FFD400",
		SortOrder:       0,
	}

	if req.BackgroundColor != nil {
		badge.BackgroundColor = *req.BackgroundColor
	}
	if req.TextColor != nil {
		badge.TextColor = *req.TextColor
	}
	if req.Icon != nil {
		badge.Icon = req.Icon
	}
	if req.IconColor != nil {
		badge.IconColor = *req.IconColor
	}
	if req.SortOrder != nil {
		badge.SortOrder = *req.SortOrder
	}

	return badge, nil
}

func ApplyBadgeUpdateRequest(existing *domain.Badge, req *generated.BadgeUpdateRequest) *domain.Badge {
	if existing == nil || req == nil {
		return nil
	}
	updated := *existing

	if req.Slug != nil {
		updated.Slug = *req.Slug
	}
	if req.Name != nil {
		updated.Name = *req.Name
	}
	if req.BackgroundColor != nil {
		updated.BackgroundColor = *req.BackgroundColor
	}
	if req.TextColor != nil {
		updated.TextColor = *req.TextColor
	}
	if req.Icon != nil {
		updated.Icon = req.Icon
	}
	if req.IconColor != nil {
		updated.IconColor = *req.IconColor
	}
	if req.SortOrder != nil {
		updated.SortOrder = *req.SortOrder
	}

	return &updated
}

// Infrastructure mappers

func DomainInfrastructureToGenerated(infra *domain.Infrastructure) *generated.Infrastructure {
	if infra == nil {
		return nil
	}
	id := openapi_types.UUID(infra.ID)
	result := &generated.Infrastructure{
		Id:              &id,
		Slug:            &infra.Slug,
		Name:            &infra.Name,
		BackgroundColor: &infra.BackgroundColor,
		TextColor:       &infra.TextColor,
		Icon:            infra.Icon,
		SortOrder:       intPtr(infra.SortOrder),
		CreatedAt:       timePtr(infra.CreatedAt),
		UpdatedAt:       timePtr(infra.UpdatedAt),
	}
	return result
}

func GeneratedInfrastructureCreateToDomain(req *generated.InfrastructureCreateRequest) (*domain.Infrastructure, error) {
	infra := &domain.Infrastructure{
		Slug:            req.Slug,
		Name:            req.Name,
		BackgroundColor: "#000000",
		TextColor:       "#FFFFFF",
		SortOrder:       0,
	}

	if req.BackgroundColor != nil {
		infra.BackgroundColor = *req.BackgroundColor
	}
	if req.TextColor != nil {
		infra.TextColor = *req.TextColor
	}
	if req.Icon != nil {
		infra.Icon = req.Icon
	}
	if req.SortOrder != nil {
		infra.SortOrder = *req.SortOrder
	}

	return infra, nil
}

func ApplyInfrastructureUpdateRequest(existing *domain.Infrastructure, req *generated.InfrastructureUpdateRequest) *domain.Infrastructure {
	if existing == nil || req == nil {
		return nil
	}
	updated := *existing

	if req.Slug != nil {
		updated.Slug = *req.Slug
	}
	if req.Name != nil {
		updated.Name = *req.Name
	}
	if req.BackgroundColor != nil {
		updated.BackgroundColor = *req.BackgroundColor
	}
	if req.TextColor != nil {
		updated.TextColor = *req.TextColor
	}
	if req.Icon != nil {
		updated.Icon = req.Icon
	}
	if req.SortOrder != nil {
		updated.SortOrder = *req.SortOrder
	}

	return &updated
}
