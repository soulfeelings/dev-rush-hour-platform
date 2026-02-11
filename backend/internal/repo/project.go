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

// projectColumns is the list of project columns to SELECT (without table alias).
const projectColumns = `id, slug, name, status, sale, developer_id, area_id, lat, lng,
	description, media, features_amenities, tags, is_featured, youtube_url,
	roi, our_price, developer_price, payment_plan, completion_date,
	price_from, currency, property_types, bedrooms, area_size, area_unit, prices_by_type,
	timeline_announcement, timeline_booking_started, timeline_construction_started,
	timeline_construction_progress, timeline_construction_progress_pct, timeline_expected_completion,
	created_at, updated_at, deleted_at`

// projectColumnsAliased returns project columns with a table alias prefix.
func projectColumnsAliased(alias string) string {
	return fmt.Sprintf(`%[1]s.id, %[1]s.slug, %[1]s.name, %[1]s.status, %[1]s.sale, %[1]s.developer_id, %[1]s.area_id, %[1]s.lat, %[1]s.lng,
	%[1]s.description, %[1]s.media, %[1]s.features_amenities, %[1]s.tags, %[1]s.is_featured, %[1]s.youtube_url,
	%[1]s.roi, %[1]s.our_price, %[1]s.developer_price, %[1]s.payment_plan, %[1]s.completion_date,
	%[1]s.price_from, %[1]s.currency, %[1]s.property_types, %[1]s.bedrooms, %[1]s.area_size, %[1]s.area_unit, %[1]s.prices_by_type,
	%[1]s.timeline_announcement, %[1]s.timeline_booking_started, %[1]s.timeline_construction_started,
	%[1]s.timeline_construction_progress, %[1]s.timeline_construction_progress_pct, %[1]s.timeline_expected_completion,
	%[1]s.created_at, %[1]s.updated_at`, alias)
}

// populateProjectFromScan fills project fields from nullable scan variables.
func populateProjectFromScan(
	project *domain.Project,
	developerID, areaID sql.NullString,
	lat, lng sql.NullFloat64,
	descJSON, mediaJSON, pricesByTypeJSON []byte,
	featuresAmenities, tags, propertyTypes, bedroomArr pq.StringArray,
	sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit sql.NullString,
	isFeatured sql.NullBool,
	roi, ourPrice, developerPrice, priceFrom, areaSize sql.NullFloat64,
	timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime,
	timelineConstProgPct sql.NullInt64,
) error {
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

	// JSONB fields
	if len(descJSON) > 0 {
		if err := json.Unmarshal(descJSON, &project.Description); err != nil {
			return err
		}
	}
	if len(mediaJSON) > 0 {
		project.Media = &domain.Media{}
		if err := json.Unmarshal(mediaJSON, project.Media); err != nil {
			return err
		}
	}
	if len(pricesByTypeJSON) > 0 {
		if err := json.Unmarshal(pricesByTypeJSON, &project.PricesByType); err != nil {
			return err
		}
	}

	// Array fields
	project.FeaturesAmenities = []string(featuresAmenities)
	project.Tags = []string(tags)
	project.PropertyTypes = []string(propertyTypes)
	project.Bedrooms = []string(bedroomArr)

	// String fields
	if youtubeURL.Valid {
		project.YoutubeURL = youtubeURL.String
	}
	if paymentPlan.Valid {
		project.PaymentPlan = paymentPlan.String
	}
	if completionDate.Valid {
		project.CompletionDate = completionDate.String
	}
	if currency.Valid {
		project.Currency = currency.String
	}
	if areaUnit.Valid {
		project.AreaUnit = areaUnit.String
	}

	// Bool
	if isFeatured.Valid {
		project.IsFeatured = isFeatured.Bool
	}

	// Float fields
	if roi.Valid {
		project.ROI = &roi.Float64
	}
	if ourPrice.Valid {
		project.OurPrice = &ourPrice.Float64
	}
	if developerPrice.Valid {
		project.DeveloperPrice = &developerPrice.Float64
	}
	if priceFrom.Valid {
		project.PriceFrom = &priceFrom.Float64
	}
	if areaSize.Valid {
		project.AreaSize = &areaSize.Float64
	}

	// Timeline
	hasTimeline := timelineAnn.Valid || timelineBook.Valid || timelineConstStart.Valid ||
		timelineConstProg.Valid || timelineExp.Valid || timelineConstProgPct.Valid
	if hasTimeline {
		tl := &domain.ProjectTimeline{}
		if timelineAnn.Valid {
			tl.ProjectAnnouncement = &timelineAnn.Time
		}
		if timelineBook.Valid {
			tl.BookingStarted = &timelineBook.Time
		}
		if timelineConstStart.Valid {
			tl.ConstructionStarted = &timelineConstStart.Time
		}
		if timelineConstProg.Valid {
			tl.ConstructionProgress = &timelineConstProg.Time
		}
		if timelineConstProgPct.Valid {
			pct := int(timelineConstProgPct.Int64)
			tl.ConstructionProgressPercent = &pct
		}
		if timelineExp.Valid {
			tl.ExpectedCompletion = &timelineExp.Time
		}
		project.Timeline = tl
	}

	return nil
}

