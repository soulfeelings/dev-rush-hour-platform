-- Re-add status column to badges
ALTER TABLE badges ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';
CREATE INDEX idx_badges_status ON badges(status) WHERE deleted_at IS NULL;

-- Re-add status column to cities
ALTER TABLE cities ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';

-- Re-add status column to infrastructures
ALTER TABLE infrastructures ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';
CREATE INDEX idx_infrastructures_status ON infrastructures(status) WHERE deleted_at IS NULL;
