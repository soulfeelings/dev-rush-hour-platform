package mappers

import (
	"encoding/json"
	"time"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/generated"
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
		if area.Data.SEO != nil && len(area.Data.SEO) > 0 {
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
		Id:        &id,
		Slug:      &project.Slug,
		Name:      &project.Name,
		Status:    &status,
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

	if project.Data.Description != nil || project.Data.Specs != nil || project.Data.FeaturesAmenities != nil || project.Data.Media != nil {
		result.Data = &generated.ProjectData{
			Specs:            domainSpecsToGenerated(project.Data.Specs),
			FeaturesAmenities: domainFeaturesAmenitiesToGenerated(project.Data.FeaturesAmenities),
			Media:            domainMediaToGenerated(project.Data.Media),
		}
		if project.Data.Description != nil {
			descBytes, _ := json.Marshal(project.Data.Description)
			result.Data.Description = &generated.ProjectData_Description{}
			result.Data.Description.UnmarshalJSON(descBytes)
		}
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
	if specs == nil || len(specs) == 0 {
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

