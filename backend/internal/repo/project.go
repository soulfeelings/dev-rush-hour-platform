package repo

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepo struct {
	queries *sqlcgen.Queries
	pool    *pgxpool.Pool
	logger  *slog.Logger
}

func NewProjectRepo(pool *pgxpool.Pool) *ProjectRepo {
	return &ProjectRepo{
		queries: sqlcgen.New(pool),
		pool:    pool,
		logger:  slog.Default(),
	}
}

func (r *ProjectRepo) GetBySlug(slug string) (*domain.Project, error) {
	r.logger.Info("project_repo_get_by_slug_started", "project_slug", slug)

	row, err := r.queries.GetProjectBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("project_repo_get_by_slug_not_found", "project_slug", slug)
			return nil, nil
		}
		r.logger.Error("project_repo_get_by_slug_failed", "project_slug", slug, "error", err.Error())
		return nil, err
	}

	project, err := sqlcProjectRowToDomain(
		row.ID, row.Slug, row.Name, row.Status, row.Sale,
		row.DeveloperID, row.AreaID, row.Lat, row.Lng,
		row.Description, row.Media, row.FeaturesAmenities, row.Tags,
		row.IsFeatured, row.YoutubeUrl,
		row.Roi, row.PriceFromUs, row.PriceFromDeveloper,
		row.PaymentPlan, row.CompletionDate,
		row.Currency, row.PropertyTypes, row.Bedrooms, row.Bathrooms,
		row.AreaSize, row.AreaUnit, row.PricesByType,
		row.TimelineAnnouncement, row.TimelineBookingStarted, row.TimelineConstructionStarted,
		row.TimelineConstructionProgress, row.TimelineConstructionProgressPct, row.TimelineExpectedCompletion,
		row.CreatedAt, row.UpdatedAt, pgtype.Timestamptz{},
	)
	if err != nil {
		r.logger.Error("project_repo_get_by_slug_unmarshal_failed", "project_slug", slug, "error", err.Error())
		return nil, err
	}

	// Populate developer info from JOIN
	if row.DevName.Valid {
		project.Developer = &domain.Developer{
			Name:    row.DevName.String,
			LogoURL: textToString(row.DevLogoUrl),
		}
	}

	// Populate area info from JOIN
	if row.AreaName.Valid {
		project.Area = &domain.Area{
			Name: row.AreaName.String,
			City: textToString(row.AreaCity),
		}
	}

	r.logger.Info("project_repo_get_by_slug_completed", "project_slug", slug, "project_id", project.ID)
	return project, nil
}

// projectListColumns is the aliased column list for the dynamic List query.
const projectListColumns = `p.id, p.slug, p.name, p.status, p.sale, p.developer_id, p.area_id, p.lat, p.lng,
	p.description, p.media, p.features_amenities, p.tags, p.is_featured, p.youtube_url,
	p.roi, p.price_from_us, p.price_from_developer, p.payment_plan, p.completion_date,
	p.currency, p.property_types, p.bedrooms, p.bathrooms, p.area_size, p.area_unit, p.prices_by_type,
	p.timeline_announcement, p.timeline_booking_started, p.timeline_construction_started,
	p.timeline_construction_progress, p.timeline_construction_progress_pct, p.timeline_expected_completion,
	p.created_at, p.updated_at`

