package repo

import (
	"database/sql"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"time"

	"github.com/google/uuid"
)

type MediaRepo struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewMediaRepo(db *sql.DB) *MediaRepo {
	return &MediaRepo{
		db:     db,
		logger: slog.Default(),
	}
}

// Create inserts a new media record
func (r *MediaRepo) Create(media *domain.MediaFile) error {
	r.logger.Info("media_repo_create_started",
		"storage_key", media.StorageKey,
		"mime_type", media.MimeType,
	)

	err := r.db.QueryRow(`
		INSERT INTO media (storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`,
		media.StorageKey,
		media.OriginalName,
		media.MimeType,
		media.Ext,
		media.SizeBytes,
		media.StorageDriver,
		media.Status,
	).Scan(&media.ID, &media.CreatedAt, &media.UpdatedAt)

	if err != nil {
		r.logger.Error("media_repo_create_failed",
			"storage_key", media.StorageKey,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("media_repo_create_completed",
		"id", media.ID,
		"storage_key", media.StorageKey,
	)

	return nil
}

// GetByID retrieves a media record by ID
func (r *MediaRepo) GetByID(id uuid.UUID) (*domain.MediaFile, error) {
	r.logger.Info("media_repo_get_by_id_started",
		"id", id,
	)

	var media domain.MediaFile
	err := r.db.QueryRow(`
		SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
		FROM media
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&media.ID,
		&media.StorageKey,
		&media.OriginalName,
		&media.MimeType,
		&media.Ext,
		&media.SizeBytes,
		&media.StorageDriver,
		&media.Status,
		&media.CreatedAt,
		&media.UpdatedAt,
		&media.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("media_repo_get_by_id_not_found",
				"id", id,
			)
			return nil, nil
		}
		r.logger.Error("media_repo_get_by_id_failed",
			"id", id,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("media_repo_get_by_id_completed",
		"id", id,
		"storage_key", media.StorageKey,
	)

	return &media, nil
}

// GetByStorageKey retrieves a media record by storage key
func (r *MediaRepo) GetByStorageKey(key string) (*domain.MediaFile, error) {
	r.logger.Info("media_repo_get_by_storage_key_started",
		"storage_key", key,
	)

	var media domain.MediaFile
	err := r.db.QueryRow(`
		SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
		FROM media
		WHERE storage_key = $1 AND deleted_at IS NULL
	`, key).Scan(
		&media.ID,
		&media.StorageKey,
		&media.OriginalName,
		&media.MimeType,
		&media.Ext,
		&media.SizeBytes,
		&media.StorageDriver,
		&media.Status,
		&media.CreatedAt,
		&media.UpdatedAt,
		&media.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.Info("media_repo_get_by_storage_key_not_found",
				"storage_key", key,
			)
			return nil, nil
		}
		r.logger.Error("media_repo_get_by_storage_key_failed",
			"storage_key", key,
			"error", err.Error(),
		)
		return nil, err
	}

	r.logger.Info("media_repo_get_by_storage_key_completed",
		"storage_key", key,
		"id", media.ID,
	)

	return &media, nil
}

// GetByIDs retrieves multiple media records by IDs
func (r *MediaRepo) GetByIDs(ids []uuid.UUID) ([]domain.MediaFile, []uuid.UUID, error) {
	r.logger.Info("media_repo_get_by_ids_started",
		"count", len(ids),
	)

	if len(ids) == 0 {
		return []domain.MediaFile{}, []uuid.UUID{}, nil
	}

	// Build query with placeholders
	query := `
		SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
		FROM media
		WHERE id = ANY($1) AND status = 'ready' AND deleted_at IS NULL
	`

	rows, err := r.db.Query(query, ids)
	if err != nil {
		r.logger.Error("media_repo_get_by_ids_query_failed",
			"error", err.Error(),
		)
		return nil, nil, err
	}
	defer rows.Close()

	foundIDs := make(map[uuid.UUID]bool)
	var media []domain.MediaFile

	for rows.Next() {
		var m domain.MediaFile
		if err := rows.Scan(
			&m.ID,
			&m.StorageKey,
			&m.OriginalName,
			&m.MimeType,
			&m.Ext,
			&m.SizeBytes,
			&m.StorageDriver,
			&m.Status,
			&m.CreatedAt,
			&m.UpdatedAt,
			&m.DeletedAt,
		); err != nil {
			r.logger.Error("media_repo_get_by_ids_scan_failed",
				"error", err.Error(),
			)
			return nil, nil, err
		}
		media = append(media, m)
		foundIDs[m.ID] = true
	}

	// Find not found IDs
	var notFound []uuid.UUID
	for _, id := range ids {
		if !foundIDs[id] {
			notFound = append(notFound, id)
		}
	}

	r.logger.Info("media_repo_get_by_ids_completed",
		"found", len(media),
		"not_found", len(notFound),
	)

	return media, notFound, nil
}

// UpdateStatus updates the status of a media record
func (r *MediaRepo) UpdateStatus(id uuid.UUID, status domain.MediaFileStatus) error {
	r.logger.Info("media_repo_update_status_started",
		"id", id,
		"status", status,
	)

	_, err := r.db.Exec(`
		UPDATE media
		SET status = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`, status, id)

	if err != nil {
		r.logger.Error("media_repo_update_status_failed",
			"id", id,
			"status", status,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("media_repo_update_status_completed",
		"id", id,
		"status", status,
	)

	return nil
}

// UpdateSizeBytes updates the size of a media record
func (r *MediaRepo) UpdateSizeBytes(id uuid.UUID, sizeBytes int64) error {
	r.logger.Info("media_repo_update_size_started",
		"id", id,
		"size_bytes", sizeBytes,
	)

	_, err := r.db.Exec(`
		UPDATE media
		SET size_bytes = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`, sizeBytes, id)

	if err != nil {
		r.logger.Error("media_repo_update_size_failed",
			"id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("media_repo_update_size_completed",
		"id", id,
		"size_bytes", sizeBytes,
	)

	return nil
}

// SoftDelete marks a media record as deleted
func (r *MediaRepo) SoftDelete(id uuid.UUID) error {
	r.logger.Info("media_repo_soft_delete_started",
		"id", id,
	)

	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE media
		SET status = $1, deleted_at = $2, updated_at = $2
		WHERE id = $3 AND deleted_at IS NULL
	`, domain.MediaFileStatusDeleted, now, id)

	if err != nil {
		r.logger.Error("media_repo_soft_delete_failed",
			"id", id,
			"error", err.Error(),
		)
		return err
	}

	r.logger.Info("media_repo_soft_delete_completed",
		"id", id,
	)

	return nil
}

// List returns media records with optional filters
func (r *MediaRepo) List(status *string, limit, offset int) ([]domain.MediaFile, error) {
	r.logger.Info("media_repo_list_started",
		"status", status,
		"limit", limit,
		"offset", offset,
	)

	var query string
	var args []interface{}

	if status != nil {
		query = `
			SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
			FROM media
			WHERE status = $1 AND deleted_at IS NULL
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []interface{}{*status, limit, offset}
	} else {
		query = `
			SELECT id, storage_key, original_name, mime_type, ext, size_bytes, storage_driver, status, created_at, updated_at, deleted_at
			FROM media
			WHERE deleted_at IS NULL
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		args = []interface{}{limit, offset}
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		r.logger.Error("media_repo_list_query_failed",
			"error", err.Error(),
		)
		return nil, err
	}
	defer rows.Close()

	var media []domain.MediaFile
	for rows.Next() {
		var m domain.MediaFile
		if err := rows.Scan(
			&m.ID,
			&m.StorageKey,
			&m.OriginalName,
			&m.MimeType,
			&m.Ext,
			&m.SizeBytes,
			&m.StorageDriver,
			&m.Status,
			&m.CreatedAt,
			&m.UpdatedAt,
			&m.DeletedAt,
		); err != nil {
			r.logger.Error("media_repo_list_scan_failed",
				"error", err.Error(),
			)
			return nil, err
		}
		media = append(media, m)
	}

	r.logger.Info("media_repo_list_completed",
		"count", len(media),
	)

	return media, nil
}
