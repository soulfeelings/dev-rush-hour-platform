ALTER TABLE developers ADD COLUMN data JSONB DEFAULT '{}';

UPDATE developers SET data = jsonb_build_object('logoUrl', logo_url) WHERE logo_url IS NOT NULL;

ALTER TABLE developers DROP COLUMN logo_url;
