package repo

import (
	"database/sql"
	"encoding/json"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type LeadRepo struct {
	db *sql.DB
}

func NewLeadRepo(db *sql.DB) *LeadRepo {
	return &LeadRepo{db: db}
}

func (r *LeadRepo) Create(lead *domain.Lead) error {
	dataJSON, err := json.Marshal(lead.Data)
	if err != nil {
		return err
	}

	var projectID, lotID, email, source sql.NullString
	if lead.ProjectID != nil {
		projectID = sql.NullString{String: lead.ProjectID.String(), Valid: true}
	}
	if lead.LotID != nil {
		lotID = sql.NullString{String: lead.LotID.String(), Valid: true}
	}
	if lead.Email != nil {
		email = sql.NullString{String: *lead.Email, Valid: true}
	}
	if lead.Source != nil {
		source = sql.NullString{String: *lead.Source, Valid: true}
	}

	err = r.db.QueryRow(`
		INSERT INTO leads (status, type, source, project_id, lot_id, name, phone, email, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`, lead.Status, lead.Type, source, projectID, lotID, lead.Name, lead.Phone, email, dataJSON).Scan(
		&lead.ID, &lead.CreatedAt, &lead.UpdatedAt,
	)

	return err
}

func (r *LeadRepo) GetByID(id uuid.UUID) (*domain.Lead, error) {
	var lead domain.Lead
	var dataJSON []byte
	var projectID, lotID, email, source sql.NullString

	err := r.db.QueryRow(`
		SELECT id, status, type, source, project_id, lot_id, name, phone, email, data, created_at, updated_at
		FROM leads
		WHERE id = $1
	`, id).Scan(
		&lead.ID, &lead.Status, &lead.Type, &source, &projectID, &lotID,
		&lead.Name, &lead.Phone, &email, &dataJSON, &lead.CreatedAt, &lead.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if projectID.Valid {
		id := uuid.MustParse(projectID.String)
		lead.ProjectID = &id
	}
	if lotID.Valid {
		id := uuid.MustParse(lotID.String)
		lead.LotID = &id
	}
	if email.Valid {
		lead.Email = &email.String
	}
	if source.Valid {
		lead.Source = &source.String
	}

	if err := json.Unmarshal(dataJSON, &lead.Data); err != nil {
		return nil, err
	}

	return &lead, nil
}

