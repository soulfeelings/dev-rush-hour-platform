-- Remove status column from badges
DROP INDEX IF EXISTS idx_badges_status;
ALTER TABLE badges DROP COLUMN IF EXISTS status;

-- Remove status column from cities
ALTER TABLE cities DROP COLUMN IF EXISTS status;

-- Remove status column from infrastructures
DROP INDEX IF EXISTS idx_infrastructures_status;
ALTER TABLE infrastructures DROP COLUMN IF EXISTS status;
