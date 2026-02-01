package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"strings"

	"github.com/google/uuid"
)

type ProjectRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewProjectRepo(db *sql.DB) *ProjectRepo {
	return &ProjectRepo{
		db:     db,
		logger: slog.Default(),
	}
}

func (r *ProjectRepo) GetBySlug(slug string) (*domain.Project, error) {
	r.logger.Info("project_repo_get_by_slug_started",
		"project_slug", slug,
	)

	var project domain.Project
	var dataJSON []byte
	var developerID, areaID sql.NullString
	var lat, lng sql.NullFloat64
	var devName, areaName, areaCity sql.NullString
	var devDataJSON []byte
	var sale sql.NullString

	err := r.db.QueryRow(`
		SELECT p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng, p.data, p.created_at, p.updated_at,
		       d.name as dev_name, d.data as dev_data,
		       a.name as area_name, a.city as area_city
		FROM projects p
		LEFT JOIN developers d ON p.developer_id = d.id
		LEFT JOIN areas a ON p.area_id = a.id
		WHERE p.slug = $1 AND p.deleted_at IS NULL
	`, slug).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
		&developerID, &areaID, &lat, &lng, &dataJSON,
		&project.CreatedAt, &project.UpdatedAt,
		&devName, &devDataJSON,
		&areaName, &areaCity,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("project_repo_get_by_slug_not_found",
				"project_slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("project_repo_get_by_slug_failed",
			"project_slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	if sale.Valid {
		project.Sale = sale.String
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

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
			r.logger.Error("project_repo_get_by_slug_unmarshal_failed",
				"project_slug", slug,
				"error", err.Error(),
			)
			return nil, err
		}
	} else {
		project.Data = domain.ProjectData{
			Specs:             make(map[string]interface{}),
			FeaturesAmenities: []interface{}{},
			Tags:              []string{},
		}
	}

	// Populate developer info
	if devName.Valid {
		project.Developer = &domain.Developer{
			Name: devName.String,
		}
		if len(devDataJSON) > 0 {
			if err := json.Unmarshal(devDataJSON, &project.Developer.Data); err != nil {
				return nil, err
			}
		}
	}

	// Populate area info
	if areaName.Valid {
		project.Area = &domain.Area{
			Name: areaName.String,
		}
		if areaCity.Valid {
			project.Area.City = areaCity.String
		}
	}

	r.logger.Info("project_repo_get_by_slug_completed",
		"project_slug", slug,
		"project_id", project.ID,
	)

	return &project, nil
}

