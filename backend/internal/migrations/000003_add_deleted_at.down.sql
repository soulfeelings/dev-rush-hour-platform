-- Удаляем индексы
DROP INDEX IF EXISTS idx_developers_deleted_at;
DROP INDEX IF EXISTS idx_areas_deleted_at;
DROP INDEX IF EXISTS idx_projects_deleted_at;
DROP INDEX IF EXISTS idx_lots_deleted_at;
DROP INDEX IF EXISTS idx_leads_deleted_at;

-- Удаляем колонки
ALTER TABLE developers DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE areas DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE projects DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE lots DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE leads DROP COLUMN IF EXISTS deleted_at;