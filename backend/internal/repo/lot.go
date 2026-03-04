package repo

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LotRepo struct {
	queries *sqlcgen.Queries
	pool    *pgxpool.Pool
	logger  *slog.Logger
}

func NewLotRepo(pool *pgxpool.Pool) *LotRepo {
	return &LotRepo{
		queries: sqlcgen.New(pool),
		pool:    pool,
		logger:  slog.Default(),
	}
}

type LotFilters struct {
	AreaSlug       *string
	ProjectSlug    *string
	Type           *domain.LotType
	Bedrooms       []int
	BedroomsGte    *int // >= filter for "7+"
	Bathrooms      []int
	BathroomsGte   *int // >= filter for "7+"
	PriceMin       *float64
	PriceMax       *float64
	AreaMin        *float64
	AreaMax        *float64
	BonusKey       *string
	Status         domain.LotStatus
}

type LotSort string

const (
	LotSortPriceAsc  LotSort = "price_asc"
	LotSortPriceDesc LotSort = "price_desc"
	LotSortAreaDesc  LotSort = "area_desc"
	LotSortNewest    LotSort = "newest"
)

func (r *LotRepo) GetByID(id uuid.UUID) (*domain.Lot, error) {
	r.logger.Info("lot_repo_get_by_id_started", "lot_id", id)

	row, err := r.queries.GetLotByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("lot_repo_get_by_id_not_found", "lot_id", id)
			return nil, nil
		}
		r.logger.Error("lot_repo_get_by_id_failed", "lot_id", id, "error", err.Error())
		return nil, err
	}

	lot, err := sqlcLotRowToDomain(
		row.ID, row.Status, row.ProjectID, row.Type,
		row.Bedrooms, row.Bathrooms, row.AreaSqft, row.Floor,
		row.PriceFromUs, row.PriceFromDeveloper, row.Roi,
		row.BonusKeys, row.BadgeIds, row.Data,
		row.CreatedAt, row.UpdatedAt, row.DeletedAt,
	)
	if err != nil {
		r.logger.Error("lot_repo_get_by_id_unmarshal_failed", "lot_id", id, "error", err.Error())
		return nil, err
	}

	// Populate nested project from JOIN
	if row.Slug.Valid {
		lot.Project = &domain.Project{
			Slug:        row.Slug.String,
			Name:        textToString(row.Name),
			Sale:        textToString(row.Sale),
			Status:      domain.ProjectStatus(textToString(row.Status_2)),
			IsFeatured:  pgBoolToBool(row.IsFeatured),
			PaymentPlan: textToString(row.PaymentPlan),
			Lat:         numericToFloat64Ptr(row.Lat),
			Lng:         numericToFloat64Ptr(row.Lng),
			CreatedAt:   tstzToTime(row.CreatedAt_2),
			UpdatedAt:   tstzToTime(row.UpdatedAt_2),
		}
		if lot.ProjectID != nil {
			lot.Project.ID = *lot.ProjectID
		}
		if len(row.Media) > 0 {
			lot.Project.Media = &domain.Media{}
			json.Unmarshal(row.Media, lot.Project.Media)
		}
	}

	// Populate nested developer from JOIN
	if row.Slug_2.Valid {
		lot.Developer = &domain.Developer{
			Slug:      row.Slug_2.String,
			Name:      textToString(row.Name_2),
			CreatedAt: tstzToTime(row.CreatedAt_3),
			UpdatedAt: tstzToTime(row.UpdatedAt_3),
		}
	}

	// Populate nested area from JOIN
	if row.Slug_3.Valid {
		lot.Area = &domain.Area{
			Slug:      row.Slug_3.String,
			Name:      textToString(row.Name_3),
			CreatedAt: tstzToTime(row.CreatedAt_4),
			UpdatedAt: tstzToTime(row.UpdatedAt_4),
		}
	}

	r.logger.Info("lot_repo_get_by_id_completed", "lot_id", id)
	return lot, nil
}

