package dto

import "rush-hour-platform/backend/internal/domain"

type AreaResponse struct {
	ID        string                 `json:"id"`
	Slug      string                 `json:"slug"`
	Name      string                 `json:"name"`
	City      string                 `json:"city"`
	Status    string                 `json:"status"`
	Data      AreaDataResponse       `json:"data"`
	CreatedAt string                 `json:"createdAt"`
	UpdatedAt string                 `json:"updatedAt"`
}

type AreaDataResponse struct {
	Boundary *domain.GeoJSONPolygon `json:"boundary,omitempty"`
	Center   *domain.Point          `json:"center,omitempty"`
	Zoom     *int                   `json:"zoom,omitempty"`
	BBox     *domain.BoundingBox    `json:"bbox,omitempty"`
	SEO      map[string]interface{} `json:"seo,omitempty"`
}

func AreaToResponse(area *domain.Area) *AreaResponse {
	if area == nil {
		return nil
	}

	resp := &AreaResponse{
		ID:        area.ID.String(),
		Slug:      area.Slug,
		Name:      area.Name,
		City:      area.City,
		Status:    string(area.Status),
		CreatedAt: area.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: area.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Data: AreaDataResponse{
			Boundary: area.Data.Boundary,
			Center:   area.Data.Center,
			Zoom:     area.Data.Zoom,
			BBox:     area.Data.BBox,
			SEO:      area.Data.SEO,
		},
	}

	return resp
}

func AreasToResponse(areas []domain.Area) []AreaResponse {
	result := make([]AreaResponse, len(areas))
	for i := range areas {
		resp := AreaToResponse(&areas[i])
		if resp != nil {
			result[i] = *resp
		}
	}
	return result
}