func (r *ProjectRepo) List(filters domain.ProjectFilters, sort domain.ProjectSort) ([]domain.Project, error) {
	r.logger.Info("project_repo_list_started", "filters", filters, "sort", sort)

	query := `
		SELECT ` + projectListColumns + `,
		       d.name as dev_name, d.logo_url as dev_logo_url,
		       a.name as area_name, a.city as area_city
		FROM projects p
		LEFT JOIN developers d ON p.developer_id = d.id
		LEFT JOIN areas a ON p.area_id = a.id
		LEFT JOIN cities c ON a.city_id = c.id
	`
	args := []any{}
	argPos := 1
	whereClauses := []string{"p.status = 'active'", "p.deleted_at IS NULL"}

	if filters.CitySlug != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("c.slug = $%d", argPos))
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

	if filters.Status != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.sale = $%d", argPos))
		args = append(args, *filters.Status)
		argPos++
	}

	if len(filters.Bedrooms) > 0 {
		placeholders := make([]string, len(filters.Bedrooms))
		for i, bed := range filters.Bedrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, strconv.Itoa(bed))
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.bedrooms && ARRAY[%s]::text[]",
			strings.Join(placeholders, ", "),
		))
	}

	if len(filters.Bathrooms) > 0 {
		placeholders := make([]string, len(filters.Bathrooms))
		for i, bath := range filters.Bathrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, strconv.Itoa(bath))
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.bathrooms && ARRAY[%s]::text[]",
			strings.Join(placeholders, ", "),
		))
	}

	if filters.Search != nil && *filters.Search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(p.name) LIKE LOWER($%d)", argPos))
		args = append(args, "%"+*filters.Search+"%")
		argPos++
	}

	if filters.Featured != nil && *filters.Featured {
		whereClauses = append(whereClauses, "p.is_featured = true")
	}

	if filters.PriceMin != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.price_from_us IS NOT NULL AND p.price_from_us >= $%d", argPos))
		args = append(args, *filters.PriceMin)
		argPos++
	}

	if filters.PriceMax != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.price_from_us IS NOT NULL AND p.price_from_us <= $%d", argPos))
		args = append(args, *filters.PriceMax)
		argPos++
	}

	query += " WHERE " + strings.Join(whereClauses, " AND ")

	switch sort {
	case domain.ProjectSortPriceAsc:
		query += ` ORDER BY p.price_from_us ASC NULLS LAST`
	case domain.ProjectSortPriceDesc:
		query += ` ORDER BY p.price_from_us DESC NULLS LAST`
	case domain.ProjectSortNewest:
		query += ` ORDER BY p.created_at DESC`
	default:
		query += ` ORDER BY p.name`
	}

	rows, err := r.pool.Query(context.Background(), query, args...)
	if err != nil {
		r.logger.Error("project_repo_list_query_failed", "filters", filters, "error", err.Error())
		return nil, err
	}
	defer rows.Close()

	projects := []domain.Project{}
	for rows.Next() {
		var (
			id                                                          uuid.UUID
			slug, name, status                                          string
			sale                                                        pgtype.Text
			developerID, areaID                                         uuid.NullUUID
			lat, lng                                                    pgtype.Numeric
			descBytes, mediaBytes, pricesByTypeBytes                    []byte
			featuresAmenities, tags, propertyTypes, bedrooms, bathrooms []string
			isFeatured                                                  pgtype.Bool
			youtubeUrl                                       pgtype.Text
			roi, priceFromUs, priceFromDeveloper             pgtype.Numeric
			paymentPlan, completionDate                      pgtype.Text
			currency                                         pgtype.Text
			areaSize                                         pgtype.Numeric
			areaUnit                                         pgtype.Text
			tlAnn, tlBook, tlConstStart                      pgtype.Timestamptz
			tlConstProg, tlExp                               pgtype.Timestamptz
			tlConstProgPct                                   pgtype.Int4
			createdAt, updatedAt                             pgtype.Timestamptz
			devName, devLogoUrl, areaName, areaCity          pgtype.Text
		)

		if err := rows.Scan(
			&id, &slug, &name, &status, &sale,
			&developerID, &areaID, &lat, &lng,
			&descBytes, &mediaBytes, &featuresAmenities, &tags, &isFeatured, &youtubeUrl,
			&roi, &priceFromUs, &priceFromDeveloper, &paymentPlan, &completionDate,
			&currency, &propertyTypes, &bedrooms, &bathrooms, &areaSize, &areaUnit, &pricesByTypeBytes,
			&tlAnn, &tlBook, &tlConstStart,
			&tlConstProg, &tlConstProgPct, &tlExp,
			&createdAt, &updatedAt,
			&devName, &devLogoUrl, &areaName, &areaCity,
		); err != nil {
			return nil, err
		}

		project, err := sqlcProjectRowToDomain(
			id, slug, name, status, sale,
			developerID, areaID, lat, lng,
			descBytes, mediaBytes, featuresAmenities, tags,
			isFeatured, youtubeUrl,
			roi, priceFromUs, priceFromDeveloper,
			paymentPlan, completionDate,
			currency, propertyTypes, bedrooms, bathrooms,
			areaSize, areaUnit, pricesByTypeBytes,
			tlAnn, tlBook, tlConstStart,
			tlConstProg, tlConstProgPct, tlExp,
			createdAt, updatedAt, pgtype.Timestamptz{},
		)
		if err != nil {
			r.logger.Error("project_repo_list_unmarshal_failed", "project_id", id, "error", err.Error())
			return nil, err
		}

		if devName.Valid {
			project.Developer = &domain.Developer{
				Name:    devName.String,
				LogoURL: textToString(devLogoUrl),
			}
		}
		if areaName.Valid {
			project.Area = &domain.Area{
				Name: areaName.String,
				City: textToString(areaCity),
			}
		}

		projects = append(projects, *project)
	}

	if err := rows.Err(); err != nil {
		r.logger.Error("project_repo_list_rows_error", "filters", filters, "error", err.Error())
		return nil, err
	}

	r.logger.Info("project_repo_list_completed", "filters", filters, "count", len(projects))
	return projects, nil
}

