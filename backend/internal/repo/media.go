package repo

import (
	"context"
	"errors"
	"log/slog"
	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/sqlc/sqlcgen"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MediaRepo struct {
	queries *sqlcgen.Queries
	logger  *slog.Logger
}

func NewMediaRepo(pool *pgxpool.Pool) *MediaRepo {
	return &MediaRepo{
		queries: sqlcgen.New(pool),
		logger:  slog.Default(),
	}
}

// Create inserts a new media record
func (r *MediaRepo) Create(media *domain.MediaFile) error {
	r.logger.Info("media_repo_create_started", "storage_key", media.StorageKey, "mime_type", media.MimeType)

	row, err := r.queries.CreateMedia(context.Background(), sqlcgen.CreateMediaParams{
		StorageKey:    media.StorageKey,
		OriginalName:  stringPtrToText(media.OriginalName),
		MimeType:      media.MimeType,
		Ext:           media.Ext,
		SizeBytes:     int64PtrToInt8(media.SizeBytes),
		StorageDriver: string(media.StorageDriver),
		Status:        string(media.Status),
	})
	if err != nil {
		r.logger.Error("media_repo_create_failed", "storage_key", media.StorageKey, "error", err.Error())
		return err
	}

	media.ID = row.ID
	media.CreatedAt = tstzToTime(row.CreatedAt)
	media.UpdatedAt = tstzToTime(row.UpdatedAt)

	r.logger.Info("media_repo_create_completed", "id", media.ID, "storage_key", media.StorageKey)
	return nil
}

// GetByID retrieves a media record by ID
func (r *MediaRepo) GetByID(id uuid.UUID) (*domain.MediaFile, error) {
	r.logger.Info("media_repo_get_by_id_started", "id", id)

	row, err := r.queries.GetMediaByID(context.Background(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("media_repo_get_by_id_not_found", "id", id)
			return nil, nil
		}
		r.logger.Error("media_repo_get_by_id_failed", "id", id, "error", err.Error())
		return nil, err
	}

	media := sqlcMediaToDomain(row)
	r.logger.Info("media_repo_get_by_id_completed", "id", id, "storage_key", media.StorageKey)
	return media, nil
}

// GetByStorageKey retrieves a media record by storage key
func (r *MediaRepo) GetByStorageKey(key string) (*domain.MediaFile, error) {
	r.logger.Info("media_repo_get_by_storage_key_started", "storage_key", key)

	row, err := r.queries.GetMediaByStorageKey(context.Background(), key)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			r.logger.Info("media_repo_get_by_storage_key_not_found", "storage_key", key)
			return nil, nil
		}
		r.logger.Error("media_repo_get_by_storage_key_failed", "storage_key", key, "error", err.Error())
		return nil, err
	}

	media := sqlcMediaToDomain(row)
	r.logger.Info("media_repo_get_by_storage_key_completed", "storage_key", key, "id", media.ID)
	return media, nil
}

// GetByIDs retrieves multiple media records by IDs
func (r *MediaRepo) GetByIDs(ids []uuid.UUID) ([]domain.MediaFile, []uuid.UUID, error) {
	r.logger.Info("media_repo_get_by_ids_started", "count", len(ids))

	if len(ids) == 0 {
		return []domain.MediaFile{}, []uuid.UUID{}, nil
	}

	rows, err := r.queries.GetMediaByIDs(context.Background(), ids)
	if err != nil {
		r.logger.Error("media_repo_get_by_ids_query_failed", "error", err.Error())
		return nil, nil, err
	}

	foundIDs := make(map[uuid.UUID]bool)
	media := make([]domain.MediaFile, len(rows))
	for i, row := range rows {
		m := sqlcMediaToDomain(row)
		media[i] = *m
		foundIDs[m.ID] = true
	}

	// Find not found IDs
	var notFound []uuid.UUID
	for _, id := range ids {
		if !foundIDs[id] {
			notFound = append(notFound, id)
		}
	}

	r.logger.Info("media_repo_get_by_ids_completed", "found", len(media), "not_found", len(notFound))
	return media, notFound, nil
}

