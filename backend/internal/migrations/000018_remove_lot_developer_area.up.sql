-- Remove developer_id and area_id from lots table
ALTER TABLE lots DROP COLUMN IF EXISTS developer_id;
ALTER TABLE lots DROP COLUMN IF EXISTS area_id;