func (r *ProjectRepo) GetIDBySlug(slug string) (*uuid.UUID, error) {
	r.logger.Info("project_repo_get_id_by_slug_started", "project_slug", slug)

	id, err := r.queries.GetProjectIDBySlug(context.Background(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("project_repo_get_id_by_slug_not_found", "project_slug", slug)
			return nil, nil
		}
		r.logger.Error("project_repo_get_id_by_slug_failed", "project_slug", slug, "error", err.Error())
		return nil, err
	}

	r.logger.Info("project_repo_get_id_by_slug_completed", "project_slug", slug, "project_id", id)
	return &id, nil
}

func (r *ProjectRepo) Create(project *domain.Project) error {
	r.logger.Info("project_repo_create_started", "project_slug", project.Slug, "project_name", project.Name)

	descJSON, mediaJSON, pricesByTypeJSON, err := marshalProjectJSONFields(project)
	if err != nil {
		r.logger.Error("project_repo_create_marshal_failed", "project_slug", project.Slug, "error", err.Error())
		return err
	}

	tlAnn, tlBook, tlConstStart, tlConstProg, tlExp, tlConstProgPct := projectTimelineToParams(project.Timeline)

	row, err := r.queries.CreateProject(context.Background(), sqlcgen.CreateProjectParams{
		Slug:                            project.Slug,
		Name:                            project.Name,
		Status:                          string(project.Status),
		Sale:                            stringToText(project.Sale),
		DeveloperID:                     uuidPtrToNullUUID(project.DeveloperID),
		AreaID:                          uuidPtrToNullUUID(project.AreaID),
		Lat:                             float64PtrToNumeric(project.Lat),
		Lng:                             float64PtrToNumeric(project.Lng),
		Description:                     descJSON,
		Media:                           mediaJSON,
		FeaturesAmenities:               project.FeaturesAmenities,
		Tags:                            project.Tags,
		IsFeatured:                      boolToPgBool(project.IsFeatured),
		YoutubeUrl:                      stringToText(project.YoutubeURL),
		Roi:                             float64PtrToNumeric(project.ROI),
		PriceFromUs:                     float64PtrToNumeric(project.PriceFromUs),
		PriceFromDeveloper:              float64PtrToNumeric(project.PriceFromDeveloper),
		PaymentPlan:                     stringToText(project.PaymentPlan),
		CompletionDate:                  stringToText(project.CompletionDate),
		Currency:                        stringToText(project.Currency),
		PropertyTypes:                   project.PropertyTypes,
		Bedrooms:                        project.Bedrooms,
		Bathrooms:                       project.Bathrooms,
		AreaSize:                        float64PtrToNumeric(project.AreaSize),
		AreaUnit:                        stringToText(project.AreaUnit),
		PricesByType:                    pricesByTypeJSON,
		TimelineAnnouncement:            tlAnn,
		TimelineBookingStarted:          tlBook,
		TimelineConstructionStarted:     tlConstStart,
		TimelineConstructionProgress:    tlConstProg,
		TimelineConstructionProgressPct: tlConstProgPct,
		TimelineExpectedCompletion:      tlExp,
	})
	if err != nil {
		r.logger.Error("project_repo_create_failed", "project_slug", project.Slug, "error", err.Error())
		return err
	}

	project.ID = row.ID
	project.CreatedAt = tstzToTime(row.CreatedAt)
	project.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("project_repo_create_completed", "project_id", project.ID, "project_slug", project.Slug)
	return nil
}

