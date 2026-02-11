ALTER TABLE developers ADD COLUMN logo_url TEXT;

UPDATE developers SET logo_url = data->>'logoUrl' WHERE data->>'logoUrl' IS NOT NULL;

ALTER TABLE developers DROP COLUMN data;
