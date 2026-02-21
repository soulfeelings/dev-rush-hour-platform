package repo

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LeadRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewLeadRepo(pool *pgxpool.Pool) *LeadRepo {
	return &LeadRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

func (r *LeadRepo) Create(lead *domain.Lead) error {
	r.logger.Info("lead_repo_create_started", "lead_name", lead.Name, "lead_phone", lead.Phone, "lead_type", lead.Type)

	dataJSON, err := json.Marshal(lead.Data)
	if err != nil {
		r.logger.Error("lead_repo_create_marshal_failed", "lead_name", lead.Name, "error", err.Error())
		return err
	}

	row, err := r.queries.CreateLead(context.Background(), sqlcgen.CreateLeadParams{
		Status:    string(lead.Status),
		Type:      string(lead.Type),
		Source:    stringPtrToText(lead.Source),
		ProjectID: uuidPtrToNullUUID(lead.ProjectID),
		LotID:     uuidPtrToNullUUID(lead.LotID),
		Name:      lead.Name,
		Phone:     lead.Phone,
		Email:     stringPtrToText(lead.Email),
		Data:      dataJSON,
	})
	if err != nil {
		r.logger.Error("lead_repo_create_failed", "lead_name", lead.Name, "error", err.Error())
		return err
	}

	lead.ID = row.ID
	lead.CreatedAt = tstzToTime(row.CreatedAt)
	lead.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("lead_repo_create_completed", "lead_id", lead.ID, "lead_name", lead.Name)
	return nil
}

func (r *LeadRepo) GetByID(id uuid.UUID) (*domain.Lead, error) {
	r.logger.Info("lead_repo_get_by_id_started", "lead_id", id)

	row, err := r.queries.GetLeadByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("lead_repo_get_by_id_not_found", "lead_id", id)
			return nil, nil
		}
		r.logger.Error("lead_repo_get_by_id_failed", "lead_id", id, "error", err.Error())
		return nil, err
	}

	lead, err := sqlcLeadToDomain(row.ID, row.Status, row.Type, row.Source, row.ProjectID, row.LotID, row.Name, row.Phone, row.Email, row.Data, row.CreatedAt, row.UpdatedAt, row.DeletedAt)
	if err != nil {
		r.logger.Error("lead_repo_get_by_id_unmarshal_failed", "lead_id", id, "error", err.Error())
		return nil, err
	}

	r.logger.Info("lead_repo_get_by_id_completed", "lead_id", id, "lead_name", lead.Name)
	return lead, nil
}

func (r *LeadRepo) List(status *domain.LeadStatus) ([]domain.Lead, error) {
	r.logger.Info("lead_repo_list_started", "status_filter", status)

	var statusFilter pgtype.Text
	if status != nil {
		statusFilter = pgtype.Text{String: string(*status), Valid: true}
	}

	rows, err := r.queries.ListLeads(context.Background(), statusFilter)
	if err != nil {
		r.logger.Error("lead_repo_list_query_failed", "status_filter", status, "error", err.Error())
		return nil, err
	}

	leads := make([]domain.Lead, 0, len(rows))
	for _, row := range rows {
		lead, err := sqlcLeadToDomain(row.ID, row.Status, row.Type, row.Source, row.ProjectID, row.LotID, row.Name, row.Phone, row.Email, row.Data, row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{})
		if err != nil {
			r.logger.Error("lead_repo_list_unmarshal_failed", "lead_id", row.ID, "error", err.Error())
			return nil, err
		}
		leads = append(leads, *lead)
	}

	r.logger.Info("lead_repo_list_completed", "count", len(leads), "status_filter", status)
	return leads, nil
}

func (r *LeadRepo) Update(id uuid.UUID, lead *domain.Lead) error {
	r.logger.Info("lead_repo_update_started", "lead_id", id)

	dataJSON, err := json.Marshal(lead.Data)
	if err != nil {
		r.logger.Error("lead_repo_update_marshal_failed", "lead_id", id, "error", err.Error())
		return err
	}

	updatedAt, err := r.queries.UpdateLead(context.Background(), sqlcgen.UpdateLeadParams{
		Status:    string(lead.Status),
		Type:      string(lead.Type),
		Source:    stringPtrToText(lead.Source),
		ProjectID: uuidPtrToNullUUID(lead.ProjectID),
		LotID:     uuidPtrToNullUUID(lead.LotID),
		Name:      lead.Name,
		Phone:     lead.Phone,
		Email:     stringPtrToText(lead.Email),
		Data:      dataJSON,
		ID:        id,
	})
	if err != nil {
		r.logger.Error("lead_repo_update_failed", "lead_id", id, "error", err.Error())
		return err
	}

	lead.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("lead_repo_update_completed", "lead_id", id, "lead_name", lead.Name, "lead_status", lead.Status)
	return nil
}

func (r *LeadRepo) Delete(id uuid.UUID) error {
	r.logger.Info("lead_repo_delete_started", "lead_id", id)

	if err := r.queries.DeleteLead(context.Background(), id); err != nil {
		r.logger.Error("lead_repo_delete_failed", "lead_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lead_repo_delete_completed", "lead_id", id)
	return nil
}

// sqlcLeadToDomain converts sqlc lead row fields to domain.Lead
func sqlcLeadToDomain(id uuid.UUID, status, typ string, source pgtype.Text, projectID, lotID uuid.NullUUID, name, phone string, email pgtype.Text, data []byte, createdAt, updatedAt, deletedAt pgtype.Timestamptz) (*domain.Lead, error) {
	lead := &domain.Lead{
		ID:        id,
		Status:    domain.LeadStatus(status),
		Type:      domain.LeadType(typ),
		Source:    textToStringPtr(source),
		ProjectID: nullUUIDToPtr(projectID),
		LotID:     nullUUIDToPtr(lotID),
		Name:      name,
		Phone:     phone,
		Email:     textToStringPtr(email),
		CreatedAt: tstzToTime(createdAt),
		UpdatedAt: tstzToTime(updatedAt),
		DeletedAt: tstzToTimePtr(deletedAt),
	}

	if len(data) > 0 {
		if err := json.Unmarshal(data, &lead.Data); err != nil {
			return nil, err
		}
	} else {
		lead.Data = domain.LeadData{}
	}

	return lead, nil
}
