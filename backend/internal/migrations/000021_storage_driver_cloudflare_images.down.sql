-- Revert: restore s3 in constraint
UPDATE media SET storage_driver = 's3' WHERE storage_driver = 'cloudflare_images';

ALTER TABLE media DROP CONSTRAINT IF EXISTS media_storage_driver_check;
ALTER TABLE media ADD CONSTRAINT media_storage_driver_check
  CHECK (storage_driver IN ('local', 's3'));
