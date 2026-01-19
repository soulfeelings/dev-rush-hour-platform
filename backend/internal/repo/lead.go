package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
		SELECT id, status, type, source, project_id, lot_id, name, phone, email, data, created_at, updated_at, deleted_at
		FROM leads
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&lead.ID, &lead.Status, &lead.Type, &source, &projectID, &lotID,
		&lead.Name, &lead.Phone, &email, &dataJSON, &lead.CreatedAt, &lead.UpdatedAt, &lead.DeletedAt,
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

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &lead.Data); err != nil {
			return nil, err
		}
	} else {
		lead.Data = domain.LeadData{}
	}

	return &lead, nil
}

func (r *LeadRepo) List(status *domain.LeadStatus) ([]domain.Lead, error) {
	query := `
		SELECT id, status, type, source, project_id, lot_id, name, phone, email, data, created_at, updated_at
		FROM leads
	`
	args := []interface{}{}
	argPos := 1

	whereClause := "WHERE deleted_at IS NULL"
	
	if status != nil {
		whereClause += ` AND status = $` + fmt.Sprintf("%d", argPos)
		args = append(args, string(*status))
		argPos++
	}

	query += whereClause + ` ORDER BY created_at DESC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leads []domain.Lead
	for rows.Next() {
		var lead domain.Lead
		var dataJSON []byte
		var projectID, lotID, email, source sql.NullString

		if err := rows.Scan(
			&lead.ID, &lead.Status, &lead.Type, &source, &projectID, &lotID,
			&lead.Name, &lead.Phone, &email, &dataJSON, &lead.CreatedAt, &lead.UpdatedAt,
		); err != nil {
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

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lead.Data); err != nil {
				return nil, err
			}
		} else {
			lead.Data = domain.LeadData{}
		}

		leads = append(leads, lead)
	}

	return leads, rows.Err()
}

func (r *LeadRepo) Update(id uuid.UUID, lead *domain.Lead) error {
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
		UPDATE leads
		SET status = $1, type = $2, source = $3, project_id = $4, lot_id = $5, 
		    name = $6, phone = $7, email = $8, data = $9, updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING updated_at
	`, lead.Status, lead.Type, source, projectID, lotID, lead.Name, lead.Phone, email, dataJSON, id).Scan(&lead.UpdatedAt)

	return err
}

func (r *LeadRepo) Delete(id uuid.UUID) error {
	_, err := r.db.Exec(`
		UPDATE leads
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	return err
}


