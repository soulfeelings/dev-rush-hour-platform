package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"strings"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type LotRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewLotRepo(db *sql.DB) *LotRepo {
	return &LotRepo{
		db:     db,
		logger: slog.Default(),
	}
}

type LotFilters struct {
	AreaSlug    *string
	ProjectSlug *string
	Type        *domain.LotType
	Bedrooms    []int // Array for multi-select (e.g., [1, 2, 3])
	Bathrooms   []int // Array for multi-select
	PriceMin    *float64
	PriceMax    *float64
	AreaMin     *float64
	AreaMax     *float64
	BonusKey    *string
	Status      domain.LotStatus
}

type LotSort string

const (
	LotSortPriceAsc  LotSort = "price_asc"
	LotSortPriceDesc LotSort = "price_desc"
	LotSortAreaDesc  LotSort = "area_desc"
	LotSortNewest    LotSort = "newest"
)

func (r *LotRepo) GetByID(id uuid.UUID) (*domain.Lot, error) {
	r.logger.Info("lot_repo_get_by_id_started",
		"lot_id", id,
	)

	var lot domain.Lot
	var dataJSON []byte
	var projectID sql.NullString
	var bedrooms, bathrooms, floor sql.NullInt64
	var areaSqm, developerPrice, roi sql.NullFloat64
	var bonusKeys pq.StringArray
	var badgeIDs pq.StringArray

	// Переменные для вложенных объектов
	var projSlug, projName, projSale, projStatus sql.NullString
	var projMediaJSON []byte
	var projIsFeatured sql.NullBool
	var projLat, projLng sql.NullFloat64
	var projCreatedAt, projUpdatedAt sql.NullTime

	err := r.db.QueryRow(`
		SELECT
			l.id, l.status, l.project_id, l.type, l.bedrooms, l.bathrooms,
			l.area_sqm, l.floor, l.price_amount, l.developer_price, l.roi, l.bonus_keys, l.badge_ids, l.data, l.created_at, l.updated_at, l.deleted_at,
			p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.media, p.is_featured, p.created_at, p.updated_at
		FROM lots l
		LEFT JOIN projects p ON l.project_id = p.id
		WHERE l.id = $1 AND l.deleted_at IS NULL
	`, id).Scan(
		&lot.ID, &lot.Status, &projectID,
		&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
		&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
		&lot.CreatedAt, &lot.UpdatedAt, &lot.DeletedAt,
		&projSlug, &projName, &projSale, &projStatus, &projLat, &projLng, &projMediaJSON, &projIsFeatured, &projCreatedAt, &projUpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("lot_repo_get_by_id_not_found",
				"lot_id", id,
			)
			return nil, nil
		}
		r.logger.Error("lot_repo_get_by_id_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	if projectID.Valid {
		id := uuid.MustParse(projectID.String)
		lot.ProjectID = &id
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
	if developerPrice.Valid {
		lot.DeveloperPrice = &developerPrice.Float64
	}
	if roi.Valid {
		lot.ROI = &roi.Float64
	}
	lot.BonusKeys = []string(bonusKeys)
	lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
			r.logger.Error("lot_repo_get_by_id_unmarshal_failed",
				"lot_id", id,
				"error", err.Error(),
			)
			return nil, err
		}
	} else {
		lot.Data = domain.LotData{}
	}

	// Заполняем вложенный проект, если данные есть
	if projSlug.Valid {
		projID := uuid.MustParse(projectID.String)
		lot.Project = &domain.Project{
			ID:        projID,
			Slug:      projSlug.String,
			Name:      projName.String,
			Status:    domain.ProjectStatus(projStatus.String),
			CreatedAt: projCreatedAt.Time,
			UpdatedAt: projUpdatedAt.Time,
		}
		if len(projMediaJSON) > 0 {
			lot.Project.Media = &domain.Media{}
			json.Unmarshal(projMediaJSON, lot.Project.Media)
		}
		if projIsFeatured.Valid {
			lot.Project.IsFeatured = projIsFeatured.Bool
		}
		if projSale.Valid {
			lot.Project.Sale = projSale.String
		}
		if projLat.Valid {
			lot.Project.Lat = &projLat.Float64
		}
		if projLng.Valid {
			lot.Project.Lng = &projLng.Float64
		}
	}

	r.logger.Info("lot_repo_get_by_id_completed",
		"lot_id", id,
	)

	return &lot, nil
}

