package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"rush-hour-platform/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type LotRepo struct {
	db *sql.DB
}

func NewLotRepo(db *sql.DB) *LotRepo {
	return &LotRepo{db: db}
}

type LotFilters struct {
	AreaSlug   *string
	ProjectSlug *string
	Type       *domain.LotType
	Bedrooms   *int
	PriceMin   *float64
	PriceMax   *float64
	AreaMin    *float64
	AreaMax    *float64
	BonusKey   *string
	Status     domain.LotStatus
}

type LotSort string

const (
	LotSortPriceAsc  LotSort = "price_asc"
	LotSortPriceDesc LotSort = "price_desc"
	LotSortAreaDesc  LotSort = "area_desc"
	LotSortNewest    LotSort = "newest"
)

func (r *LotRepo) GetByID(id uuid.UUID) (*domain.Lot, error) {
	var lot domain.Lot
	var dataJSON []byte
	var projectID, developerID, areaID sql.NullString
	var bedrooms, bathrooms, floor sql.NullInt64
	var areaSqm sql.NullFloat64
	var bonusKeys pq.StringArray
	
	// Переменные для вложенных объектов
	var projSlug, projName, projSale, projStatus sql.NullString
	var projDataJSON []byte
	var projLat, projLng sql.NullFloat64
	var projCreatedAt, projUpdatedAt sql.NullTime
	
	var devSlug, devName, devStatus sql.NullString
	var devDataJSON []byte
	var devCreatedAt, devUpdatedAt sql.NullTime
	
	var areaSlug, areaName, areaCity, areaStatus sql.NullString
	var areaDataJSON []byte
	var areaLat, areaLng sql.NullFloat64
	var areaCreatedAt, areaUpdatedAt sql.NullTime

	err := r.db.QueryRow(`
		SELECT 
			l.id, l.status, l.project_id, l.developer_id, l.area_id, l.type, l.bedrooms, l.bathrooms,
			l.area_sqm, l.floor, l.price_currency, l.price_amount, l.bonus_keys, l.data, l.created_at, l.updated_at, l.deleted_at,
			p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.data, p.created_at, p.updated_at,
			d.slug, d.name, d.status, d.data, d.created_at, d.updated_at,
			a.slug, a.name, a.city, a.status, a.lat, a.lng, a.data, a.created_at, a.updated_at
		FROM lots l
		LEFT JOIN projects p ON l.project_id = p.id
		LEFT JOIN developers d ON l.developer_id = d.id
		LEFT JOIN areas a ON l.area_id = a.id
		WHERE l.id = $1 AND l.deleted_at IS NULL 
	`, id).Scan(
		&lot.ID, &lot.Status, &projectID, &developerID, &areaID,
		&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
		&lot.PriceCurrency, &lot.PriceAmount, &bonusKeys, &dataJSON,
		&lot.CreatedAt, &lot.UpdatedAt, &lot.DeletedAt,
		&projSlug, &projName, &projSale, &projStatus, &projLat, &projLng, &projDataJSON, &projCreatedAt, &projUpdatedAt,
		&devSlug, &devName, &devStatus, &devDataJSON, &devCreatedAt, &devUpdatedAt,
		&areaSlug, &areaName, &areaCity, &areaStatus, &areaLat, &areaLng, &areaDataJSON, &areaCreatedAt, &areaUpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if projectID.Valid {
		id := uuid.MustParse(projectID.String)
		lot.ProjectID = &id
	}
	if developerID.Valid {
		id := uuid.MustParse(developerID.String)
		lot.DeveloperID = &id
	}
	if areaID.Valid {
		id := uuid.MustParse(areaID.String)
		lot.AreaID = &id
	}
	if bedrooms.Valid {
		b := int(bedrooms.Int64)
		lot.Bedrooms = &b
	}
	if bathrooms.Valid {
		b := int(bathrooms.Int64)
		lot.Bathrooms = &b
	}
	if areaSqm.Valid {
		lot.AreaSqm = &areaSqm.Float64
	}
	if floor.Valid {
		f := int(floor.Int64)
		lot.Floor = &f
	}
	lot.BonusKeys = []string(bonusKeys)

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
			return nil, err
		}
	} else {
		lot.Data = domain.LotData{}
	}

	// Заполняем вложенный проект, если данные есть
	if projSlug.Valid {
		projID := uuid.MustParse(projectID.String)
		var projData domain.ProjectData
		if len(projDataJSON) > 0 {
			if err := json.Unmarshal(projDataJSON, &projData); err == nil {
				// ignore unmarshal errors for now
			}
		}
		lot.Project = &domain.Project{
			ID:          projID,
			Slug:        projSlug.String,
			Name:        projName.String,
			Status:      domain.ProjectStatus(projStatus.String),
			Data:        projData,
			CreatedAt:   projCreatedAt.Time,
			UpdatedAt:   projUpdatedAt.Time,
		}
		if projSale.Valid {
			lot.Project.Sale = projSale.String
		}
		if developerID.Valid {
			devID := uuid.MustParse(developerID.String)
			lot.Project.DeveloperID = &devID
		}
		if areaID.Valid {
			aID := uuid.MustParse(areaID.String)
			lot.Project.AreaID = &aID
		}
		if projLat.Valid {
			lot.Project.Lat = &projLat.Float64
		}
		if projLng.Valid {
			lot.Project.Lng = &projLng.Float64
		}
	}

	// Заполняем вложенного застройщика, если данные есть
	if devSlug.Valid {
		devID := uuid.MustParse(developerID.String)
		var devData map[string]interface{}
		if len(devDataJSON) > 0 {
			if err := json.Unmarshal(devDataJSON, &devData); err == nil {
				// ignore unmarshal errors for now
			}
		}
		lot.Developer = &domain.Developer{
			ID:        devID,
			Slug:      devSlug.String,
			Name:      devName.String,
			Status:    domain.DeveloperStatus(devStatus.String),
			Data:      devData,
			CreatedAt: devCreatedAt.Time,
			UpdatedAt: devUpdatedAt.Time,
		}
	}

	// Заполняем вложенный район, если данные есть
	if areaSlug.Valid {
		aID := uuid.MustParse(areaID.String)
		var aData domain.AreaData
		if len(areaDataJSON) > 0 {
			if err := json.Unmarshal(areaDataJSON, &aData); err == nil {
				// ignore unmarshal errors for now
			}
		}
		lot.Area = &domain.Area{
			ID:        aID,
			Slug:      areaSlug.String,
			Name:      areaName.String,
			City:      areaCity.String,
			Lat:       areaLat.Float64,
			Lng:       areaLng.Float64,
			Status:    domain.AreaStatus(areaStatus.String),
			Data:      aData,
			CreatedAt: areaCreatedAt.Time,
			UpdatedAt: areaUpdatedAt.Time,
		}
	}

	return &lot, nil
}