func (r *LotRepo) List(filters LotFilters, sort LotSort, limit, offset int) ([]domain.Lot, int, error) {
	r.logger.Info("lot_repo_list_started", "limit", limit, "offset", offset, "sort", sort)

	query := `SELECT
			l.id, l.status, l.project_id, l.type, l.bedrooms, l.bathrooms,
			l.area_sqft, l.floor, l.price_from_us, l.price_from_developer, l.roi, l.bonus_keys, l.badge_ids, l.data, l.created_at, l.updated_at,
			p.slug, p.name, p.sale, p.status, p.lat, p.lng, p.media, p.is_featured, p.created_at, p.updated_at
		FROM lots l
		LEFT JOIN projects p ON l.project_id = p.id
		WHERE 1=1`
	countQuery := `SELECT COUNT(*) FROM lots l WHERE 1=1`
	args := []any{}
	argPos := 1

	// Always exclude soft-deleted lots
	query += ` AND l.deleted_at IS NULL`
	countQuery += ` AND l.deleted_at IS NULL`

	if filters.Status != "" {
		query += fmt.Sprintf(` AND l.status = $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.status = $%d`, argPos)
		args = append(args, filters.Status)
		argPos++
	} else {
		query += ` AND l.status = 'active'`
		countQuery += ` AND l.status = 'active'`
	}

	if filters.AreaSlug != nil {
		query += fmt.Sprintf(` AND l.project_id IN (SELECT pr.id FROM projects pr JOIN areas ar ON pr.area_id = ar.id WHERE ar.slug = $%d)`, argPos)
		countQuery += fmt.Sprintf(` AND l.project_id IN (SELECT pr.id FROM projects pr JOIN areas ar ON pr.area_id = ar.id WHERE ar.slug = $%d)`, argPos)
		args = append(args, *filters.AreaSlug)
		argPos++
	}

	if filters.ProjectSlug != nil {
		query += fmt.Sprintf(` AND l.project_id IN (SELECT id FROM projects WHERE slug = $%d)`, argPos)
		countQuery += fmt.Sprintf(` AND l.project_id IN (SELECT id FROM projects WHERE slug = $%d)`, argPos)
		args = append(args, *filters.ProjectSlug)
		argPos++
	}

	if filters.Type != nil {
		query += fmt.Sprintf(` AND l.type = $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.type = $%d`, argPos)
		args = append(args, *filters.Type)
		argPos++
	}

	if len(filters.Bedrooms) > 0 {
		placeholders := make([]string, len(filters.Bedrooms))
		for i, bed := range filters.Bedrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bed)
			argPos++
		}
		inClause := strings.Join(placeholders, ", ")
		if filters.BedroomsGte != nil {
			query += fmt.Sprintf(` AND (l.bedrooms IN (%s) OR l.bedrooms >= $%d)`, inClause, argPos)
			countQuery += fmt.Sprintf(` AND (l.bedrooms IN (%s) OR l.bedrooms >= $%d)`, inClause, argPos)
			args = append(args, *filters.BedroomsGte)
			argPos++
		} else {
			query += fmt.Sprintf(` AND l.bedrooms IN (%s)`, inClause)
			countQuery += fmt.Sprintf(` AND l.bedrooms IN (%s)`, inClause)
		}
	} else if filters.BedroomsGte != nil {
		query += fmt.Sprintf(` AND l.bedrooms >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.bedrooms >= $%d`, argPos)
		args = append(args, *filters.BedroomsGte)
		argPos++
	}

	if len(filters.Bathrooms) > 0 {
		placeholders := make([]string, len(filters.Bathrooms))
		for i, bath := range filters.Bathrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bath)
			argPos++
		}
		inClause := strings.Join(placeholders, ", ")
		if filters.BathroomsGte != nil {
			query += fmt.Sprintf(` AND (l.bathrooms IN (%s) OR l.bathrooms >= $%d)`, inClause, argPos)
			countQuery += fmt.Sprintf(` AND (l.bathrooms IN (%s) OR l.bathrooms >= $%d)`, inClause, argPos)
			args = append(args, *filters.BathroomsGte)
			argPos++
		} else {
			query += fmt.Sprintf(` AND l.bathrooms IN (%s)`, inClause)
			countQuery += fmt.Sprintf(` AND l.bathrooms IN (%s)`, inClause)
		}
	} else if filters.BathroomsGte != nil {
		query += fmt.Sprintf(` AND l.bathrooms >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.bathrooms >= $%d`, argPos)
		args = append(args, *filters.BathroomsGte)
		argPos++
	}

	if filters.PriceMin != nil {
		query += fmt.Sprintf(` AND l.price_from_us >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.price_from_us >= $%d`, argPos)
		args = append(args, *filters.PriceMin)
		argPos++
	}

	if filters.PriceMax != nil {
		query += fmt.Sprintf(` AND l.price_from_us <= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.price_from_us <= $%d`, argPos)
		args = append(args, *filters.PriceMax)
		argPos++
	}

	if filters.AreaMin != nil {
		query += fmt.Sprintf(` AND l.area_sqft >= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.area_sqft >= $%d`, argPos)
		args = append(args, *filters.AreaMin)
		argPos++
	}

	if filters.AreaMax != nil {
		query += fmt.Sprintf(` AND l.area_sqft <= $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.area_sqft <= $%d`, argPos)
		args = append(args, *filters.AreaMax)
		argPos++
	}

	if filters.BonusKey != nil {
		query += fmt.Sprintf(` AND l.bonus_keys @> $%d`, argPos)
		countQuery += fmt.Sprintf(` AND l.bonus_keys @> $%d`, argPos)
		args = append(args, []string{*filters.BonusKey})
		argPos++
	}

	switch sort {
	case LotSortPriceAsc:
		query += ` ORDER BY l.price_from_us ASC`
	case LotSortPriceDesc:
		query += ` ORDER BY l.price_from_us DESC`
	case LotSortAreaDesc:
		query += ` ORDER BY l.area_sqft DESC NULLS LAST`
	case LotSortNewest:
		query += ` ORDER BY l.created_at DESC`
	default:
		query += ` ORDER BY l.created_at DESC`
	}

	query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argPos, argPos+1)
	args = append(args, limit, offset)

	// Count query (uses args without limit/offset)
	var total int
	if err := r.pool.QueryRow(context.Background(), countQuery, args[:len(args)-2]...).Scan(&total); err != nil {
		r.logger.Error("lot_repo_list_count_query_failed", "error", err.Error())
		return nil, 0, err
	}

	rows, err := r.pool.Query(context.Background(), query, args...)
	if err != nil {
		r.logger.Error("lot_repo_list_query_failed", "error", err.Error())
		return nil, 0, err
	}
	defer rows.Close()

	lots := []domain.Lot{}
	for rows.Next() {
		var (
			lotID                                uuid.UUID
			lotStatus                            string
			projectID                            uuid.NullUUID
			lotType                              string
			bedrooms, bathrooms, floor           pgtype.Int4
			areaSqft                              pgtype.Numeric
			priceFromUs, priceFromDeveloper, roi pgtype.Numeric
			bonusKeys                            []string
			badgeIDs                             []uuid.UUID
			dataJSON                             []byte
			createdAt, updatedAt                 pgtype.Timestamptz
			// Project join fields
			projSlug, projName, projSale, projStatus pgtype.Text
			projLat, projLng                         pgtype.Numeric
			projMediaJSON                            []byte
			projIsFeatured                           pgtype.Bool
			projCreatedAt, projUpdatedAt             pgtype.Timestamptz
		)

		if err := rows.Scan(
			&lotID, &lotStatus, &projectID,
			&lotType, &bedrooms, &bathrooms, &areaSqft, &floor,
			&priceFromUs, &priceFromDeveloper, &roi, &bonusKeys, &badgeIDs, &dataJSON,
			&createdAt, &updatedAt,
			&projSlug, &projName, &projSale, &projStatus, &projLat, &projLng, &projMediaJSON, &projIsFeatured, &projCreatedAt, &projUpdatedAt,
		); err != nil {
			return nil, 0, err
		}

		lot, err := sqlcLotRowToDomain(
			lotID, lotStatus, projectID, lotType,
			bedrooms, bathrooms, areaSqft, floor,
			priceFromUs, priceFromDeveloper, roi,
			bonusKeys, badgeIDs, dataJSON,
			createdAt, updatedAt, pgtype.Timestamptz{},
		)
		if err != nil {
			r.logger.Error("lot_repo_list_unmarshal_failed", "lot_id", lotID, "error", err.Error())
			return nil, 0, err
		}

		// Populate nested project from JOIN
		if projSlug.Valid {
			lot.Project = &domain.Project{
				Slug:       projSlug.String,
				Name:       textToString(projName),
				Sale:       textToString(projSale),
				Status:     domain.ProjectStatus(textToString(projStatus)),
				IsFeatured: pgBoolToBool(projIsFeatured),
				Lat:        numericToFloat64Ptr(projLat),
				Lng:        numericToFloat64Ptr(projLng),
				CreatedAt:  tstzToTime(projCreatedAt),
				UpdatedAt:  tstzToTime(projUpdatedAt),
			}
			if lot.ProjectID != nil {
				lot.Project.ID = *lot.ProjectID
			}
			if len(projMediaJSON) > 0 {
				lot.Project.Media = &domain.Media{}
				json.Unmarshal(projMediaJSON, lot.Project.Media)
			}
		}

		lots = append(lots, *lot)
	}

	if err := rows.Err(); err != nil {
		r.logger.Error("lot_repo_list_rows_error", "error", err.Error())
		return nil, 0, err
	}

	r.logger.Info("lot_repo_list_completed", "count", len(lots), "total", total)
	return lots, total, nil
}

