-- Re-add developer_id and area_id to lots table
ALTER TABLE lots ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES developers(id);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);
