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
		if project.Developer.Data != nil {
			result.Developer.Data = &project.Developer.Data
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

	// Always include data for isRecommended, isFeatured, tags
	result.Data = &generated.ProjectData{
		Specs:             domainSpecsToGenerated(project.Data.Specs),
		FeaturesAmenities: domainFeaturesAmenitiesToGenerated(project.Data.FeaturesAmenities),
		Media:             domainMediaToGenerated(project.Data.Media),
		IsRecommended:     &project.Data.IsRecommended,
		IsFeatured:        &project.Data.IsFeatured,
	}
	if len(project.Data.Tags) > 0 {
		result.Data.Tags = &project.Data.Tags
	}
	if project.Data.Description != nil {
		descBytes, _ := json.Marshal(project.Data.Description)
		result.Data.Description = &generated.ProjectData_Description{}
		result.Data.Description.UnmarshalJSON(descBytes)
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
		PriceCurrency: &lot.PriceCurrency,
		PriceAmount:   float32Ptr(float32(lot.PriceAmount)),
		CreatedAt:     timePtr(lot.CreatedAt),
		UpdatedAt:     timePtr(lot.UpdatedAt),
	}

	if len(lot.BonusKeys) > 0 {
		result.BonusKeys = &lot.BonusKeys
	}
	if lot.ProjectID != nil {
		projectID := openapi_types.UUID(*lot.ProjectID)
		result.ProjectId = &projectID
	}
	if lot.DeveloperID != nil {
		devID := openapi_types.UUID(*lot.DeveloperID)
		result.DeveloperId = &devID
	}
	if lot.AreaID != nil {
		areaID := openapi_types.UUID(*lot.AreaID)
		result.AreaId = &areaID
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

	if lot.Data.Media != nil || lot.Data.PaymentPlan != nil || lot.Data.Bonuses != nil || lot.Data.FloorPosition != nil || lot.Data.Tags != nil {
		result.Data = &generated.LotData{
			Media:         domainLotMediaToGenerated(lot.Data.Media),
			PaymentPlan:   domainPaymentPlanToGenerated(lot.Data.PaymentPlan),
			Bonuses:       domainBonusesToGenerated(lot.Data.Bonuses),
			FloorPosition: domainFloorPositionToGenerated(lot.Data.FloorPosition),
			Tags:          domainTagsToGenerated(lot.Data.Tags),
		}
	}

	return result
}

func DomainLotToGeneratedLotListItem(lot *domain.Lot) *generated.LotListItem {
	if lot == nil {
		return nil
	}
	id := openapi_types.UUID(lot.ID)
	status := generated.LotStatus(lot.Status)
	lotType := generated.LotType(lot.Type)
	result := &generated.LotListItem{
		Id:            &id,
		Status:        (*generated.LotListItemStatus)(&status),
		Type:          (*generated.LotListItemType)(&lotType),
		PriceCurrency: &lot.PriceCurrency,
		PriceAmount:   float32Ptr(float32(lot.PriceAmount)),
		CreatedAt:     timePtr(lot.CreatedAt),
		UpdatedAt:     timePtr(lot.UpdatedAt),
	}

	if len(lot.BonusKeys) > 0 {
		result.BonusKeys = &lot.BonusKeys
	}
	if lot.ProjectID != nil {
		projectID := openapi_types.UUID(*lot.ProjectID)
		result.ProjectId = &projectID
	}
	if lot.DeveloperID != nil {
		devID := openapi_types.UUID(*lot.DeveloperID)
		result.DeveloperId = &devID
	}
	if lot.AreaID != nil {
		areaID := openapi_types.UUID(*lot.AreaID)
		result.AreaId = &areaID
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

	if lot.Data.Media != nil || lot.Data.PaymentPlan != nil || lot.Data.Bonuses != nil || lot.Data.FloorPosition != nil || lot.Data.Tags != nil {
		result.Data = &generated.LotData{
			Media:         domainLotMediaToGenerated(lot.Data.Media),
			PaymentPlan:   domainPaymentPlanToGenerated(lot.Data.PaymentPlan),
			Bonuses:       domainBonusesToGenerated(lot.Data.Bonuses),
			FloorPosition: domainFloorPositionToGenerated(lot.Data.FloorPosition),
			Tags:          domainTagsToGenerated(lot.Data.Tags),
		}
	}

	// Add nested objects
	if lot.Project != nil {
		result.Project = DomainProjectToGenerated(lot.Project)
	}
	if lot.Developer != nil {
		result.Developer = DomainDeveloperToGenerated(lot.Developer)
	}
	if lot.Area != nil {
		result.Area = DomainAreaToGenerated(lot.Area)
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

func domainSpecsToGenerated(specs map[string]interface{}) *map[string]interface{} {
	if len(specs) == 0 {
		return nil
	}
	return &specs
}

func domainFeaturesAmenitiesToGenerated(features []interface{}) *[]interface{} {
	if len(features) == 0 {
		return nil
	}
	return &features
}

func domainMediaToGenerated(media *domain.Media) *generated.Media {
	if media == nil {
		return nil
	}
	result := &generated.Media{}
	if media.Cover != nil {
		result.Cover = domainMediaItemToGenerated(media.Cover)
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
		Data:   make(map[string]interface{}),
	}

	if req.Status != nil {
		dev.Status = domain.DeveloperStatus(*req.Status)
	}
	if req.Data != nil {
		dev.Data = *req.Data
	}

	return dev, nil
}

func GeneratedDeveloperUpdateToDomain(req *generated.DeveloperUpdateRequest) (*domain.Developer, error) {
	dev := &domain.Developer{
		Data: make(map[string]interface{}),
	}

	if req.Slug != nil {
		dev.Slug = *req.Slug
	}
	if req.Name != nil {
		dev.Name = *req.Name
	}
	if req.Status != nil {
		dev.Status = domain.DeveloperStatus(*req.Status)
	}
	if req.Data != nil {
		dev.Data = *req.Data
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
	if len(dev.Data) > 0 {
		result.Data = &dev.Data
	}
	return result
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
	if req.Data != nil {
		project.Data = domainProjectDataFromGenerated(req.Data)
	}

	return project, nil
}

func GeneratedProjectUpdateToDomain(req *generated.ProjectUpdateRequest) (*domain.Project, error) {
	project := &domain.Project{}

	if req.Slug != nil {
		project.Slug = *req.Slug
	}
	if req.Name != nil {
		project.Name = *req.Name
	}
	if req.Status != nil {
		project.Status = domain.ProjectStatus(*req.Status)
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
	if req.Data != nil {
		project.Data = domainProjectDataFromGenerated(req.Data)
	}

	return project, nil
}

func domainProjectDataFromGenerated(data *generated.ProjectData) domain.ProjectData {
	result := domain.ProjectData{}
	if data.Description != nil {
		result.Description = data.Description
	}
	if data.Specs != nil {
		result.Specs = *data.Specs
	}
	if data.FeaturesAmenities != nil {
		result.FeaturesAmenities = *data.FeaturesAmenities
	}
	if data.Media != nil {
		result.Media = generatedMediaToDomain(data.Media)
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
		PriceCurrency: "AED",
		PriceAmount:   float64(req.PriceAmount),
		BonusKeys:     []string{},
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
	}

	if req.DeveloperId != nil {
		id := uuid.UUID(*req.DeveloperId)
		lot.DeveloperID = &id
	}
	if req.AreaId != nil {
		id := uuid.UUID(*req.AreaId)
		lot.AreaID = &id
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
	if req.PriceCurrency != nil {
		lot.PriceCurrency = *req.PriceCurrency
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
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
	if req.DeveloperId != nil {
		id := uuid.UUID(*req.DeveloperId)
		lot.DeveloperID = &id
	}
	if req.AreaId != nil {
		id := uuid.UUID(*req.AreaId)
		lot.AreaID = &id
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
	if req.PriceCurrency != nil {
		lot.PriceCurrency = *req.PriceCurrency
	}
	if req.PriceAmount != nil {
		lot.PriceAmount = float64(*req.PriceAmount)
	}
	if req.BonusKeys != nil {
		lot.BonusKeys = *req.BonusKeys
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
	if media.Cover != nil {
		result.Cover = generatedMediaItemToDomain(media.Cover)
	}
	return result
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