func (r *LotRepo) Create(lot *domain.Lot) error {
	r.logger.Info("lot_repo_create_started", "lot_type", lot.Type)

	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		r.logger.Error("lot_repo_create_marshal_failed", "lot_type", lot.Type, "error", err.Error())
		return err
	}

	row, err := r.queries.CreateLot(context.Background(), sqlcgen.CreateLotParams{
		Status:             string(lot.Status),
		ProjectID:          uuidPtrToNullUUID(lot.ProjectID),
		Type:               string(lot.Type),
		Bedrooms:           intPtrToInt4(lot.Bedrooms),
		Bathrooms:          intPtrToInt4(lot.Bathrooms),
		AreaSqft:            float64PtrToNumeric(lot.AreaSqft),
		Floor:              intPtrToInt4(lot.Floor),
		PriceFromUs:        float64ToNumeric(lot.PriceFromUs),
		PriceFromDeveloper: float64PtrToNumeric(lot.PriceFromDeveloper),
		Roi:                float64PtrToNumeric(lot.ROI),
		BonusKeys:          lot.BonusKeys,
		BadgeIds:           lot.BadgeIDs,
		Data:               dataJSON,
	})
	if err != nil {
		r.logger.Error("lot_repo_create_failed", "lot_type", lot.Type, "error", err.Error())
		return err
	}

	lot.ID = row.ID
	lot.CreatedAt = tstzToTime(row.CreatedAt)
	lot.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("lot_repo_create_completed", "lot_id", lot.ID, "lot_type", lot.Type)
	return nil
}