func (r *LotRepo) List(filters LotFilters, sort LotSort, limit, offset int) ([]domain.Lot, int, error) {
	query := `SELECT
			l.id, l.status, l.project_id, l.developer_id, l.area_id, l.type, l.bedrooms, l.bathrooms,
			l.area_sqm, l.floor, l.price_currency, l.price_amount, l.bonus_keys, l.data, l.created_at, l.updated_at,
			p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.data, p.created_at, p.updated_at,
			d.slug, d.name, d.status, d.data, d.created_at, d.updated_at,
			a.slug, a.name, a.city, a.status, a.lat, a.lng, a.data, a.created_at, a.updated_at
		FROM lots l
		LEFT JOIN projects p ON l.project_id = p.id
		LEFT JOIN developers d ON l.developer_id = d.id
		LEFT JOIN areas a ON l.area_id = a.id
		WHERE 1=1`
	countQuery := `SELECT COUNT(*) FROM lots l WHERE 1=1`
	args := []interface{}{}
	argPos := 1

	if filters.Status != "" {
		query += fmt.Sprintf(` AND l.status = $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.status = $%d`, argPos)
		args = append(args, filters.Status)
		argPos++
	} else {
		query += ` AND l.status = 'active' AND l.deleted_at IS NULL`
    	countQuery += ` AND l.status = 'active' AND l.deleted_at IS NULL`
	}

	if filters.AreaSlug != nil {
		query += fmt.Sprintf(` AND area_id IN (SELECT id FROM areas WHERE slug = $%d)`, argPos)
		countQuery += fmt.Sprintf(` AND area_id IN (SELECT id FROM areas WHERE slug = $%d)`, argPos)
		args = append(args, *filters.AreaSlug)
		argPos++
	}

	if filters.ProjectSlug != nil {
		query += fmt.Sprintf(` AND project_id IN (SELECT id FROM projects WHERE slug = $%d)`, argPos)
		countQuery += fmt.Sprintf(` AND project_id IN (SELECT id FROM projects WHERE slug = $%d)`, argPos)
		args = append(args, *filters.ProjectSlug)
		argPos++
	}

	if filters.Type != nil {
		query += fmt.Sprintf(` AND type = $%d`, argPos)
		countQuery += fmt.Sprintf(` AND type = $%d`, argPos)
		args = append(args, *filters.Type)
		argPos++
	}

	if filters.Bedrooms != nil {
		query += fmt.Sprintf(` AND bedrooms = $%d`, argPos)
		countQuery += fmt.Sprintf(` AND bedrooms = $%d`, argPos)
		args = append(args, *filters.Bedrooms)
		argPos++
	}

	if filters.PriceMin != nil {
		query += fmt.Sprintf(` AND price_amount >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND price_amount >= $%d`, argPos)
		args = append(args, *filters.PriceMin)
		argPos++
	}

	if filters.PriceMax != nil {
		query += fmt.Sprintf(` AND price_amount <= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND price_amount <= $%d`, argPos)
		args = append(args, *filters.PriceMax)
		argPos++
	}

	if filters.AreaMin != nil {
		query += fmt.Sprintf(` AND area_sqm >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND area_sqm >= $%d`, argPos)
		args = append(args, *filters.AreaMin)
		argPos++
	}

	if filters.AreaMax != nil {
		query += fmt.Sprintf(` AND area_sqm <= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND area_sqm <= $%d`, argPos)
		args = append(args, *filters.AreaMax)
		argPos++
	}

	if filters.BonusKey != nil {
		query += fmt.Sprintf(` AND bonus_keys @> $%d`, argPos)
		countQuery += fmt.Sprintf(` AND bonus_keys @> $%d`, argPos)
		args = append(args, pq.Array([]string{*filters.BonusKey}))
		argPos++
	}

	switch sort {
	case LotSortPriceAsc:
		query += ` ORDER BY l.price_amount ASC`
	case LotSortPriceDesc:
		query += ` ORDER BY l.price_amount DESC`
	case LotSortAreaDesc:
		query += ` ORDER BY l.area_sqm DESC NULLS LAST`
	case LotSortNewest:
		query += ` ORDER BY l.created_at DESC`
	default:
		query += ` ORDER BY l.created_at DESC`
	}

	query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argPos, argPos+1)
	args = append(args, limit, offset)

	var total int
	if err := r.db.QueryRow(countQuery, args[:len(args)-2]...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID, developerID, areaID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm sql.NullFloat64
		var bonusKeys pq.StringArray

		// Переменные для вложенных объектов
		var projSlug, projName, projSale, projStatus sql.NullString
		var projDataJSON []byte
		var projLat, projLng sql.NullFloat64
		var projCreatedAt, projUpdatedAt sql.NullTime

		var devSlug, devName, devStatus sql.NullString
		var devDataJSON []byte
		var devCreatedAt, devUpdatedAt sql.NullTime

		var areaSlug, areaName, areaCity, areaStatus sql.NullString
		var areaDataJSON []byte
		var areaLat, areaLng sql.NullFloat64
		var areaCreatedAt, areaUpdatedAt sql.NullTime

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID, &developerID, &areaID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceCurrency, &lot.PriceAmount, &bonusKeys, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt,
			&projSlug, &projName, &projSale, &projStatus, &projLat, &projLng, &projDataJSON, &projCreatedAt, &projUpdatedAt,
			&devSlug, &devName, &devStatus, &devDataJSON, &devCreatedAt, &devUpdatedAt,
			&areaSlug, &areaName, &areaCity, &areaStatus, &areaLat, &areaLng, &areaDataJSON, &areaCreatedAt, &areaUpdatedAt,
		); err != nil {
			return nil, 0, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
		}
		if developerID.Valid {
			id := uuid.MustParse(developerID.String)
			lot.DeveloperID = &id
		}
		if areaID.Valid {
			id := uuid.MustParse(areaID.String)
			lot.AreaID = &id
		}
		if bedrooms.Valid {
			b := int(bedrooms.Int64)
			lot.Bedrooms = &b
		}
		if bathrooms.Valid {
			b := int(bathrooms.Int64)
			lot.Bathrooms = &b
		}
		if areaSqm.Valid {
			lot.AreaSqm = &areaSqm.Float64
		}
		if floor.Valid {
			f := int(floor.Int64)
			lot.Floor = &f
		}
		lot.BonusKeys = []string(bonusKeys)

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				return nil, 0, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		// Заполняем вложенный проект, если данные есть
		if projSlug.Valid {
			projID := uuid.MustParse(projectID.String)
			var projData domain.ProjectData
			if len(projDataJSON) > 0 {
				if err := json.Unmarshal(projDataJSON, &projData); err == nil {
					// ignore unmarshal errors for now
				}
			}
			lot.Project = &domain.Project{
				ID:          projID,
				Slug:        projSlug.String,
				Name:        projName.String,
				Status:      domain.ProjectStatus(projStatus.String),
				Data:        projData,
				CreatedAt:   projCreatedAt.Time,
				UpdatedAt:   projUpdatedAt.Time,
			}
			if projSale.Valid {
				lot.Project.Sale = projSale.String
			}
			if developerID.Valid {
				devID := uuid.MustParse(developerID.String)
				lot.Project.DeveloperID = &devID
			}
			if areaID.Valid {
				areaIDParsed := uuid.MustParse(areaID.String)
				lot.Project.AreaID = &areaIDParsed
			}
			if projLat.Valid {
				lot.Project.Lat = &projLat.Float64
			}
			if projLng.Valid {
				lot.Project.Lng = &projLng.Float64
			}
		}

		// Заполняем вложенного разработчика, если данные есть
		if devSlug.Valid {
			devID := uuid.MustParse(developerID.String)
			var devData map[string]interface{}
			if len(devDataJSON) > 0 {
				if err := json.Unmarshal(devDataJSON, &devData); err == nil {
					// ignore unmarshal errors for now
				}
			}
			lot.Developer = &domain.Developer{
				ID:          devID,
				Slug:        devSlug.String,
				Name:        devName.String,
				Status:      domain.DeveloperStatus(devStatus.String),
				Data:        devData,
				CreatedAt:   devCreatedAt.Time,
				UpdatedAt:   devUpdatedAt.Time,
			}
		}

		// Заполняем вложенный район, если данные есть
		if areaSlug.Valid {
			areaIDParsed := uuid.MustParse(areaID.String)
			var aData domain.AreaData
			if len(areaDataJSON) > 0 {
				if err := json.Unmarshal(areaDataJSON, &aData); err == nil {
					// ignore unmarshal errors for now
				}
			}
			lot.Area = &domain.Area{
				ID:          areaIDParsed,
				Slug:        areaSlug.String,
				Name:        areaName.String,
				City:        areaCity.String,
				Status:      domain.AreaStatus(areaStatus.String),
				Data:        aData,
				CreatedAt:   areaCreatedAt.Time,
				UpdatedAt:   areaUpdatedAt.Time,
			}
			if areaLat.Valid {
				lot.Area.Lat = areaLat.Float64
			}
			if areaLng.Valid {
				lot.Area.Lng = areaLng.Float64
			}
		}

		lots = append(lots, lot)
	}

	return lots, total, rows.Err()
}

