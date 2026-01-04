package repo

import (
	"database/sql"
	"encoding/json"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
)

type DeveloperRepo struct {
	db *sql.DB
}

func NewDeveloperRepo(db *sql.DB) *DeveloperRepo {
	return &DeveloperRepo{db: db}
}

func (r *DeveloperRepo) Create(dev *domain.Developer) error {
	dataJSON, err := json.Marshal(dev.Data)
	if err != nil {
		return err
	}

	err = r.db.QueryRow(`
		INSERT INTO developers (slug, name, status, data)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`, dev.Slug, dev.Name, dev.Status, dataJSON).Scan(
		&dev.ID, &dev.CreatedAt, &dev.UpdatedAt,
	)

	return err
}

func (r *DeveloperRepo) Update(id uuid.UUID, dev *domain.Developer) error {
	dataJSON, err := json.Marshal(dev.Data)
	if err != nil {
		return err
	}

	err = r.db.QueryRow(`
		UPDATE developers
		SET slug = $1, name = $2, status = $3, data = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING updated_at
	`, dev.Slug, dev.Name, dev.Status, dataJSON, id).Scan(&dev.UpdatedAt)

	return err
}

func (r *DeveloperRepo) GetByID(id uuid.UUID) (*domain.Developer, error) {
	var dev domain.Developer
	var dataJSON []byte

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, data, created_at, updated_at
		FROM developers
		WHERE id = $1
	`, id).Scan(
		&dev.ID, &dev.Slug, &dev.Name, &dev.Status, &dataJSON,
		&dev.CreatedAt, &dev.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if err := json.Unmarshal(dataJSON, &dev.Data); err != nil {
		return nil, err
	}

	return &dev, nil
}

func (r *DeveloperRepo) List() ([]domain.Developer, error) {
	rows, err := r.db.Query(`
		SELECT id, slug, name, status, data, created_at, updated_at
		FROM developers
		ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var developers []domain.Developer
	for rows.Next() {
		var dev domain.Developer
		var dataJSON []byte

		if err := rows.Scan(
			&dev.ID, &dev.Slug, &dev.Name, &dev.Status, &dataJSON,
			&dev.CreatedAt, &dev.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(dataJSON, &dev.Data); err != nil {
			return nil, err
		}

		developers = append(developers, dev)
	}

	return developers, rows.Err()
}