func (r *ProjectRepo) List(filters domain.ProjectFilters, sort domain.ProjectSort) ([]domain.Project, error) {
	r.logger.Info("project_repo_list_started",
		"filters", filters,
		"sort", sort,
	)

	query := `
		SELECT p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng, p.data, p.created_at, p.updated_at,
		       d.name as dev_name, d.data as dev_data,
		       a.name as area_name, a.city as area_city
		FROM projects p
		LEFT JOIN developers d ON p.developer_id = d.id
		LEFT JOIN areas a ON p.area_id = a.id
	`
	args := []interface{}{}
	argPos := 1
	whereClauses := []string{"p.status = 'active'", "p.deleted_at IS NULL"}

	// Filter by city (via area's city field)
	if filters.CitySlug != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("a.city = $%d", argPos))
		args = append(args, *filters.CitySlug)
		argPos++
	}

	if filters.AreaSlug != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("a.slug = $%d", argPos))
		args = append(args, *filters.AreaSlug)
		argPos++
	}

	if filters.DeveloperSlug != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("d.slug = $%d", argPos))
		args = append(args, *filters.DeveloperSlug)
		argPos++
	}

	// Filter by project status (ready, construction, planning - stored in sale field or data)
	if filters.Status != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.sale = $%d", argPos))
		args = append(args, *filters.Status)
		argPos++
	}

	// Filter by bedrooms - match if project bedrooms is in the selected array
	if len(filters.Bedrooms) > 0 {
		// Build IN clause for bedrooms
		placeholders := make([]string, len(filters.Bedrooms))
		for i, bed := range filters.Bedrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bed)
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.data->'specs'->>'bedrooms' IS NOT NULL AND p.data->'specs'->>'bedrooms' != '' AND (p.data->'specs'->>'bedrooms')::int IN (%s)",
			strings.Join(placeholders, ", "),
		))
	}

	// Filter by bathrooms - match if project bathrooms is in the selected array
	if len(filters.Bathrooms) > 0 {
		placeholders := make([]string, len(filters.Bathrooms))
		for i, bath := range filters.Bathrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bath)
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.data->'specs'->>'bathrooms' IS NOT NULL AND p.data->'specs'->>'bathrooms' != '' AND (p.data->'specs'->>'bathrooms')::int IN (%s)",
			strings.Join(placeholders, ", "),
		))
	}

	// Search by project name (case-insensitive)
	if filters.Search != nil && *filters.Search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(p.name) LIKE LOWER($%d)", argPos))
		args = append(args, "%"+*filters.Search+"%")
		argPos++
	}

	if filters.PriceMin != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.data->'specs'->>'priceFrom' IS NOT NULL AND p.data->'specs'->>'priceFrom' != '' AND (p.data->'specs'->>'priceFrom')::numeric >= $%d", argPos))
		args = append(args, *filters.PriceMin)
		argPos++
	}

	if filters.PriceMax != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.data->'specs'->>'priceFrom' IS NOT NULL AND p.data->'specs'->>'priceFrom' != '' AND (p.data->'specs'->>'priceFrom')::numeric <= $%d", argPos))
		args = append(args, *filters.PriceMax)
		argPos++
	}

	query += " WHERE " + strings.Join(whereClauses, " AND ")

	// Apply sorting
	switch sort {
	case domain.ProjectSortPriceAsc:
		query += ` ORDER BY (p.data->'specs'->>'priceFrom')::numeric ASC NULLS LAST`
	case domain.ProjectSortPriceDesc:
		query += ` ORDER BY (p.data->'specs'->>'priceFrom')::numeric DESC NULLS LAST`
	case domain.ProjectSortNewest:
		query += ` ORDER BY p.created_at DESC`
	default:
		query += ` ORDER BY p.name`
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		r.logger.Error("project_repo_list_query_failed",
			"filters", filters,
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	projects := []domain.Project{}
	for rows.Next() {
		var project domain.Project
		var dataJSON []byte
		var developerID, areaID sql.NullString
		var lat, lng sql.NullFloat64
		var devName, areaName, areaCity sql.NullString
		var devDataJSON []byte
		var sale sql.NullString

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
			&developerID, &areaID, &lat, &lng, &dataJSON,
			&project.CreatedAt, &project.UpdatedAt,
			&devName, &devDataJSON,
			&areaName, &areaCity,
		); err != nil {
			return nil, err
		}

		if sale.Valid {
			project.Sale = sale.String
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

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
				r.logger.Error("project_repo_list_unmarshal_failed",
					"project_id", project.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			project.Data = domain.ProjectData{}
		}

		// Populate developer info
		if devName.Valid {
			project.Developer = &domain.Developer{
				Name: devName.String,
			}
			if len(devDataJSON) > 0 {
				if err := json.Unmarshal(devDataJSON, &project.Developer.Data); err != nil {
					return nil, err
				}
			}
		}

		// Populate area info
		if areaName.Valid {
			project.Area = &domain.Area{
				Name: areaName.String,
			}
			if areaCity.Valid {
				project.Area.City = areaCity.String
			}
		}

		projects = append(projects, project)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("project_repo_list_rows_error",
			"filters", filters,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("project_repo_list_completed",
		"filters", filters,
		"count", len(projects),
	)

	return projects, nil
}

func (r *ProjectRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	r.logger.Info("project_repo_get_id_by_slug_started",
		"project_slug", slug,
	)

	var id uuid.UUID
	err := r.db.QueryRow(`SELECT id FROM projects WHERE slug = $1 AND deleted_at IS NULL`, slug).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("project_repo_get_id_by_slug_not_found",
				"project_slug", slug,
			)
			return nil, nil
		}
		r.logger.Error("project_repo_get_id_by_slug_failed",
			"project_slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("project_repo_get_id_by_slug_completed",
		"project_slug", slug,
		"project_id", id,
	)

	return &id, nil
}

func (r *ProjectRepo) Create(project *domain.Project) error {
	r.logger.Info("project_repo_create_started",
		"project_slug", project.Slug,
		"project_name", project.Name,
	)

	dataJSON, err := json.Marshal(project.Data)
	if err != nil {
		r.logger.Error("project_repo_create_marshal_failed",
			"project_slug", project.Slug,
			"error", err.Error(),
		)
		return err
	}

	var developerID, areaID sql.NullString
	if project.DeveloperID != nil {
		developerID = sql.NullString{String: project.DeveloperID.String(), Valid: true}
	}
	if project.AreaID != nil {
		areaID = sql.NullString{String: project.AreaID.String(), Valid: true}
	}

	var lat, lng sql.NullFloat64
	if project.Lat != nil {
		lat = sql.NullFloat64{Float64: *project.Lat, Valid: true}
	}
	if project.Lng != nil {
		lng = sql.NullFloat64{Float64: *project.Lng, Valid: true}
	}

	err = r.db.QueryRow(`
		INSERT INTO projects (slug, name, status, sale, developer_id, area_id, lat, lng, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`, project.Slug, project.Name, project.Status, project.Sale, developerID, areaID, lat, lng, dataJSON).Scan(
		&project.ID, &project.CreatedAt, &project.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("project_repo_create_failed",
			"project_slug", project.Slug,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("project_repo_create_completed",
		"project_id", project.ID,
		"project_slug", project.Slug,
	)

	return nil
}

func (r *ProjectRepo) Update(id uuid.UUID, project *domain.Project) error {
	r.logger.Info("project_repo_update_started",
		"project_id", id,
	)

	dataJSON, err := json.Marshal(project.Data)
	if err != nil {
		r.logger.Error("project_repo_update_marshal_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	var developerID, areaID sql.NullString
	if project.DeveloperID != nil {
		developerID = sql.NullString{String: project.DeveloperID.String(), Valid: true}
	}
	if project.AreaID != nil {
		areaID = sql.NullString{String: project.AreaID.String(), Valid: true}
	}

	var lat, lng sql.NullFloat64
	if project.Lat != nil {
		lat = sql.NullFloat64{Float64: *project.Lat, Valid: true}
	}
	if project.Lng != nil {
		lng = sql.NullFloat64{Float64: *project.Lng, Valid: true}
	}

	err = r.db.QueryRow(`
		UPDATE projects
		SET slug = $1, name = $2, status = $3, sale = $4, developer_id = $5, area_id = $6, lat = $7, lng = $8, data = $9, updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING updated_at
	`, project.Slug, project.Name, project.Status, project.Sale, developerID, areaID, lat, lng, dataJSON, id).Scan(&project.UpdatedAt)

	if err != nil {
		r.logger.Error("project_repo_update_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("project_repo_update_completed",
		"project_id", id,
		"project_slug", project.Slug,
	)

	return nil
}

func (r *ProjectRepo) GetByID(id uuid.UUID) (*domain.Project, error) {
	r.logger.Info("project_repo_get_by_id_started",
		"project_id", id,
	)

	var project domain.Project
	var dataJSON []byte
	var developerID, areaID sql.NullString
	var lat, lng sql.NullFloat64

	err := r.db.QueryRow(`
		SELECT id, slug, name, status, sale, developer_id, area_id, lat, lng, data, created_at, updated_at, deleted_at
		FROM projects
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status, &project.Sale,
		&developerID, &areaID, &lat, &lng, &dataJSON,
		&project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("project_repo_get_by_id_not_found",
				"project_id", id,
			)
			return nil, nil
		}
		r.logger.Error("project_repo_get_by_id_failed",
			"project_id", id,
			"error", err.Error(),
		)
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

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
			r.logger.Error("project_repo_get_by_id_unmarshal_failed",
				"project_id", id,
				"error", err.Error(),
			)
			return nil, err
		}
	} else {
		project.Data = domain.ProjectData{
			Specs:             make(map[string]interface{}),
			FeaturesAmenities: []interface{}{},
			Tags:              []string{},
		}
	}

	r.logger.Info("project_repo_get_by_id_completed",
		"project_id", id,
		"project_slug", project.Slug,
	)

	return &project, nil
}

func (r *ProjectRepo) ListAll() ([]domain.Project, error) {
	r.logger.Info("project_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, slug, name, status, sale, developer_id, area_id, lat, lng, data, created_at, updated_at, deleted_at
		FROM projects
		WHERE deleted_at IS NULL
		ORDER BY name
	`)
	if err != nil {
		r.logger.Error("project_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	projects := []domain.Project{}
	for rows.Next() {
		var project domain.Project
		var dataJSON []byte
		var developerID, areaID sql.NullString
		var lat, lng sql.NullFloat64

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status, &project.Sale,
			&developerID, &areaID, &lat, &lng, &dataJSON,
			&project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
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

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &project.Data); err != nil {
				r.logger.Error("project_repo_list_all_unmarshal_failed",
					"project_id", project.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			project.Data = domain.ProjectData{}
		}

		projects = append(projects, project)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("project_repo_list_all_rows_error",
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("project_repo_list_all_completed",
		"count", len(projects),
	)

	return projects, nil
}

func (r *ProjectRepo) Delete(id uuid.UUID) error {
	r.logger.Info("project_repo_delete_started",
		"project_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE projects
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("project_repo_delete_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("project_repo_delete_completed",
		"project_id", id,
	)

	return nil
}