func (r *LotRepo) Create(lot *domain.Lot) error {
	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		return err
	}

	var projectID, developerID, areaID sql.NullString
	if lot.ProjectID != nil {
		projectID = sql.NullString{String: lot.ProjectID.String(), Valid: true}
	}
	if lot.DeveloperID != nil {
		developerID = sql.NullString{String: lot.DeveloperID.String(), Valid: true}
	}
	if lot.AreaID != nil {
		areaID = sql.NullString{String: lot.AreaID.String(), Valid: true}
	}

	var bedrooms, bathrooms, floor sql.NullInt64
	if lot.Bedrooms != nil {
		bedrooms = sql.NullInt64{Int64: int64(*lot.Bedrooms), Valid: true}
	}
	if lot.Bathrooms != nil {
		bathrooms = sql.NullInt64{Int64: int64(*lot.Bathrooms), Valid: true}
	}
	if lot.Floor != nil {
		floor = sql.NullInt64{Int64: int64(*lot.Floor), Valid: true}
	}

	var areaSqm sql.NullFloat64
	if lot.AreaSqm != nil {
		areaSqm = sql.NullFloat64{Float64: *lot.AreaSqm, Valid: true}
	}

	err = r.db.QueryRow(`
		INSERT INTO lots (status, project_id, developer_id, area_id, type, bedrooms, bathrooms, area_sqm, floor, price_currency, price_amount, bonus_keys, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	`, lot.Status, projectID, developerID, areaID, lot.Type, bedrooms, bathrooms, areaSqm, floor, lot.PriceCurrency, lot.PriceAmount, pq.Array(lot.BonusKeys), dataJSON).Scan(
		&lot.ID, &lot.CreatedAt, &lot.UpdatedAt,
	)

	return err
}