func (r *LotRepo) List(filters LotFilters, sort LotSort, limit, offset int) ([]domain.Lot, int, error) {
	r.logger.Info("lot_repo_list_started",
		"limit", limit,
		"offset", offset,
		"sort", sort,
	)

	query := `SELECT
			l.id, l.status, l.project_id, l.type, l.bedrooms, l.bathrooms,
			l.area_sqm, l.floor, l.price_amount, l.developer_price, l.roi, l.bonus_keys, l.badge_ids, l.data, l.created_at, l.updated_at,
			p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.media, p.is_featured, p.created_at, p.updated_at
		FROM lots l
		LEFT JOIN projects p ON l.project_id = p.id
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

	// Filter by bedrooms - match if lot bedrooms is in the selected array
	if len(filters.Bedrooms) > 0 {
		placeholders := make([]string, len(filters.Bedrooms))
		for i, bed := range filters.Bedrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bed)
			argPos++
		}
		inClause := strings.Join(placeholders, ", ")
		query += fmt.Sprintf(` AND bedrooms IN (%s)`, inClause)
		countQuery += fmt.Sprintf(` AND bedrooms IN (%s)`, inClause)
	}

	// Filter by bathrooms - match if lot bathrooms is in the selected array
	if len(filters.Bathrooms) > 0 {
		placeholders := make([]string, len(filters.Bathrooms))
		for i, bath := range filters.Bathrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bath)
			argPos++
		}
		inClause := strings.Join(placeholders, ", ")
		query += fmt.Sprintf(` AND bathrooms IN (%s)`, inClause)
		countQuery += fmt.Sprintf(` AND bathrooms IN (%s)`, inClause)
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
		r.logger.Error("lot_repo_list_count_query_failed",
			"error", err.Error(),
		)
		return nil, 0, err
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		r.logger.Error("lot_repo_list_query_failed",
			"error", err.Error(),
		)
		return nil, 0, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm, developerPrice, roi sql.NullFloat64
		var bonusKeys pq.StringArray
		var badgeIDs pq.StringArray

		// Переменные для вложенных объектов
		var projSlug, projName, projSale, projStatus sql.NullString
		var projMediaJSON []byte
		var projIsFeatured sql.NullBool
		var projLat, projLng sql.NullFloat64
		var projCreatedAt, projUpdatedAt sql.NullTime

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt,
			&projSlug, &projName, &projSale, &projStatus, &projLat, &projLng, &projMediaJSON, &projIsFeatured, &projCreatedAt, &projUpdatedAt,
		); err != nil {
			return nil, 0, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
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
		if developerPrice.Valid {
			lot.DeveloperPrice = &developerPrice.Float64
		}
		if roi.Valid {
			lot.ROI = &roi.Float64
		}
		lot.BonusKeys = []string(bonusKeys)
		lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				r.logger.Error("lot_repo_list_unmarshal_failed",
					"lot_id", lot.ID,
					"error", err.Error(),
				)
				return nil, 0, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		// Заполняем вложенный проект, если данные есть
		if projSlug.Valid {
			projID := uuid.MustParse(projectID.String)
			lot.Project = &domain.Project{
				ID:        projID,
				Slug:      projSlug.String,
				Name:      projName.String,
				Status:    domain.ProjectStatus(projStatus.String),
				CreatedAt: projCreatedAt.Time,
				UpdatedAt: projUpdatedAt.Time,
			}
			if len(projMediaJSON) > 0 {
				lot.Project.Media = &domain.Media{}
				json.Unmarshal(projMediaJSON, lot.Project.Media)
			}
			if projIsFeatured.Valid {
				lot.Project.IsFeatured = projIsFeatured.Bool
			}
			if projSale.Valid {
				lot.Project.Sale = projSale.String
			}
			if projLat.Valid {
				lot.Project.Lat = &projLat.Float64
			}
			if projLng.Valid {
				lot.Project.Lng = &projLng.Float64
			}
		}

		lots = append(lots, lot)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("lot_repo_list_rows_error",
			"error", err.Error(),
		)
		return nil, 0, err
	}

	r.logger.Info("lot_repo_list_completed",
		"count", len(lots),
		"total", total,
	)

	return lots, total, nil
}

func (r *LotRepo) Create(lot *domain.Lot) error {
	r.logger.Info("lot_repo_create_started",
		"lot_type", lot.Type,
	)

	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		r.logger.Error("lot_repo_create_marshal_failed",
			"lot_type", lot.Type,
			"error", err.Error(),
		)
		return err
	}

	var projectID sql.NullString
	if lot.ProjectID != nil {
		projectID = sql.NullString{String: lot.ProjectID.String(), Valid: true}
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

	var areaSqm, developerPrice, roi sql.NullFloat64
	if lot.AreaSqm != nil {
		areaSqm = sql.NullFloat64{Float64: *lot.AreaSqm, Valid: true}
	}
	if lot.DeveloperPrice != nil {
		developerPrice = sql.NullFloat64{Float64: *lot.DeveloperPrice, Valid: true}
	}
	if lot.ROI != nil {
		roi = sql.NullFloat64{Float64: *lot.ROI, Valid: true}
	}

	err = r.db.QueryRow(`
		INSERT INTO lots (status, project_id, type, bedrooms, bathrooms, area_sqm, floor, price_amount, developer_price, roi, bonus_keys, badge_ids, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	`, lot.Status, projectID, lot.Type, bedrooms, bathrooms, areaSqm, floor, lot.PriceAmount, developerPrice, roi, pq.Array(lot.BonusKeys), pq.Array(uuidsToStrings(lot.BadgeIDs)), dataJSON).Scan(
		&lot.ID, &lot.CreatedAt, &lot.UpdatedAt,
	)

	if err != nil {
		r.logger.Error("lot_repo_create_failed",
			"lot_type", lot.Type,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("lot_repo_create_completed",
		"lot_id", lot.ID,
		"lot_type", lot.Type,
	)

	return nil
}

func (r *LotRepo) Update(id uuid.UUID, lot *domain.Lot) error {
	r.logger.Info("lot_repo_update_started",
		"lot_id", id,
	)

	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		r.logger.Error("lot_repo_update_marshal_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return err
	}

	var projectID sql.NullString
	if lot.ProjectID != nil {
		projectID = sql.NullString{String: lot.ProjectID.String(), Valid: true}
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

	var areaSqm, developerPrice, roi sql.NullFloat64
	if lot.AreaSqm != nil {
		areaSqm = sql.NullFloat64{Float64: *lot.AreaSqm, Valid: true}
	}
	if lot.DeveloperPrice != nil {
		developerPrice = sql.NullFloat64{Float64: *lot.DeveloperPrice, Valid: true}
	}
	if lot.ROI != nil {
		roi = sql.NullFloat64{Float64: *lot.ROI, Valid: true}
	}

	err = r.db.QueryRow(`
		UPDATE lots
		SET status = $1, project_id = $2, type = $3, bedrooms = $4, bathrooms = $5, area_sqm = $6, floor = $7, price_amount = $8, developer_price = $9, roi = $10, bonus_keys = $11, badge_ids = $12, data = $13, updated_at = NOW()
		WHERE id = $14 AND deleted_at IS NULL
		RETURNING updated_at
	`, lot.Status, projectID, lot.Type, bedrooms, bathrooms, areaSqm, floor, lot.PriceAmount, developerPrice, roi, pq.Array(lot.BonusKeys), pq.Array(uuidsToStrings(lot.BadgeIDs)), dataJSON, id).Scan(&lot.UpdatedAt)

	if err != nil {
		r.logger.Error("lot_repo_update_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("lot_repo_update_completed",
		"lot_id", id,
	)

	return nil
}

func (r *LotRepo) GetByProjectID(projectID uuid.UUID, limit int) ([]domain.Lot, error) {
	r.logger.Info("lot_repo_get_by_project_id_started",
		"project_id", projectID,
		"limit", limit,
	)

	if limit <= 0 {
		r.logger.Info("lot_repo_get_by_project_id_invalid_limit",
			"project_id", projectID,
			"limit", limit,
		)
		return []domain.Lot{}, nil
	}

	query := `
		SELECT id, status, project_id, type, bedrooms, bathrooms,
		       area_sqm, floor, price_amount, developer_price, roi, bonus_keys, badge_ids, data, created_at, updated_at
		FROM lots
		WHERE project_id = $1 AND status = 'active'
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, projectID, limit)
	if err != nil {
		r.logger.Error("lot_repo_get_by_project_id_query_failed",
			"project_id", projectID,
			"limit", limit,
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm, developerPrice, roi sql.NullFloat64
		var bonusKeys pq.StringArray
		var badgeIDs pq.StringArray

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
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
		if developerPrice.Valid {
			lot.DeveloperPrice = &developerPrice.Float64
		}
		if roi.Valid {
			lot.ROI = &roi.Float64
		}
		lot.BonusKeys = []string(bonusKeys)
		lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				r.logger.Error("lot_repo_get_by_project_id_unmarshal_failed",
					"lot_id", lot.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		lots = append(lots, lot)
	}

	err = rows.Err()
	if err != nil {
		r.logger.Error("lot_repo_get_by_project_id_rows_error",
			"project_id", projectID,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("lot_repo_get_by_project_id_completed",
		"project_id", projectID,
		"count", len(lots),
	)

	return lots, nil
}

func (r *LotRepo) Delete(id uuid.UUID) error {
	r.logger.Info("lot_repo_delete_started",
		"lot_id", id,
	)

	_, err := r.db.Exec(`
		UPDATE lots
		SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	if err != nil {
		r.logger.Error("lot_repo_delete_failed",
			"lot_id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("lot_repo_delete_completed",
		"lot_id", id,
	)

	return nil
}

func (r *LotRepo) ListAll() ([]domain.Lot, error) {
	r.logger.Info("lot_repo_list_all_started")

	rows, err := r.db.Query(`
		SELECT id, status, project_id, type, bedrooms, bathrooms,
		       area_sqm, floor, price_amount, developer_price, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
		FROM lots
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		r.logger.Error("lot_repo_list_all_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm, developerPrice, roi sql.NullFloat64
		var bonusKeys pq.StringArray
		var badgeIDs pq.StringArray

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt, &lot.DeletedAt,
		); err != nil {
			return nil, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
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
		if developerPrice.Valid {
			lot.DeveloperPrice = &developerPrice.Float64
		}
		if roi.Valid {
			lot.ROI = &roi.Float64
		}
		lot.BonusKeys = []string(bonusKeys)
		lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				return nil, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		lots = append(lots, lot)
	}

	r.logger.Info("lot_repo_list_all_completed",
		"count", len(lots),
	)

	return lots, nil
}

func (r *LotRepo) ListDeleted() ([]domain.Lot, error) {
	r.logger.Info("lot_repo_list_deleted_started")

	rows, err := r.db.Query(`
		SELECT id, status, project_id, type, bedrooms, bathrooms,
		       area_sqm, floor, price_amount, developer_price, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
		FROM lots
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC
	`)
	if err != nil {
		r.logger.Error("lot_repo_list_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var lot domain.Lot
		var dataJSON []byte
		var projectID sql.NullString
		var bedrooms, bathrooms, floor sql.NullInt64
		var areaSqm, developerPrice, roi sql.NullFloat64
		var bonusKeys pq.StringArray
		var badgeIDs pq.StringArray

		if err := rows.Scan(
			&lot.ID, &lot.Status, &projectID,
			&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
			&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
			&lot.CreatedAt, &lot.UpdatedAt, &lot.DeletedAt,
		); err != nil {
			r.logger.Error("lot_repo_list_deleted_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		if projectID.Valid {
			id := uuid.MustParse(projectID.String)
			lot.ProjectID = &id
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
		if developerPrice.Valid {
			lot.DeveloperPrice = &developerPrice.Float64
		}
		if roi.Valid {
			lot.ROI = &roi.Float64
		}
		lot.BonusKeys = []string(bonusKeys)
		lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

		if len(dataJSON) > 0 {
			if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
				r.logger.Error("lot_repo_list_deleted_unmarshal_failed",
					"lot_id", lot.ID,
					"error", err.Error(),
				)
				return nil, err
			}
		} else {
			lot.Data = domain.LotData{}
		}

		lots = append(lots, lot)
	}

	r.logger.Info("lot_repo_list_deleted_completed",
		"count", len(lots),
	)

	return lots, nil
}

func (r *LotRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Lot, error) {
	var lot domain.Lot
	var dataJSON []byte
	var projectID sql.NullString
	var bedrooms, bathrooms, floor sql.NullInt64
	var areaSqm, developerPrice, roi sql.NullFloat64
	var bonusKeys pq.StringArray
	var badgeIDs pq.StringArray

	err := r.db.QueryRow(`
		SELECT id, status, project_id, type, bedrooms, bathrooms,
		       area_sqm, floor, price_amount, developer_price, roi, bonus_keys, badge_ids, data, created_at, updated_at, deleted_at
		FROM lots
		WHERE id = $1
	`, id).Scan(
		&lot.ID, &lot.Status, &projectID,
		&lot.Type, &bedrooms, &bathrooms, &areaSqm, &floor,
		&lot.PriceAmount, &developerPrice, &roi, &bonusKeys, &badgeIDs, &dataJSON,
		&lot.CreatedAt, &lot.UpdatedAt, &lot.DeletedAt,
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
	if developerPrice.Valid {
		lot.DeveloperPrice = &developerPrice.Float64
	}
	if roi.Valid {
		lot.ROI = &roi.Float64
	}
	lot.BonusKeys = []string(bonusKeys)
	lot.BadgeIDs = parseUUIDs([]string(badgeIDs))

	if len(dataJSON) > 0 {
		if err := json.Unmarshal(dataJSON, &lot.Data); err != nil {
			return nil, err
		}
	} else {
		lot.Data = domain.LotData{}
	}

	return &lot, nil
}

func (r *LotRepo) Restore(id uuid.UUID) error {
	r.logger.Info("lot_repo_restore_started", "lot_id", id)

	_, err := r.db.Exec(`
		UPDATE lots
		SET deleted_at = NULL
		WHERE id = $1 AND deleted_at IS NOT NULL
	`, id)

	if err != nil {
		r.logger.Error("lot_repo_restore_failed", "lot_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lot_repo_restore_completed", "lot_id", id)
	return nil
}

func (r *LotRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("lot_repo_hard_delete_started", "lot_id", id)

	_, err := r.db.Exec(`DELETE FROM lots WHERE id = $1`, id)

	if err != nil {
		r.logger.Error("lot_repo_hard_delete_failed", "lot_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lot_repo_hard_delete_completed", "lot_id", id)
	return nil
}

func parseUUIDs(strs []string) []uuid.UUID {
	result := make([]uuid.UUID, 0, len(strs))
	for _, s := range strs {
		if id, err := uuid.Parse(s); err == nil {
			result = append(result, id)
		}
	}
	return result
}

func uuidsToStrings(ids []uuid.UUID) []string {
	result := make([]string, len(ids))
	for i, id := range ids {
		result[i] = id.String()
	}
	return result
}
