-- Migrate storage_driver: replace s3 with cloudflare_images
UPDATE media SET storage_driver = 'cloudflare_images' WHERE storage_driver = 's3';

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'media'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%storage_driver%')
  LOOP
    EXECUTE format('ALTER TABLE media DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE media ADD CONSTRAINT media_storage_driver_check
  CHECK (storage_driver IN ('local', 'cloudflare_images'));
