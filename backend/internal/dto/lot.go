package dto

import "rush-hour-platform/backend/internal/domain"

type LotResponse struct {
	ID            string              `json:"id"`
	Status        string              `json:"status"`
	ProjectID     *string             `json:"projectId,omitempty"`
	Type          string              `json:"type"`
	Bedrooms      *int                `json:"bedrooms,omitempty"`
	Bathrooms     *int                `json:"bathrooms,omitempty"`
	AreaSqm       *float64            `json:"areaSqm,omitempty"`
	Floor         *int                `json:"floor,omitempty"`
	PriceFromUs    float64             `json:"priceAmount"`
	DeveloperPrice *float64           `json:"developerPrice,omitempty"`
	ROI            *float64           `json:"roi,omitempty"`
	BonusKeys      []string           `json:"bonusKeys"`
	Data          LotDataResponse     `json:"data"`
	CreatedAt     string              `json:"createdAt"`
	UpdatedAt     string              `json:"updatedAt"`
}

type LotDataResponse struct {
	Media         *domain.LotMedia    `json:"media,omitempty"`
	PaymentPlan   *domain.PaymentPlan `json:"paymentPlan,omitempty"`
	Bonuses       []domain.Bonus      `json:"bonuses,omitempty"`
	FloorPosition *domain.FloorPosition `json:"floorPosition,omitempty"`
	Tags          []string            `json:"tags,omitempty"`
}

type LotsListResponse struct {
	Items []LotResponse `json:"items"`
	Total int           `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

func LotToResponse(lot *domain.Lot) *LotResponse {
	if lot == nil {
		return nil
	}

	resp := &LotResponse{
		ID:            lot.ID.String(),
		Status:        string(lot.Status),
		Type:          string(lot.Type),
		PriceFromUs:   lot.PriceFromUs,
		BonusKeys:     lot.BonusKeys,
		CreatedAt:     lot.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:     lot.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Data: LotDataResponse{
			Media:         lot.Data.Media,
			PaymentPlan:   lot.Data.PaymentPlan,
			Bonuses:       lot.Data.Bonuses,
			FloorPosition: lot.Data.FloorPosition,
			Tags:          lot.Data.Tags,
		},
	}

	if lot.ProjectID != nil {
		id := lot.ProjectID.String()
		resp.ProjectID = &id
	}
	if lot.Bedrooms != nil {
		resp.Bedrooms = lot.Bedrooms
	}
	if lot.Bathrooms != nil {
		resp.Bathrooms = lot.Bathrooms
	}
	if lot.AreaSqm != nil {
		resp.AreaSqm = lot.AreaSqm
	}
	if lot.Floor != nil {
		resp.Floor = lot.Floor
	}
	if lot.PriceFromDeveloper != nil {
		resp.DeveloperPrice = lot.PriceFromDeveloper
	}
	if lot.ROI != nil {
		resp.ROI = lot.ROI
	}

	return resp
}

func LotsToResponse(lots []domain.Lot) []LotResponse {
	result := make([]LotResponse, len(lots))
	for i := range lots {
		resp := LotToResponse(&lots[i])
		if resp != nil {
			result[i] = *resp
		}
	}
	return result
}