func (r *LotRepo) Update(id uuid.UUID, lot *domain.Lot) error {
	r.logger.Info("lot_repo_update_started", "lot_id", id)

	dataJSON, err := json.Marshal(lot.Data)
	if err != nil {
		r.logger.Error("lot_repo_update_marshal_failed", "lot_id", id, "error", err.Error())
		return err
	}

	updatedAt, err := r.queries.UpdateLot(context.Background(), sqlcgen.UpdateLotParams{
		Status:             string(lot.Status),
		ProjectID:          uuidPtrToNullUUID(lot.ProjectID),
		Type:               string(lot.Type),
		Bedrooms:           intPtrToInt4(lot.Bedrooms),
		Bathrooms:          intPtrToInt4(lot.Bathrooms),
		AreaSqft:            float64PtrToNumeric(lot.AreaSqft),
		Floor:              intPtrToInt4(lot.Floor),
		PriceFromUs:        float64ToNumeric(lot.PriceFromUs),
		PriceFromDeveloper: float64PtrToNumeric(lot.PriceFromDeveloper),
		Roi:                float64PtrToNumeric(lot.ROI),
		BonusKeys:          lot.BonusKeys,
		BadgeIds:           lot.BadgeIDs,
		Data:               dataJSON,
		ID:                 id,
	})
	if err != nil {
		r.logger.Error("lot_repo_update_failed", "lot_id", id, "error", err.Error())
		return err
	}

	lot.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("lot_repo_update_completed", "lot_id", id)
	return nil
}