func (r *ProjectRepo) Update(id uuid.UUID, project *domain.Project) error {
	r.logger.Info("project_repo_update_started", "project_id", id)

	descJSON, mediaJSON, pricesByTypeJSON, err := marshalProjectJSONFields(project)
	if err != nil {
		r.logger.Error("project_repo_update_marshal_failed", "project_id", id, "error", err.Error())
		return err
	}

	tlAnn, tlBook, tlConstStart, tlConstProg, tlExp, tlConstProgPct := projectTimelineToParams(project.Timeline)

	updatedAt, err := r.queries.UpdateProject(context.Background(), sqlcgen.UpdateProjectParams{
		Slug:                            project.Slug,
		Name:                            project.Name,
		Status:                          string(project.Status),
		Sale:                            stringToText(project.Sale),
		DeveloperID:                     uuidPtrToNullUUID(project.DeveloperID),
		AreaID:                          uuidPtrToNullUUID(project.AreaID),
		Lat:                             float64PtrToNumeric(project.Lat),
		Lng:                             float64PtrToNumeric(project.Lng),
		Description:                     descJSON,
		Media:                           mediaJSON,
		FeaturesAmenities:               project.FeaturesAmenities,
		Tags:                            project.Tags,
		IsFeatured:                      boolToPgBool(project.IsFeatured),
		YoutubeUrl:                      stringToText(project.YoutubeURL),
		Roi:                             float64PtrToNumeric(project.ROI),
		PriceFromUs:                     float64PtrToNumeric(project.PriceFromUs),
		PriceFromDeveloper:              float64PtrToNumeric(project.PriceFromDeveloper),
		PaymentPlan:                     stringToText(project.PaymentPlan),
		CompletionDate:                  stringToText(project.CompletionDate),
		Currency:                        stringToText(project.Currency),
		PropertyTypes:                   project.PropertyTypes,
		Bedrooms:                        project.Bedrooms,
		Bathrooms:                       project.Bathrooms,
		AreaSize:                        float64PtrToNumeric(project.AreaSize),
		AreaUnit:                        stringToText(project.AreaUnit),
		PricesByType:                    pricesByTypeJSON,
		TimelineAnnouncement:            tlAnn,
		TimelineBookingStarted:          tlBook,
		TimelineConstructionStarted:     tlConstStart,
		TimelineConstructionProgress:    tlConstProg,
		TimelineConstructionProgressPct: tlConstProgPct,
		TimelineExpectedCompletion:      tlExp,
		ID:                              id,
	})
	if err != nil {
		r.logger.Error("project_repo_update_failed", "project_id", id, "error", err.Error())
		return err
	}

	project.UpdatedAt = tstzToTime(updatedAt)

	r.logger.Info("project_repo_update_completed", "project_id", id, "project_slug", project.Slug)
	return nil
}

func (r *ProjectRepo) GetByID(id uuid.UUID) (*domain.Project, error) {
	r.logger.Info("project_repo_get_by_id_started", "project_id", id)

	row, err := r.queries.GetProjectByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("project_repo_get_by_id_not_found", "project_id", id)
			return nil, nil
		}
		r.logger.Error("project_repo_get_by_id_failed", "project_id", id, "error", err.Error())
		return nil, err
	}

	project, err := sqlcProjectRowToDomain(
		row.ID, row.Slug, row.Name, row.Status, row.Sale,
		row.DeveloperID, row.AreaID, row.Lat, row.Lng,
		row.Description, row.Media, row.FeaturesAmenities, row.Tags,
		row.IsFeatured, row.YoutubeUrl,
		row.Roi, row.PriceFromUs, row.PriceFromDeveloper,
		row.PaymentPlan, row.CompletionDate,
		row.Currency, row.PropertyTypes, row.Bedrooms, row.Bathrooms,
		row.AreaSize, row.AreaUnit, row.PricesByType,
		row.TimelineAnnouncement, row.TimelineBookingStarted, row.TimelineConstructionStarted,
		row.TimelineConstructionProgress, row.TimelineConstructionProgressPct, row.TimelineExpectedCompletion,
		row.CreatedAt, row.UpdatedAt, row.DeletedAt,
	)
	if err != nil {
		r.logger.Error("project_repo_get_by_id_unmarshal_failed", "project_id", id, "error", err.Error())
		return nil, err
	}

	r.logger.Info("project_repo_get_by_id_completed", "project_id", id, "project_slug", project.Slug)
	return project, nil
}

