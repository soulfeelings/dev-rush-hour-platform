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
		WHERE slug = $1 AND deleted_at IS NULL
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

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	return &area, nil
}

func (r *AreaRepo) List(includeBoundary bool) ([]domain.Area, error) {
	query := `
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at
		FROM areas
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	areas := []domain.Area{}
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

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
				return nil, err
			}
		} else {
			area.Data = domain.AreaData{}
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
	err := r.db.QueryRow(`SELECT id FROM areas WHERE slug = $1 AND deleted_at IS NULL`, slug).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &id, nil
}

func (r *AreaRepo) Create(area *domain.Area) error {
	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		return err
	}

	err = r.db.QueryRow(`
		INSERT INTO areas (slug, name, city, lat, lng, status, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`, area.Slug, area.Name, area.City, area.Lat, area.Lng, area.Status, dataJSON).Scan(
		&area.ID, &area.CreatedAt, &area.UpdatedAt,
	)

	return err
}

func (r *AreaRepo) Update(id uuid.UUID, area *domain.Area) error {
	dataJSON, err := json.Marshal(area.Data)
	if err != nil {
		return err
	}

	err = r.db.QueryRow(`
		UPDATE areas
		SET slug = $1, name = $2, city = $3, lat = $4, lng = $5, status = $6, data = $7, updated_at = NOW()
		WHERE id = $8 AND deleted_at IS NULL
		RETURNING updated_at
	`, area.Slug, area.Name, area.City, area.Lat, area.Lng, area.Status, dataJSON, id).Scan(&area.UpdatedAt)

	return err
}

func (r *AreaRepo) GetByID(id uuid.UUID) (*domain.Area, error) {
	var area domain.Area
	var dataJSON []byte

	err := r.db.QueryRow(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&area.ID, &area.Slug, &area.Name, &area.City,
		&area.Lat, &area.Lng, &area.Status, &dataJSON,
		&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
			return nil, err
		}
	} else {
		area.Data = domain.AreaData{}
	}

	return &area, nil
}

func (r *AreaRepo) ListAll() ([]domain.Area, error) {
	rows, err := r.db.Query(`
		SELECT id, slug, name, city, lat, lng, status, data, created_at, updated_at, deleted_at
		FROM areas
		WHERE deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	areas := []domain.Area{}
	for rows.Next() {
		var area domain.Area
		var dataJSON []byte

		if err := rows.Scan(
			&area.ID, &area.Slug, &area.Name, &area.City,
			&area.Lat, &area.Lng, &area.Status, &dataJSON,
			&area.CreatedAt, &area.UpdatedAt, &area.DeletedAt,
		); err != nil {
			return nil, err
		}

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &area.Data); err != nil {
				return nil, err
			}
		} else {
			area.Data = domain.AreaData{}
		}

		areas = append(areas, area)
	}

	return areas, rows.Err()
}

func (r *AreaRepo) Delete(id uuid.UUID) error {
	_, err := r.db.Exec(`
		UPDATE areas
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	return err
}

