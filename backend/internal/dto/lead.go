package dto

import (
	"rush-hour-platform/backend/internal/domain"
	"github.com/google/uuid"
)

type LeadCreateRequest struct {
	Type      string                 `json:"type" validate:"required,oneof=callback viewing details"`
	Source    *string                `json:"source,omitempty"`
	ProjectID *string                `json:"projectId,omitempty"`
	LotID     *string                `json:"lotId,omitempty"`
	Name      string                 `json:"name" validate:"required,min=2,max=255"`
	Phone     string                 `json:"phone" validate:"required,min=5,max=50"`
	Email     *string                `json:"email,omitempty" validate:"omitempty,email"`
	Data      LeadDataRequest        `json:"data,omitempty"`
}

type LeadDataRequest struct {
	Preferred *string                `json:"preferred,omitempty"`
	Comment   *string                `json:"comment,omitempty"`
	PageURL   *string                `json:"pageUrl,omitempty"`
	UTM       map[string]interface{} `json:"utm,omitempty"`
}

type LeadResponse struct {
	ID        string              `json:"id"`
	Status    string              `json:"status"`
	Type      string              `json:"type"`
	Source    *string             `json:"source,omitempty"`
	ProjectID *string             `json:"projectId,omitempty"`
	LotID     *string             `json:"lotId,omitempty"`
	Name      string              `json:"name"`
	Phone     string              `json:"phone"`
	Email     *string             `json:"email,omitempty"`
	Data      LeadDataResponse    `json:"data"`
	CreatedAt string              `json:"createdAt"`
	UpdatedAt string              `json:"updatedAt"`
}

type LeadDataResponse struct {
	Preferred *string                `json:"preferred,omitempty"`
	Comment   *string                `json:"comment,omitempty"`
	PageURL   *string                `json:"pageUrl,omitempty"`
	UTM       map[string]interface{} `json:"utm,omitempty"`
}

func LeadCreateRequestToDomain(req *LeadCreateRequest) (*domain.Lead, error) {
	lead := &domain.Lead{
		Status: domain.LeadStatusNew,
		Type:   domain.LeadType(req.Type),
		Name:   req.Name,
		Phone:  req.Phone,
		Data: domain.LeadData{
			Preferred: req.Data.Preferred,
			Comment:   req.Data.Comment,
			PageURL:   req.Data.PageURL,
			UTM:       req.Data.UTM,
		},
	}

	if req.Source != nil {
		lead.Source = req.Source
	}
	if req.Email != nil {
		lead.Email = req.Email
	}

	if req.ProjectID != nil {
		projectID, err := uuid.Parse(*req.ProjectID)
		if err != nil {
			return nil, err
		}
		lead.ProjectID = &projectID
	}

	if req.LotID != nil {
		lotID, err := uuid.Parse(*req.LotID)
		if err != nil {
			return nil, err
		}
		lead.LotID = &lotID
	}

	return lead, nil
}

func LeadToResponse(lead *domain.Lead) *LeadResponse {
	if lead == nil {
		return nil
	}

	resp := &LeadResponse{
		ID:        lead.ID.String(),
		Status:    string(lead.Status),
		Type:      string(lead.Type),
		Name:      lead.Name,
		Phone:     lead.Phone,
		CreatedAt: lead.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: lead.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Data: LeadDataResponse{
			Preferred: lead.Data.Preferred,
			Comment:   lead.Data.Comment,
			PageURL:   lead.Data.PageURL,
			UTM:       lead.Data.UTM,
		},
	}

	if lead.Source != nil {
		resp.Source = lead.Source
	}
	if lead.Email != nil {
		resp.Email = lead.Email
	}
	if lead.ProjectID != nil {
		id := lead.ProjectID.String()
		resp.ProjectID = &id
	}
	if lead.LotID != nil {
		id := lead.LotID.String()
		resp.LotID = &id
	}

	return resp
}