func (r *ProjectRepo) GetBySlug(slug string) (*domain.Project, error) {
	r.logger.Info("project_repo_get_by_slug_started",
		"project_slug", slug,
	)

	var project domain.Project
	var (
		developerID, areaID                                                          sql.NullString
		lat, lng                                                                     sql.NullFloat64
		descJSON, mediaJSON, pricesByTypeJSON                                        []byte
		featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
		isFeatured                                                                   sql.NullBool
		roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
		timelineConstProgPct                                                         sql.NullInt64
	)
	var devName, devLogoURL, areaName, areaCity sql.NullString

	err := r.db.QueryRow(`
		SELECT `+projectColumnsAliased("p")+`,
		       d.name as dev_name, d.logo_url as dev_logo_url,
		       a.name as area_name, a.city as area_city
		FROM projects p
		LEFT JOIN developers d ON p.developer_id = d.id
		LEFT JOIN areas a ON p.area_id = a.id
		WHERE p.slug = $1 AND p.deleted_at IS NULL
	`, slug).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
		&developerID, &areaID, &lat, &lng,
		&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
		&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
		&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
		&timelineAnn, &timelineBook, &timelineConstStart,
		&timelineConstProg, &timelineConstProgPct, &timelineExp,
		&project.CreatedAt, &project.UpdatedAt,
		&devName, &devLogoURL,
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

	if err := populateProjectFromScan(&project,
		developerID, areaID, lat, lng,
		descJSON, mediaJSON, pricesByTypeJSON,
		featuresAmenities, tags, propertyTypes, bedroomArr,
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
		isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
		timelineConstProgPct,
	); err != nil {
		r.logger.Error("project_repo_get_by_slug_unmarshal_failed",
			"project_slug", slug,
			"error", err.Error(),
		)
		return nil, err
	}

	// Populate developer info
	if devName.Valid {
		project.Developer = &domain.Developer{
			Name:    devName.String,
			LogoURL: devLogoURL.String,
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
		SELECT ` + projectColumnsAliased("p") + `,
		       d.name as dev_name, d.logo_url as dev_logo_url,
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

	// Filter by project status (ready, construction, planning - stored in sale field)
	if filters.Status != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.sale = $%d", argPos))
		args = append(args, *filters.Status)
		argPos++
	}

	// Filter by bedrooms - uses TEXT[] column with overlap operator
	if len(filters.Bedrooms) > 0 {
		placeholders := make([]string, len(filters.Bedrooms))
		for i, bed := range filters.Bedrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bed)
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.bedrooms && ARRAY[%s]::text[]",
			strings.Join(placeholders, ", "),
		))
	}

	// Filter by bathrooms
	if len(filters.Bathrooms) > 0 {
		placeholders := make([]string, len(filters.Bathrooms))
		for i, bath := range filters.Bathrooms {
			placeholders[i] = fmt.Sprintf("$%d", argPos)
			args = append(args, bath)
			argPos++
		}
		whereClauses = append(whereClauses, fmt.Sprintf(
			"p.bedrooms && ARRAY[%s]::text[]",
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
		whereClauses = append(whereClauses, fmt.Sprintf("p.price_from IS NOT NULL AND p.price_from >= $%d", argPos))
		args = append(args, *filters.PriceMin)
		argPos++
	}

	if filters.PriceMax != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("p.price_from IS NOT NULL AND p.price_from <= $%d", argPos))
		args = append(args, *filters.PriceMax)
		argPos++
	}

	query += " WHERE " + strings.Join(whereClauses, " AND ")

	// Apply sorting
	switch sort {
	case domain.ProjectSortPriceAsc:
		query += ` ORDER BY p.price_from ASC NULLS LAST`
	case domain.ProjectSortPriceDesc:
		query += ` ORDER BY p.price_from DESC NULLS LAST`
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
		var (
			developerID, areaID                                                          sql.NullString
			lat, lng                                                                     sql.NullFloat64
			descJSON, mediaJSON, pricesByTypeJSON                                        []byte
			featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
			isFeatured                                                                   sql.NullBool
			roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
			timelineConstProgPct                                                         sql.NullInt64
		)
		var devName, devLogoURL, areaName, areaCity sql.NullString

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
			&developerID, &areaID, &lat, &lng,
			&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
			&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
			&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
			&timelineAnn, &timelineBook, &timelineConstStart,
			&timelineConstProg, &timelineConstProgPct, &timelineExp,
			&project.CreatedAt, &project.UpdatedAt,
			&devName, &devLogoURL,
			&areaName, &areaCity,
		); err != nil {
			return nil, err
		}

		if err := populateProjectFromScan(&project,
			developerID, areaID, lat, lng,
			descJSON, mediaJSON, pricesByTypeJSON,
			featuresAmenities, tags, propertyTypes, bedroomArr,
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
			isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
			timelineConstProgPct,
		); err != nil {
			r.logger.Error("project_repo_list_unmarshal_failed",
				"project_id", project.ID,
				"error", err.Error(),
			)
			return nil, err
		}

		// Populate developer info
		if devName.Valid {
			project.Developer = &domain.Developer{
				Name:    devName.String,
				LogoURL: devLogoURL.String,
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

func (r *ProjectRepo) marshalProjectJSONFields(project *domain.Project) (descJSON, mediaJSON, pricesByTypeJSON []byte, err error) {
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
	return descJSON, mediaJSON, pricesByTypeJSON, nil
}

func (r *ProjectRepo) Create(project *domain.Project) error {
	r.logger.Info("project_repo_create_started",
		"project_slug", project.Slug,
		"project_name", project.Name,
	)

	descJSON, mediaJSON, pricesByTypeJSON, err := r.marshalProjectJSONFields(project)
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
		INSERT INTO projects (slug, name, status, sale, developer_id, area_id, lat, lng,
			description, media, features_amenities, tags, is_featured, youtube_url,
			roi, our_price, developer_price, payment_plan, completion_date,
			price_from, currency, property_types, bedrooms, area_size, area_unit, prices_by_type,
			timeline_announcement, timeline_booking_started, timeline_construction_started,
			timeline_construction_progress, timeline_construction_progress_pct, timeline_expected_completion)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14,
			$15, $16, $17, $18, $19,
			$20, $21, $22, $23, $24, $25, $26,
			$27, $28, $29, $30, $31, $32)
		RETURNING id, created_at, updated_at
	`,
		project.Slug, project.Name, project.Status, project.Sale, developerID, areaID, lat, lng,
		nullableJSON(descJSON), nullableJSON(mediaJSON),
		pq.Array(project.FeaturesAmenities), pq.Array(project.Tags),
		project.IsFeatured, nullableString(project.YoutubeURL),
		nullableFloat(project.ROI), nullableFloat(project.OurPrice), nullableFloat(project.DeveloperPrice),
		nullableString(project.PaymentPlan), nullableString(project.CompletionDate),
		nullableFloat(project.PriceFrom), nullableString(project.Currency),
		pq.Array(project.PropertyTypes), pq.Array(project.Bedrooms),
		nullableFloat(project.AreaSize), nullableString(project.AreaUnit),
		nullableJSON(pricesByTypeJSON),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "announcement") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "booking") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "constStart") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "constProgress") }),
		nullableTimelineInt(project.Timeline),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "expected") }),
	).Scan(&project.ID, &project.CreatedAt, &project.UpdatedAt)

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

	descJSON, mediaJSON, pricesByTypeJSON, err := r.marshalProjectJSONFields(project)
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
		UPDATE projects SET
			slug = $1, name = $2, status = $3, sale = $4, developer_id = $5, area_id = $6, lat = $7, lng = $8,
			description = $9, media = $10, features_amenities = $11, tags = $12, is_featured = $13, youtube_url = $14,
			roi = $15, our_price = $16, developer_price = $17, payment_plan = $18, completion_date = $19,
			price_from = $20, currency = $21, property_types = $22, bedrooms = $23, area_size = $24, area_unit = $25, prices_by_type = $26,
			timeline_announcement = $27, timeline_booking_started = $28, timeline_construction_started = $29,
			timeline_construction_progress = $30, timeline_construction_progress_pct = $31, timeline_expected_completion = $32,
			updated_at = NOW()
		WHERE id = $33 AND deleted_at IS NULL
		RETURNING updated_at
	`,
		project.Slug, project.Name, project.Status, project.Sale, developerID, areaID, lat, lng,
		nullableJSON(descJSON), nullableJSON(mediaJSON),
		pq.Array(project.FeaturesAmenities), pq.Array(project.Tags),
		project.IsFeatured, nullableString(project.YoutubeURL),
		nullableFloat(project.ROI), nullableFloat(project.OurPrice), nullableFloat(project.DeveloperPrice),
		nullableString(project.PaymentPlan), nullableString(project.CompletionDate),
		nullableFloat(project.PriceFrom), nullableString(project.Currency),
		pq.Array(project.PropertyTypes), pq.Array(project.Bedrooms),
		nullableFloat(project.AreaSize), nullableString(project.AreaUnit),
		nullableJSON(pricesByTypeJSON),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "announcement") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "booking") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "constStart") }),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "constProgress") }),
		nullableTimelineInt(project.Timeline),
		nullableTime(project.Timeline, func(t *domain.ProjectTimeline) sql.NullTime { return timelineField(t, "expected") }),
		id,
	).Scan(&project.UpdatedAt)

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
		"project_id_string", id.String(),
	)

	var project domain.Project
	var (
		developerID, areaID                                                          sql.NullString
		lat, lng                                                                     sql.NullFloat64
		descJSON, mediaJSON, pricesByTypeJSON                                        []byte
		featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
		isFeatured                                                                   sql.NullBool
		roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
		timelineConstProgPct                                                         sql.NullInt64
	)

	err := r.db.QueryRow(`
		SELECT `+projectColumns+`
		FROM projects
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
		&developerID, &areaID, &lat, &lng,
		&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
		&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
		&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
		&timelineAnn, &timelineBook, &timelineConstStart,
		&timelineConstProg, &timelineConstProgPct, &timelineExp,
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

	if err := populateProjectFromScan(&project,
		developerID, areaID, lat, lng,
		descJSON, mediaJSON, pricesByTypeJSON,
		featuresAmenities, tags, propertyTypes, bedroomArr,
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
		isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
		timelineConstProgPct,
	); err != nil {
		r.logger.Error("project_repo_get_by_id_unmarshal_failed",
			"project_id", id,
			"error", err.Error(),
		)
		return nil, err
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
		SELECT ` + projectColumns + `
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
		var (
			developerID, areaID                                                          sql.NullString
			lat, lng                                                                     sql.NullFloat64
			descJSON, mediaJSON, pricesByTypeJSON                                        []byte
			featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
			isFeatured                                                                   sql.NullBool
			roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
			timelineConstProgPct                                                         sql.NullInt64
		)

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
			&developerID, &areaID, &lat, &lng,
			&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
			&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
			&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
			&timelineAnn, &timelineBook, &timelineConstStart,
			&timelineConstProg, &timelineConstProgPct, &timelineExp,
			&project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
		); err != nil {
			return nil, err
		}

		if err := populateProjectFromScan(&project,
			developerID, areaID, lat, lng,
			descJSON, mediaJSON, pricesByTypeJSON,
			featuresAmenities, tags, propertyTypes, bedroomArr,
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
			isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
			timelineConstProgPct,
		); err != nil {
			r.logger.Error("project_repo_list_all_unmarshal_failed",
				"project_id", project.ID,
				"error", err.Error(),
			)
			return nil, err
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

func (r *ProjectRepo) ListDeleted() ([]domain.Project, error) {
	r.logger.Info("project_repo_list_deleted_started")

	rows, err := r.db.Query(`
		SELECT ` + projectColumns + `
		FROM projects
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC
	`)
	if err != nil {
		r.logger.Error("project_repo_list_deleted_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	projects := []domain.Project{}
	for rows.Next() {
		var project domain.Project
		var (
			developerID, areaID                                                          sql.NullString
			lat, lng                                                                     sql.NullFloat64
			descJSON, mediaJSON, pricesByTypeJSON                                        []byte
			featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
			isFeatured                                                                   sql.NullBool
			roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
			timelineConstProgPct                                                         sql.NullInt64
		)

		if err := rows.Scan(
			&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
			&developerID, &areaID, &lat, &lng,
			&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
			&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
			&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
			&timelineAnn, &timelineBook, &timelineConstStart,
			&timelineConstProg, &timelineConstProgPct, &timelineExp,
			&project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
		); err != nil {
			r.logger.Error("project_repo_list_deleted_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}

		if err := populateProjectFromScan(&project,
			developerID, areaID, lat, lng,
			descJSON, mediaJSON, pricesByTypeJSON,
			featuresAmenities, tags, propertyTypes, bedroomArr,
			sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
			isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
			timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
			timelineConstProgPct,
		); err != nil {
			r.logger.Error("project_repo_list_deleted_unmarshal_failed",
				"project_id", project.ID,
				"error", err.Error(),
			)
			return nil, err
		}

		projects = append(projects, project)
	}

	r.logger.Info("project_repo_list_deleted_completed",
		"count", len(projects),
	)

	return projects, nil
}

func (r *ProjectRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Project, error) {
	var project domain.Project
	var (
		developerID, areaID                                                          sql.NullString
		lat, lng                                                                     sql.NullFloat64
		descJSON, mediaJSON, pricesByTypeJSON                                        []byte
		featuresAmenities, tags, propertyTypes, bedroomArr                           pq.StringArray
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit            sql.NullString
		isFeatured                                                                   sql.NullBool
		roi, ourPrice, developerPrice, priceFrom, areaSize                           sql.NullFloat64
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp sql.NullTime
		timelineConstProgPct                                                         sql.NullInt64
	)

	err := r.db.QueryRow(`
		SELECT `+projectColumns+`
		FROM projects
		WHERE id = $1
	`, id).Scan(
		&project.ID, &project.Slug, &project.Name, &project.Status, &sale,
		&developerID, &areaID, &lat, &lng,
		&descJSON, &mediaJSON, &featuresAmenities, &tags, &isFeatured, &youtubeURL,
		&roi, &ourPrice, &developerPrice, &paymentPlan, &completionDate,
		&priceFrom, &currency, &propertyTypes, &bedroomArr, &areaSize, &areaUnit, &pricesByTypeJSON,
		&timelineAnn, &timelineBook, &timelineConstStart,
		&timelineConstProg, &timelineConstProgPct, &timelineExp,
		&project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if err := populateProjectFromScan(&project,
		developerID, areaID, lat, lng,
		descJSON, mediaJSON, pricesByTypeJSON,
		featuresAmenities, tags, propertyTypes, bedroomArr,
		sale, youtubeURL, paymentPlan, completionDate, currency, areaUnit,
		isFeatured, roi, ourPrice, developerPrice, priceFrom, areaSize,
		timelineAnn, timelineBook, timelineConstStart, timelineConstProg, timelineExp,
		timelineConstProgPct,
	); err != nil {
		return nil, err
	}

	return &project, nil
}

func (r *ProjectRepo) Restore(id uuid.UUID) error {
	r.logger.Info("project_repo_restore_started", "project_id", id)

	_, err := r.db.Exec(`
		UPDATE projects
		SET deleted_at = NULL
		WHERE id = $1 AND deleted_at IS NOT NULL
	`, id)

	if err != nil {
		r.logger.Error("project_repo_restore_failed", "project_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_restore_completed", "project_id", id)
	return nil
}

func (r *ProjectRepo) HardDelete(id uuid.UUID) error {
	r.logger.Info("project_repo_hard_delete_started", "project_id", id)

	_, err := r.db.Exec(`DELETE FROM projects WHERE id = $1`, id)

	if err != nil {
		r.logger.Error("project_repo_hard_delete_failed", "project_id", id, "error", err.Error())
		return err
	}

	r.logger.Info("project_repo_hard_delete_completed", "project_id", id)
	return nil
}

// Helper functions for nullable SQL values

func nullableJSON(data []byte) interface{} {
	if len(data) == 0 {
		return nil
	}
	return data
}

func nullableString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func nullableFloat(f *float64) sql.NullFloat64 {
	if f == nil {
		return sql.NullFloat64{}
	}
	return sql.NullFloat64{Float64: *f, Valid: true}
}

func timelineField(t *domain.ProjectTimeline, field string) sql.NullTime {
	if t == nil {
		return sql.NullTime{}
	}
	switch field {
	case "announcement":
		if t.ProjectAnnouncement != nil {
			return sql.NullTime{Time: *t.ProjectAnnouncement, Valid: true}
		}
	case "booking":
		if t.BookingStarted != nil {
			return sql.NullTime{Time: *t.BookingStarted, Valid: true}
		}
	case "constStart":
		if t.ConstructionStarted != nil {
			return sql.NullTime{Time: *t.ConstructionStarted, Valid: true}
		}
	case "constProgress":
		if t.ConstructionProgress != nil {
			return sql.NullTime{Time: *t.ConstructionProgress, Valid: true}
		}
	case "expected":
		if t.ExpectedCompletion != nil {
			return sql.NullTime{Time: *t.ExpectedCompletion, Valid: true}
		}
	}
	return sql.NullTime{}
}

func nullableTime(t *domain.ProjectTimeline, fn func(*domain.ProjectTimeline) sql.NullTime) sql.NullTime {
	if t == nil {
		return sql.NullTime{}
	}
	return fn(t)
}

func nullableTimelineInt(t *domain.ProjectTimeline) sql.NullInt64 {
	if t == nil || t.ConstructionProgressPercent == nil {
		return sql.NullInt64{}
	}
	return sql.NullInt64{Int64: int64(*t.ConstructionProgressPercent), Valid: true}
}
