package repo

import (
	"database/sql"
	"encoding/json"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type AreaRepo struct {
	db *sql.DB
}

func NewAreaRepo(db *sql.DB) *AreaRepo {
	return &AreaRepo{db: db}
}

func (r *AreaRepo) GetBySlug(slug string) (*domain.Area, error) {
	var area domain.Area
	var dataJSON []byte

	err := r.db.QueryRow(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at
		FROM areas
		WHERE slug = $1
	`, slug).Scan(
		&area.ID, &area.Slug, &area.Name, &area.City,
		&area.Lat, &area.Lng, &area.Status, &dataJSON,
		&area.CreatedAt, &area.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
		return nil, err
	}

	return &area, nil
}

func (r *AreaRepo) List(includeBoundary bool) ([]domain.Area, error) {
	query := `
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at
		FROM areas
		WHERE status = 'active'
		ORDER BY name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var areas []domain.Area
	for rows.Next() {
		var area domain.Area
		var dataJSON []byte

		if err := rows.Scan(
			&area.ID, &area.Slug, &area.Name, &area.City,
			&area.Lat, &area.Lng, &area.Status, &dataJSON,
			&area.CreatedAt, &area.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			return nil, err
		}

		if !includeBoundary && area.Data.Boundary != nil {
			area.Data.Boundary = nil
		}

		areas = append(areas, area)
	}

	return areas, rows.Err()
}

func (r *AreaRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.QueryRow(`SELECT id FROM areas WHERE slug = $1`, slug).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &id, nil
}

