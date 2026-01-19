-- Добавляем deleted_at во все таблицы
ALTER TABLE developers ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE areas ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE lots ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Создаем индексы для ускорения запросов с deleted_at
CREATE INDEX idx_developers_deleted_at ON developers(deleted_at);
CREATE INDEX idx_areas_deleted_at ON areas(deleted_at);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_lots_deleted_at ON lots(deleted_at);
CREATE INDEX idx_leads_deleted_at ON leads(deleted_at);