func (r *LotRepo) Update(id uuid.UUID, lot *domain.Lot) error {
	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		return err
	}

	var projectID, developerID, areaID sql.NullString
	if lot.ProjectID != nil {
		projectID = sql.NullString{String: lot.ProjectID.String(), Valid: true}
	}
	if lot.DeveloperID != nil {
		developerID = sql.NullString{String: lot.DeveloperID.String(), Valid: true}
	}
	if lot.AreaID != nil {
		areaID = sql.NullString{String: lot.AreaID.String(), Valid: true}
	}

	var bedrooms, bathrooms, floor sql.NullInt64
	if lot.Bedrooms != nil {
		bedrooms = sql.NullInt64{Int64: int64(*lot.Bedrooms), Valid: true}
	}
	if lot.Bathrooms != nil {
		bathrooms = sql.NullInt64{Int64: int64(*lot.Bathrooms), Valid: true}
	}
	if lot.Floor != nil {
		floor = sql.NullInt64{Int64: int64(*lot.Floor), Valid: true}
	}

	var areaSqm sql.NullFloat64
	if lot.AreaSqm != nil {
		areaSqm = sql.NullFloat64{Float64: *lot.AreaSqm, Valid: true}
	}

	err = r.db.QueryRow(`
		UPDATE lots
		SET status = $1, project_id = $2, developer_id = $3, area_id = $4, type = $5, bedrooms = $6, bathrooms = $7, area_sqm = $8, floor = $9, price_currency = $10, price_amount = $11, bonus_keys = $12, data = $13, updated_at = NOW()
		WHERE id = $14 AND deleted_at IS NULL
		RETURNING updated_at
	`, lot.Status, projectID, developerID, areaID, lot.Type, bedrooms, bathrooms, areaSqm, floor, lot.PriceCurrency, lot.PriceAmount, pq.Array(lot.BonusKeys), dataJSON, id).Scan(&lot.UpdatedAt)

	return err
}