func (r *LotRepo) GetByProjectID(projectID uuid.UUID, limit int) ([]domain.Lot, error) {
	r.logger.Info("lot_repo_get_by_project_id_started", "project_id", projectID, "limit", limit)

	if limit <= 0 {
		r.logger.Info("lot_repo_get_by_project_id_invalid_limit", "project_id", projectID, "limit", limit)
		return []domain.Lot{}, nil
	}

	rows, err := r.queries.GetLotsByProjectID(context.Background(), sqlcgen.GetLotsByProjectIDParams{
		ProjectID: uuid.NullUUID{UUID: projectID, Valid: true},
		Limit:     int32(limit),
	})
	if err != nil {
		r.logger.Error("lot_repo_get_by_project_id_query_failed", "project_id", projectID, "limit", limit, "error", err.Error())
		return nil, err
	}

	lots := make([]domain.Lot, 0, len(rows))
	for _, row := range rows {
		lot, err := sqlcLotRowToDomain(
			row.ID, row.Status, row.ProjectID, row.Type,
			row.Bedrooms, row.Bathrooms, row.AreaSqft, row.Floor,
			row.PriceFromUs, row.PriceFromDeveloper, row.Roi,
			row.BonusKeys, row.BadgeIds, row.Data,
			row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{},
		)
		if err != nil {
			r.logger.Error("lot_repo_get_by_project_id_unmarshal_failed", "lot_id", row.ID, "error", err.Error())
			return nil, err
		}
		lots = append(lots, *lot)
	}

	r.logger.Info("lot_repo_get_by_project_id_completed", "project_id", projectID, "count", len(lots))
	return lots, nil
}

