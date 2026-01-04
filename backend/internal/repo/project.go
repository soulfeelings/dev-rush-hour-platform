package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type ProjectRepo struct {
	db *sql.DB
}

func NewProjectRepo(db *sql.DB) *ProjectRepo {
	return &ProjectRepo{db: db}
}

func (r *ProjectRepo) GetBySlug(slug string) (*domain.Project, error) {
	var project domain.Project
	var dataJSON []byte
	var developerID, areaID sql.NullString
	var lat, lng sql.NullFloat64

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, developer_id, area_id, lat, lng, data, created_at, updated_at
		FROM projects
		WHERE slug = $1
	`, slug).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status,
		&developerID, &areaID, &lat, &lng, &dataJSON,
		&project.CreatedAt, &project.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if developerID.Valid {
		id := uuid.MustParse(developerID.String)
		project.DeveloperID = &id
	}
	if areaID.Valid {
		id := uuid.MustParse(areaID.String)
		project.AreaID = &id
	}
	if lat.Valid {
		project.Lat = &lat.Float64
	}
	if lng.Valid {
		project.Lng = &lng.Float64
	}

	if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
		return nil, err
	}

	return &project, nil
}

func (r *ProjectRepo) List(areaSlug *string) ([]domain.Project, error) {
	query := `
		SELECT p.id, p.slug, p.name, p.status, p.developer_id, p.area_id, p.lat, p.lng, p.data, p.created_at, p.updated_at
		FROM projects p
	`
	args := []interface{}{}
	argPos := 1

	if areaSlug != nil {
		query += ` JOIN areas a ON p.area_id = a.id WHERE a.slug = $` + fmt.Sprintf("%d", argPos)
		args = append(args, *areaSlug)
		argPos++
		query += ` AND p.status = 'active'`
	} else {
		query += ` WHERE p.status = 'active'`
	}

	query += ` ORDER BY p.name`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []domain.Project
	for rows.Next() {
		var project domain.Project
		var dataJSON []byte
		var developerID, areaID sql.NullString
		var lat, lng sql.NullFloat64

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status,
			&developerID, &areaID, &lat, &lng, &dataJSON,
			&project.CreatedAt, &project.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if developerID.Valid {
			id := uuid.MustParse(developerID.String)
			project.DeveloperID = &id
		}
		if areaID.Valid {
			id := uuid.MustParse(areaID.String)
			project.AreaID = &id
		}
		if lat.Valid {
			project.Lat = &lat.Float64
		}
		if lng.Valid {
			project.Lng = &lng.Float64
		}

		if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}

	return projects, rows.Err()
}

func (r *ProjectRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.QueryRow(`SELECT id FROM projects WHERE slug = $1`, slug).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &id, nil
}