func (r *ProjectRepo) ListAll() ([]domain.Project, error) {
	r.logger.Info("project_repo_list_all_started")

	rows, err := r.queries.ListAllProjects(context.Background())
	if err != nil {
		r.logger.Error("project_repo_list_all_query_failed", "error", err.Error())
		return nil, err
	}

	projects := make([]domain.Project, 0, len(rows))
	for _, row := range rows {
		project, err := sqlcProjectRowToDomain(
			row.ID, row.Slug, row.Name, row.Status, row.Sale,
			row.DeveloperID, row.AreaID, row.Lat, row.Lng,
			row.Description, row.Media, row.FeaturesAmenities, row.Tags,
			row.IsFeatured, row.YoutubeUrl,
			row.Roi, row.PriceFromUs, row.PriceFromDeveloper,
			row.PaymentPlan, row.CompletionDate,
			row.Currency, row.PropertyTypes, row.Bedrooms, row.Bathrooms,
			row.AreaSize, row.AreaUnit, row.PricesByType,
			row.TimelineAnnouncement, row.TimelineBookingStarted, row.TimelineConstructionStarted,
			row.TimelineConstructionProgress, row.TimelineConstructionProgressPct, row.TimelineExpectedCompletion,
			row.CreatedAt, row.UpdatedAt, row.DeletedAt,
		)
		if err != nil {
			r.logger.Error("project_repo_list_all_unmarshal_failed", "project_id", row.ID, "error", err.Error())
			return nil, err
		}

		if row.DevName.Valid {
			project.Developer = &domain.Developer{
				Name:    row.DevName.String,
				LogoURL: textToString(row.DevLogoUrl),
			}
		}

		if row.AreaName.Valid {
			project.Area = &domain.Area{
				Name: row.AreaName.String,
				City: textToString(row.AreaCity),
			}
		}

		projects = append(projects, *project)
	}

	r.logger.Info("project_repo_list_all_completed", "count", len(projects))
	return projects, nil
}