func (r *LotRepo) Delete(id uuid.UUID) error {
	r.logger.Info("lot_repo_delete_started", "lot_id", id)

	if err := r.queries.DeleteLot(context.Background(), id); err != nil {
		r.logger.Error("lot_repo_delete_failed", "lot_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lot_repo_delete_completed", "lot_id", id)
	return nil
}

func (r *LotRepo) ListAll() ([]domain.Lot, error) {
	r.logger.Info("lot_repo_list_all_started")

	rows, err := r.queries.ListAllLots(context.Background())
	if err != nil {
		r.logger.Error("lot_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	lots := make([]domain.Lot, 0, len(rows))
	for _, row := range rows {
		lot, err := sqlcLotRowToDomain(
			row.ID, row.Status, row.ProjectID, row.Type,
			row.Bedrooms, row.Bathrooms, row.AreaSqft, row.Floor,
			row.PriceFromUs, row.PriceFromDeveloper, row.Roi,
			row.BonusKeys, row.BadgeIds, row.Data,
			row.CreatedAt, row.UpdatedAt, row.DeletedAt,
		)
		if err != nil {
			return nil, err
		}
		lots = append(lots, *lot)
	}

	r.logger.Info("lot_repo_list_all_completed", "count", len(lots))
	return lots, nil
}

func (r *LotRepo) ListDeleted() ([]domain.Lot, error) {
	r.logger.Info("lot_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedLots(context.Background())
	if err != nil {
		r.logger.Error("lot_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	lots := make([]domain.Lot, 0, len(rows))
	for _, row := range rows {
		lot, err := sqlcLotRowToDomain(
			row.ID, row.Status, row.ProjectID, row.Type,
			row.Bedrooms, row.Bathrooms, row.AreaSqft, row.Floor,
			row.PriceFromUs, row.PriceFromDeveloper, row.Roi,
			row.BonusKeys, row.BadgeIds, row.Data,
			row.CreatedAt, row.UpdatedAt, row.DeletedAt,
		)
		if err != nil {
			r.logger.Error("lot_repo_list_deleted_unmarshal_failed", "lot_id", row.ID, "error", err.Error())
			return nil, err
		}
		lots = append(lots, *lot)
	}

	r.logger.Info("lot_repo_list_deleted_completed", "count", len(lots))
	return lots, nil
}

func (r *LotRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Lot, error) {
	row, err := r.queries.GetLotByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	lot, err := sqlcLotRowToDomain(
		row.ID, row.Status, row.ProjectID, row.Type,
		row.Bedrooms, row.Bathrooms, row.AreaSqft, row.Floor,
		row.PriceFromUs, row.PriceFromDeveloper, row.Roi,
		row.BonusKeys, row.BadgeIds, row.Data,
		row.CreatedAt, row.UpdatedAt, row.DeletedAt,
	)
	if err != nil {
		return nil, err
	}

	return lot, nil
}

func (r *LotRepo) Restore(id uuid.UUID) error {
	r.logger.Info("lot_repo_restore_started", "lot_id", id)

	if err := r.queries.RestoreLot(context.Background(), id); err != nil {
		r.logger.Error("lot_repo_restore_failed", "lot_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lot_repo_restore_completed", "lot_id", id)
	return nil
}

func (r *LotRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("lot_repo_hard_delete_started", "lot_id", id)

	if err := r.queries.HardDeleteLot(context.Background(), id); err != nil {
		r.logger.Error("lot_repo_hard_delete_failed", "lot_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("lot_repo_hard_delete_completed", "lot_id", id)
	return nil
}

// sqlcLotRowToDomain converts sqlc lot row fields to domain.Lot.
func sqlcLotRowToDomain(
	id uuid.UUID, status string, projectID uuid.NullUUID, typ string,
	bedrooms, bathrooms pgtype.Int4, areaSqft pgtype.Numeric, floor pgtype.Int4,
	priceFromUs, priceFromDeveloper, roi pgtype.Numeric,
	bonusKeys []string, badgeIDs []uuid.UUID, data []byte,
	createdAt, updatedAt, deletedAt pgtype.Timestamptz,
) (*domain.Lot, error) {
	lot := &domain.Lot{
		ID:                 id,
		Status:             domain.LotStatus(status),
		ProjectID:          nullUUIDToPtr(projectID),
		Type:               domain.LotType(typ),
		Bedrooms:           int4ToIntPtr(bedrooms),
		Bathrooms:          int4ToIntPtr(bathrooms),
		AreaSqft:            numericToFloat64Ptr(areaSqft),
		Floor:              int4ToIntPtr(floor),
		PriceFromUs:        numericToFloat64(priceFromUs),
		PriceFromDeveloper: numericToFloat64Ptr(priceFromDeveloper),
		ROI:                numericToFloat64Ptr(roi),
		BonusKeys:          bonusKeys,
		BadgeIDs:           badgeIDs,
		CreatedAt:          tstzToTime(createdAt),
		UpdatedAt:          tstzToTime(updatedAt),
		DeletedAt:          tstzToTimePtr(deletedAt),
	}

	if lot.BonusKeys == nil {
		lot.BonusKeys = []string{}
	}
	if lot.BadgeIDs == nil {
		lot.BadgeIDs = []uuid.UUID{}
	}

	if len(data) > 0 {
		if err := json.Unmarshal(data, &lot.Data); err != nil {
			return nil, err
		}
	} else {
		lot.Data = domain.LotData{}
	}

	return lot, nil
}
