package dto

import "rush-hour-platform/backend/internal/domain"

type ProjectResponse struct {
	ID          string                 `json:"id"`
	Slug        string                 `json:"slug"`
	Name        string                 `json:"name"`
	Status      string                 `json:"status"`
	Sale        string                 `json:"sale"`
	DeveloperID *string                `json:"developerId,omitempty"`
	AreaID      *string                `json:"areaId,omitempty"`
	Lat         *float64               `json:"lat,omitempty"`
	Lng         *float64               `json:"lng,omitempty"`
	Data        ProjectDataResponse    `json:"data"`
	CreatedAt   string                 `json:"createdAt"`
	UpdatedAt   string                 `json:"updatedAt"`
}

type ProjectDataResponse struct {
	Description      interface{}   `json:"description,omitempty"`
	Specs            map[string]interface{} `json:"specs,omitempty"`
	FeaturesAmenities []interface{} `json:"featuresAmenities,omitempty"`
	Media            *domain.Media `json:"media,omitempty"`
}

func ProjectToResponse(project *domain.Project) *ProjectResponse {
	if project == nil {
		return nil
	}

	resp := &ProjectResponse{
		ID:        project.ID.String(),
		Slug:      project.Slug,
		Name:      project.Name,
		Status:    string(project.Status),
		Sale:      project.Sale,
		CreatedAt: project.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: project.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Data: ProjectDataResponse{
			Description:       project.Data.Description,
			Specs:             project.Data.Specs,
			FeaturesAmenities: project.Data.FeaturesAmenities,
			Media:             project.Data.Media,
		},
	}

	if project.DeveloperID != nil {
		id := project.DeveloperID.String()
		resp.DeveloperID = &id
	}
	if project.AreaID != nil {
		id := project.AreaID.String()
		resp.AreaID = &id
	}
	if project.Lat != nil {
		resp.Lat = project.Lat
	}
	if project.Lng != nil {
		resp.Lng = project.Lng
	}

	return resp
}

func ProjectsToResponse(projects []domain.Project) []ProjectResponse {
	result := make([]ProjectResponse, len(projects))
	for i := range projects {
		resp := ProjectToResponse(&projects[i])
		if resp != nil {
			result[i] = *resp
		}
	}
	return result
}