func (r *ProjectRepo) Delete(id uuid.UUID) error {
	r.logger.Info("project_repo_delete_started", "project_id", id)

	if err := r.queries.DeleteProject(context.Background(), id); err != nil {
		r.logger.Error("project_repo_delete_failed", "project_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_delete_completed", "project_id", id)
	return nil
}

func (r *ProjectRepo) ListDeleted() ([]domain.Project, error) {
	r.logger.Info("project_repo_list_deleted_started")

	rows, err := r.queries.ListDeletedProjects(context.Background())
	if err != nil {
		r.logger.Error("project_repo_list_deleted_query_failed", "error", err.Error())
		return nil, err
	}

	projects := make([]domain.Project, 0, len(rows))
	for _, row := range rows {
		project, err := sqlcProjectRowToDomain(
			row.ID, row.Slug, row.Name, row.Status, row.Sale,
			row.DeveloperID, row.AreaID, row.Lat, row.Lng,
			row.Description, row.Media, row.FeaturesAmenities, row.Tags,
			row.IsFeatured, row.YoutubeUrl,
			row.Roi, row.PriceFromUs, row.PriceFromDeveloper,
			row.PaymentPlan, row.CompletionDate,
			row.Currency, row.PropertyTypes, row.Bedrooms, row.Bathrooms,
			row.AreaSize, row.AreaUnit, row.PricesByType,
			row.TimelineAnnouncement, row.TimelineBookingStarted, row.TimelineConstructionStarted,
			row.TimelineConstructionProgress, row.TimelineConstructionProgressPct, row.TimelineExpectedCompletion,
			row.CreatedAt, row.UpdatedAt, row.DeletedAt,
		)
		if err != nil {
			r.logger.Error("project_repo_list_deleted_unmarshal_failed", "project_id", row.ID, "error", err.Error())
			return nil, err
		}

		if row.DevName.Valid {
			project.Developer = &domain.Developer{
				Name:    row.DevName.String,
				LogoURL: textToString(row.DevLogoUrl),
			}
		}

		if row.AreaName.Valid {
			project.Area = &domain.Area{
				Name: row.AreaName.String,
				City: textToString(row.AreaCity),
			}
		}

		projects = append(projects, *project)
	}

	r.logger.Info("project_repo_list_deleted_completed", "count", len(projects))
	return projects, nil
}

func (r *ProjectRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Project, error) {
	row, err := r.queries.GetProjectByIDWithDeleted(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	project, err := sqlcProjectRowToDomain(
		row.ID, row.Slug, row.Name, row.Status, row.Sale,
		row.DeveloperID, row.AreaID, row.Lat, row.Lng,
		row.Description, row.Media, row.FeaturesAmenities, row.Tags,
		row.IsFeatured, row.YoutubeUrl,
		row.Roi, row.PriceFromUs, row.PriceFromDeveloper,
		row.PaymentPlan, row.CompletionDate,
		row.Currency, row.PropertyTypes, row.Bedrooms, row.Bathrooms,
		row.AreaSize, row.AreaUnit, row.PricesByType,
		row.TimelineAnnouncement, row.TimelineBookingStarted, row.TimelineConstructionStarted,
		row.TimelineConstructionProgress, row.TimelineConstructionProgressPct, row.TimelineExpectedCompletion,
		row.CreatedAt, row.UpdatedAt, row.DeletedAt,
	)
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (r *ProjectRepo) Restore(id uuid.UUID) error {
	r.logger.Info("project_repo_restore_started", "project_id", id)

	if err := r.queries.RestoreProject(context.Background(), id); err != nil {
		r.logger.Error("project_repo_restore_failed", "project_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_restore_completed", "project_id", id)
	return nil
}

func (r *ProjectRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("project_repo_hard_delete_started", "project_id", id)

	if err := r.queries.HardDeleteProject(context.Background(), id); err != nil {
		r.logger.Error("project_repo_hard_delete_failed", "project_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_hard_delete_completed", "project_id", id)
	return nil
}

func (r *ProjectRepo) RecalculatePricesFromLots(projectID uuid.UUID) error {
	r.logger.Info("project_repo_recalculate_prices_started", "project_id", projectID)

	if err := r.queries.RecalculateProjectPrices(context.Background(), uuid.NullUUID{UUID: projectID, Valid: true}); err != nil {
		r.logger.Error("project_repo_recalculate_prices_failed", "project_id", projectID, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_recalculate_prices_completed", "project_id", projectID)
	return nil
}

// marshalProjectJSONFields marshals project's JSONB fields.
func marshalProjectJSONFields(project *domain.Project) (descJSON, mediaJSON, pricesByTypeJSON []byte, err error) {
	if project.Description != nil {
		descJSON, err = json.Marshal(project.Description)
		if err != nil {
			return nil, nil, nil, err
		}
	}
	if project.Media != nil {
		mediaJSON, err = json.Marshal(project.Media)
		if err != nil {
			return nil, nil, nil, err
		}
	}
	if len(project.PricesByType) > 0 {
		pricesByTypeJSON, err = json.Marshal(project.PricesByType)
		if err != nil {
			return nil, nil, nil, err
		}
	}
	return
}

// projectTimelineToParams converts domain timeline to pgtype params.
func projectTimelineToParams(tl *domain.ProjectTimeline) (ann, book, constStart, constProg, exp pgtype.Timestamptz, constProgPct pgtype.Int4) {
	if tl == nil {
		return
	}
	ann = timePtrToTstz(tl.ProjectAnnouncement)
	book = timePtrToTstz(tl.BookingStarted)
	constStart = timePtrToTstz(tl.ConstructionStarted)
	constProg = timePtrToTstz(tl.ConstructionProgress)
	exp = timePtrToTstz(tl.ExpectedCompletion)
	if tl.ConstructionProgressPercent != nil {
		constProgPct = pgtype.Int4{Int32: int32(*tl.ConstructionProgressPercent), Valid: true}
	}
	return
}

// sqlcProjectRowToDomain converts sqlc project row fields to domain.Project.
func sqlcProjectRowToDomain(
	id uuid.UUID, slug, name, status string, sale pgtype.Text,
	developerID, areaID uuid.NullUUID, lat, lng pgtype.Numeric,
	description, media []byte, featuresAmenities, tags []string,
	isFeatured pgtype.Bool, youtubeUrl pgtype.Text,
	roi, priceFromUs, priceFromDeveloper pgtype.Numeric,
	paymentPlan, completionDate pgtype.Text,
	currency pgtype.Text,
	propertyTypes, bedrooms, bathrooms []string,
	areaSize pgtype.Numeric, areaUnit pgtype.Text,
	pricesByType []byte,
	tlAnn, tlBook, tlConstStart, tlConstProg pgtype.Timestamptz,
	tlConstProgPct pgtype.Int4,
	tlExp pgtype.Timestamptz,
	createdAt, updatedAt, deletedAt pgtype.Timestamptz,
) (*domain.Project, error) {
	project := &domain.Project{
		ID:                 id,
		Slug:               slug,
		Name:               name,
		Status:             domain.ProjectStatus(status),
		Sale:               textToString(sale),
		DeveloperID:        nullUUIDToPtr(developerID),
		AreaID:             nullUUIDToPtr(areaID),
		Lat:                numericToFloat64Ptr(lat),
		Lng:                numericToFloat64Ptr(lng),
		FeaturesAmenities:  featuresAmenities,
		Tags:               tags,
		IsFeatured:         pgBoolToBool(isFeatured),
		YoutubeURL:         textToString(youtubeUrl),
		ROI:                numericToFloat64Ptr(roi),
		PriceFromUs:        numericToFloat64Ptr(priceFromUs),
		PriceFromDeveloper: numericToFloat64Ptr(priceFromDeveloper),
		PaymentPlan:        textToString(paymentPlan),
		CompletionDate:     textToString(completionDate),
		Currency:           textToString(currency),
		PropertyTypes:      propertyTypes,
		Bedrooms:           bedrooms,
		Bathrooms:          bathrooms,
		AreaSize:           numericToFloat64Ptr(areaSize),
		AreaUnit:           textToString(areaUnit),
		CreatedAt:          tstzToTime(createdAt),
		UpdatedAt:          tstzToTime(updatedAt),
		DeletedAt:          tstzToTimePtr(deletedAt),
	}

	// Ensure non-nil slices
	if project.FeaturesAmenities == nil {
		project.FeaturesAmenities = []string{}
	}
	if project.Tags == nil {
		project.Tags = []string{}
	}
	if project.PropertyTypes == nil {
		project.PropertyTypes = []string{}
	}
	if project.Bedrooms == nil {
		project.Bedrooms = []string{}
	}
	if project.Bathrooms == nil {
		project.Bathrooms = []string{}
	}

	// JSONB fields
	if len(description) > 0 {
		if err := json.Unmarshal(description, &project.Description); err != nil {
			return nil, err
		}
	}
	if len(media) > 0 {
		project.Media = &domain.Media{}
		if err := json.Unmarshal(media, project.Media); err != nil {
			return nil, err
		}
	}
	if len(pricesByType) > 0 {
		if err := json.Unmarshal(pricesByType, &project.PricesByType); err != nil {
			return nil, err
		}
	}

	// Timeline
	hasTimeline := tlAnn.Valid || tlBook.Valid || tlConstStart.Valid ||
		tlConstProg.Valid || tlExp.Valid || tlConstProgPct.Valid
	if hasTimeline {
		tl := &domain.ProjectTimeline{}
		if tlAnn.Valid {
			tl.ProjectAnnouncement = &tlAnn.Time
		}
		if tlBook.Valid {
			tl.BookingStarted = &tlBook.Time
		}
		if tlConstStart.Valid {
			tl.ConstructionStarted = &tlConstStart.Time
		}
		if tlConstProg.Valid {
			tl.ConstructionProgress = &tlConstProg.Time
		}
		if tlConstProgPct.Valid {
			pct := int(tlConstProgPct.Int32)
			tl.ConstructionProgressPercent = &pct
		}
		if tlExp.Valid {
			tl.ExpectedCompletion = &tlExp.Time
		}
		project.Timeline = tl
	}

	return project, nil
}