func (r *LotRepo) GetByProjectID(projectID uuid.UUID, limit int) ([]domain.Lot, error) {
	if limit <= 0 {
		return []domain.Lot{}, nil
	}

	query := `
		SELECT id, status, project_id, developer_id, area_id, type, bedrooms, bathrooms,
		       area_sqm, floor, price_currency, price_amount, bonus_keys, data, created_at, updated_at
		FROM lots
		WHERE project_id = $1 AND status = 'active'
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID, developerID, areaID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm sql.NullFloat64
		var bonusKeys pq.StringArray

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID, &developerID, &areaID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceCurrency, &lot.PriceAmount, &bonusKeys, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
		}
		if developerID.Valid {
			id := uuid.MustParse(developerID.String)
			lot.DeveloperID = &id
		}
		if areaID.Valid {
			id := uuid.MustParse(areaID.String)
			lot.AreaID = &id
		}
		if bedrooms.Valid {
			b := int(bedrooms.Int64)
			lot.Bedrooms = &b
		}
		if bathrooms.Valid {
			b := int(bathrooms.Int64)
			lot.Bathrooms = &b
		}
		if areaSqm.Valid {
			lot.AreaSqm = &areaSqm.Float64
		}
		if floor.Valid {
			f := int(floor.Int64)
			lot.Floor = &f
		}
		lot.BonusKeys = []string(bonusKeys)

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				return nil, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		lots = append(lots, lot)
	}

	return lots, rows.Err()
}

func (r *LotRepo) Delete(id uuid.UUID) error {
	_, err := r.db.Exec(`
		UPDATE lots
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	return err
}