// UpdateStatus updates the status of a media record
func (r *MediaRepo) UpdateStatus(id uuid.UUID, status domain.MediaFileStatus) error {
	r.logger.Info("media_repo_update_status_started", "id", id, "status", status)

	if err := r.queries.UpdateMediaStatus(context.Background(), sqlcgen.UpdateMediaStatusParams{
		Status: string(status),
		ID:     id,
	}); err != nil {
		r.logger.Error("media_repo_update_status_failed", "id", id, "status", status, "error", err.Error())
		return err
	}

	r.logger.Info("media_repo_update_status_completed", "id", id, "status", status)
	return nil
}

// UpdateSizeBytes updates the size of a media record
func (r *MediaRepo) UpdateSizeBytes(id uuid.UUID, sizeBytes int64) error {
	r.logger.Info("media_repo_update_size_started", "id", id, "size_bytes", sizeBytes)

	if err := r.queries.UpdateMediaSizeBytes(context.Background(), sqlcgen.UpdateMediaSizeBytesParams{
		SizeBytes: int64ToInt8(sizeBytes),
		ID:        id,
	}); err != nil {
		r.logger.Error("media_repo_update_size_failed", "id", id, "error", err.Error())
		return err
	}

	r.logger.Info("media_repo_update_size_completed", "id", id, "size_bytes", sizeBytes)
	return nil
}

// SoftDelete marks a media record as deleted
func (r *MediaRepo) SoftDelete(id uuid.UUID) error {
	r.logger.Info("media_repo_soft_delete_started", "id", id)

	now := time.Now()
	if err := r.queries.SoftDeleteMedia(context.Background(), sqlcgen.SoftDeleteMediaParams{
		Status:    string(domain.MediaFileStatusDeleted),
		DeletedAt: pgtype.Timestamptz{Time: now, Valid: true},
		ID:        id,
	}); err != nil {
		r.logger.Error("media_repo_soft_delete_failed", "id", id, "error", err.Error())
		return err
	}

	r.logger.Info("media_repo_soft_delete_completed", "id", id)
	return nil
}

// List returns media records with optional filters
func (r *MediaRepo) List(status *string, limit, offset int) ([]domain.MediaFile, error) {
	r.logger.Info("media_repo_list_started", "status", status, "limit", limit, "offset", offset)

	var rows []sqlcgen.Medium
	var err error

	if status != nil {
		rows, err = r.queries.ListMediaWithStatus(context.Background(), sqlcgen.ListMediaWithStatusParams{
			Status: *status,
			Limit:  int32(limit),
			Offset: int32(offset),
		})
	} else {
		rows, err = r.queries.ListMedia(context.Background(), sqlcgen.ListMediaParams{
			Limit:  int32(limit),
			Offset: int32(offset),
		})
	}

	if err != nil {
		r.logger.Error("media_repo_list_query_failed", "error", err.Error())
		return nil, err
	}

	media := make([]domain.MediaFile, len(rows))
	for i, row := range rows {
		media[i] = *sqlcMediaToDomain(row)
	}

	r.logger.Info("media_repo_list_completed", "count", len(media))
	return media, nil
}

// sqlcMediaToDomain converts sqlcgen.Medium to domain.MediaFile
func sqlcMediaToDomain(row sqlcgen.Medium) *domain.MediaFile {
	return &domain.MediaFile{
		ID:            row.ID,
		StorageKey:    row.StorageKey,
		OriginalName:  textToStringPtr(row.OriginalName),
		MimeType:      row.MimeType,
		Ext:           row.Ext,
		SizeBytes:     int8ToInt64Ptr(row.SizeBytes),
		StorageDriver: domain.StorageDriver(row.StorageDriver),
		Status:        domain.MediaFileStatus(row.Status),
		CreatedAt:     tstzToTime(row.CreatedAt),
		UpdatedAt:     tstzToTime(row.UpdatedAt),
		DeletedAt:     tstzToTimePtr(row.DeletedAt),
	}
}
