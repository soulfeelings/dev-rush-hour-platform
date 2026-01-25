-- Remove city_id column from areas
ALTER TABLE areas DROP COLUMN IF EXISTS city_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_areas_city_id;
DROP INDEX IF EXISTS idx_cities_deleted_at;

-- Drop cities table
DROP TABLE IF EXISTS cities;
