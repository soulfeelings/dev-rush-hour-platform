-- Drop media table and indexes
DROP INDEX IF EXISTS idx_media_storage_driver;
DROP INDEX IF EXISTS idx_media_deleted_at;
DROP INDEX IF EXISTS idx_media_created_at;
DROP INDEX IF EXISTS idx_media_status;
DROP TABLE IF EXISTS media;
